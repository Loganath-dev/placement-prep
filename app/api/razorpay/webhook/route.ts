import { NextResponse } from "next/server"
import { resolveRazorpayOrderPlan } from "@/lib/subscriptions/plans"
import { getRazorpayWebhookSecretOrNull } from "@/lib/env"
import { captureError, logger } from "@/lib/logger"
import { hmacSha256Hex, timingSafeStringEqual } from "@/lib/crypto/edge-hmac"
import { grantPremiumForPayment, recordAffiliateCommission, recordPaymentOnce } from "@/lib/entitlement"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "edge"

type RazorpayPaymentEntity = {
  id?: string
  order_id?: string
  amount?: number
  currency?: string
  status?: string
  notes?: Record<string, string | undefined>
}
type RazorpayWebhookEvent = {
  event?: string
  payload?: {
    payment?: { entity?: RazorpayPaymentEntity }
    order?: { entity?: RazorpayPaymentEntity }
  }
}

/**
 * Reconcile signed Razorpay capture webhooks. Never trust event notes alone:
 * fetch the order and payment from Razorpay before applying a ledger grant.
 */
export async function POST(request: Request) {
  const secret = getRazorpayWebhookSecretOrNull()
  if (!secret) return NextResponse.json({ error: "Razorpay webhook secret is not configured." }, { status: 500 })

  const declaredLength = Number(request.headers.get("content-length") ?? 0)
  if (Number.isFinite(declaredLength) && declaredLength > 1_000_000) {
    return NextResponse.json({ error: "Webhook payload is too large." }, { status: 413 })
  }
  const rawBody = await request.text()
  if (rawBody.length > 1_000_000) return NextResponse.json({ error: "Webhook payload is too large." }, { status: 413 })

  const signature = request.headers.get("x-razorpay-signature") ?? ""
  if (!/^[a-f0-9]{64}$/i.test(signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 })
  }
  const expected = await hmacSha256Hex(secret, rawBody)
  if (!timingSafeStringEqual(expected, signature.toLowerCase())) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 })
  }

  let event: RazorpayWebhookEvent
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 })
  }

  const eventName = typeof event.event === "string" ? event.event : ""
  if (eventName !== "payment.captured" && eventName !== "order.paid") {
    return NextResponse.json({ ok: true, event: eventName || "ignored" })
  }

  const payment = event.payload?.payment?.entity
  const eventOrder = event.payload?.order?.entity
  const userIdFromEvent = eventOrder?.notes?.user_id
  const paymentId = payment?.id
  const orderId = payment?.order_id ?? eventOrder?.id
  const amount = payment?.amount ?? eventOrder?.amount
  const currency = payment?.currency ?? eventOrder?.currency

  if (!paymentId || currency !== "INR" || payment?.status !== "captured" || !orderId || !Number.isInteger(amount)) {
    return NextResponse.json({ ok: true, event: eventName, skipped: true })
  }

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) return NextResponse.json({ error: "Razorpay credentials missing." }, { status: 503 })
  const authorization = `Basic ${btoa(`${keyId}:${keySecret}`)}`

  let orderResponse: Response
  try {
    orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: authorization },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    })
  } catch {
    return NextResponse.json({ error: "Order lookup temporarily unavailable; retry expected." }, { status: 503 })
  }
  if (!orderResponse.ok) return NextResponse.json({ error: "Order lookup failed." }, { status: 502 })
  const trustedOrder = await orderResponse.json().catch(() => null)
  if (!trustedOrder || typeof trustedOrder !== "object") {
    return NextResponse.json({ error: "Invalid order response from Razorpay." }, { status: 502 })
  }

  const userId = trustedOrder?.notes?.user_id
  const plan = resolveRazorpayOrderPlan(trustedOrder)
  if (
    typeof userId !== "string" || !plan || trustedOrder.id !== orderId ||
    trustedOrder.amount !== amount || trustedOrder.currency !== currency ||
    (userIdFromEvent && userIdFromEvent !== userId)
  ) {
    return NextResponse.json({ error: "Order mismatch." }, { status: 400 })
  }

  let paymentResponse: Response
  try {
    paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: authorization },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    })
  } catch {
    return NextResponse.json({ error: "Payment lookup temporarily unavailable; retry expected." }, { status: 503 })
  }
  if (!paymentResponse.ok) return NextResponse.json({ error: "Payment lookup failed." }, { status: 502 })
  const trustedPayment = await paymentResponse.json().catch(() => null)
  if (
    !trustedPayment || trustedPayment.id !== paymentId || trustedPayment.order_id !== orderId ||
    trustedPayment.status !== "captured" || trustedPayment.amount !== amount ||
    trustedPayment.currency !== currency
  ) {
    return NextResponse.json({ error: "Payment mismatch." }, { status: 400 })
  }

  const admin = createAdminClient()
  try {
    const recorded = await recordPaymentOnce(admin, {
      paymentId, orderId, userId, amount: amount as number, currency, source: "webhook",
    })
    if (recorded === "replayed-by-other-user") {
      captureError(new Error("Payment already consumed by another user"), { scope: "razorpay/webhook", paymentId, userId })
      return NextResponse.json({ ok: false, event: eventName, skipped: true })
    }

    await grantPremiumForPayment(admin, { paymentId, userId, days: plan.entitlementDays })
    await recordAffiliateCommission(admin, {
      userId,
      paymentId,
      paymentAmount: amount as number,
      commissionAmount: plan.affiliateCommissionPaise,
      planKey: plan.planKey,
    })

    logger.info("[webhook] premium activation handled", { event: eventName, userId })
    return NextResponse.json({ ok: true, event: eventName })
  } catch (error) {
    captureError(error, { scope: "razorpay/webhook", stage: "activation", paymentId, userId })
    return NextResponse.json({ error: "Activation failed, retry expected." }, { status: 500 })
  }
}

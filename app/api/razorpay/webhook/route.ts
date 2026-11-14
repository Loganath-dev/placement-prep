import { NextResponse } from "next/server"
import { isSupportedPurchaseAmount, resolveRazorpayOrderPlan } from "@/lib/subscriptions/plans"
import { getRazorpayWebhookSecretOrNull } from "@/lib/env"
import { captureError, logger } from "@/lib/logger"
import { hmacSha256Hex, timingSafeStringEqual } from "@/lib/crypto/edge-hmac"
import { grantPremiumForPayment, recordAffiliateCommission, recordPaymentOnce } from "@/lib/entitlement"
import { createAdminClient } from "@/lib/supabase/admin"

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
 * Razorpay webhook — server-side reconciliation for premium activation.
 * This fires even if the user's browser tab was closed after payment,
 * guaranteeing premium is activated via the notes.user_id embedded at order
 * creation. Shares the payment ledger and payment-keyed entitlement RPC with
 * checkout verification so retries never extend the same purchase twice.
 */
export async function POST(request: Request) {
  const secret = getRazorpayWebhookSecretOrNull()
  if (!secret) {
    return NextResponse.json(
      { error: "Razorpay webhook secret is not configured." },
      { status: 500 },
    )
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0)
  if (Number.isFinite(declaredLength) && declaredLength > 1_000_000) {
    return NextResponse.json({ error: "Webhook payload is too large." }, { status: 413 })
  }
  const rawBody = await request.text()
  if (rawBody.length > 1_000_000) {
    return NextResponse.json({ error: "Webhook payload is too large." }, { status: 413 })
  }
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
  const eventName: string = typeof event.event === "string" ? event.event : ""

  // Note: we do NOT reject "old" events. The HMAC signature already guarantees
  // authenticity, and Razorpay legitimately retries a signed delivery for hours
  // with backoff. Re-applying a signed activation is harmless because both the
  // ledger insert and the grant are idempotent.

  if (eventName !== "payment.captured" && eventName !== "order.paid") {
    return NextResponse.json({ ok: true, event: eventName || "ignored" })
  }

  const payment = event.payload?.payment?.entity
  const order = event.payload?.order?.entity
  const userIdFromEvent: string | undefined = order?.notes?.user_id
  const paymentId: string | undefined = payment?.id
  const orderId: string | undefined = payment?.order_id ?? order?.id
  const amount: number | undefined = payment?.amount ?? order?.amount
  const currency: string | undefined = payment?.currency ?? order?.currency
  if (!paymentId) {
    // Not one of our premium orders (no embedded user) — acknowledge and skip.
    return NextResponse.json({ ok: true, event: eventName, skipped: true })
  }

  if (
    currency !== "INR" ||
    payment?.status !== "captured" ||
    !orderId ||
    !Number.isInteger(amount)
  ) {
    console.warn("[webhook] Payment is not captured or does not match a supported plan:", { paymentId, amount, currency, status: payment?.status })
    return NextResponse.json({ ok: true, event: eventName, skipped: true })
  }
  if (!isSupportedPurchaseAmount(amount)) {
    return NextResponse.json({ ok: true, event: eventName, skipped: true })
  }

  // Resolve ownership from the authenticated Razorpay order API, not payment notes.
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) return NextResponse.json({ error: "Razorpay credentials missing." }, { status: 503 })
  const auth = `Basic ${btoa(`${keyId}:${keySecret}`)}`
  let orderResponse: Response
  try {
    orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: auth }, cache: "no-store", signal: AbortSignal.timeout(12_000),
    })
  } catch {
    return NextResponse.json({ error: "Order lookup temporarily unavailable; retry expected." }, { status: 503 })
  }
  if (!orderResponse.ok) return NextResponse.json({ error: "Order lookup failed." }, { status: 502 })
  const trustedOrder = await orderResponse.json().catch(() => null)
  if (!trustedOrder || typeof trustedOrder !== "object") {
    return NextResponse.json({ error: "Invalid order response from Razorpay." }, { status: 502 })
  }
  const userId: string | undefined = trustedOrder?.notes?.user_id
  const trustedPlan = resolveRazorpayOrderPlan(trustedOrder)
  if (!userId || !trustedPlan || trustedOrder.id !== orderId || trustedOrder.amount !== amount || trustedOrder.currency !== currency || (userIdFromEvent && userIdFromEvent !== userId)) {
    return NextResponse.json({ error: "Order mismatch." }, { status: 400 })
  }
  let paymentResponse: Response
  try {
    paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: auth }, cache: "no-store", signal: AbortSignal.timeout(12_000),
    })
  } catch {
    return NextResponse.json({ error: "Payment lookup temporarily unavailable; retry expected." }, { status: 503 })
  }
  if (!paymentResponse.ok) return NextResponse.json({ error: "Payment lookup failed." }, { status: 502 })
  const trustedPayment = await paymentResponse.json().catch(() => null)
  if (!trustedPayment || trustedPayment.id !== paymentId || trustedPayment.order_id !== orderId || trustedPayment.status !== "captured" || trustedPayment.amount !== amount || trustedPayment.currency !== currency) {
    return NextResponse.json({ error: "Payment mismatch." }, { status: 400 })
  }
  const verifiedAmount = amount as number
  const verifiedCurrency = currency as string
  const admin = createAdminClient()
  try {
    const recorded = await recordPaymentOnce(admin, {
      paymentId,
      orderId,
      userId,
      amount: verifiedAmount,
      currency: verifiedCurrency,
      source: "webhook",
      planKey: trustedPlan.planKey,
    })
    if (recorded === "replayed-by-other-user") {
      // Ledger says this payment was consumed by a different account — never
      // expected from a signed Razorpay delivery; capture loudly, don't retry.
      captureError(new Error("Payment already consumed by another user"), {
        scope: "razorpay/webhook",
        paymentId,
        userId,
      })
      return NextResponse.json({ ok: false, event: eventName, skipped: true })
    }

    await grantPremiumForPayment(admin, {
      paymentId,
      userId,
      days: trustedPlan.entitlementDays,
    })

    await recordAffiliateCommission(admin, {
      userId,
      paymentId,
      paymentAmount: verifiedAmount,
      commissionAmount: trustedPlan.affiliateCommissionPaise,
      planKey: trustedPlan.planKey,
    })

    logger.info("[webhook] premium activation handled", { event: eventName, userId })
    return NextResponse.json({ ok: true, event: eventName })
  } catch (error) {
    // Transient DB failure: return 5xx so Razorpay retries the signed delivery.
    // The payment-keyed entitlement RPC makes retries safe without granting twice.
    captureError(error, { scope: "razorpay/webhook", stage: "activation", paymentId, userId })
    return NextResponse.json(
      { error: "Activation failed, retry expected." },
      { status: 500 },
    )
  }
}

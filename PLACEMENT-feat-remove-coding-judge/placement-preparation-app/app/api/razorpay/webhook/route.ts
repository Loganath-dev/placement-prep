import { NextResponse } from "next/server"
import { PREMIUM_PRICE_INR, PREMIUM_DURATION_DAYS } from "@/lib/access"
import { getRazorpayWebhookSecretOrNull } from "@/lib/env"
import { captureError, logger } from "@/lib/logger"
import { hmacSha256Hex, timingSafeStringEqual } from "@/lib/crypto/edge-hmac"
import { grantPremiumForPayment, recordPaymentOnce } from "@/lib/entitlement"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "edge"

type RazorpayEvent = {
  event?: string
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; amount?: number; currency?: string; notes?: Record<string, string> } }
    order?: { entity?: { id?: string; amount?: number; currency?: string; notes?: Record<string, string> } }
    refund?: { entity?: { payment_id?: string; amount?: number } }
  }
}

export async function POST(request: Request) {
  const secret = getRazorpayWebhookSecretOrNull()
  if (!secret) return NextResponse.json({ error: "Razorpay webhook secret is not configured." }, { status: 500 })
  const rawBody = await request.text()
  const signature = request.headers.get("x-razorpay-signature") ?? ""
  const expected = await hmacSha256Hex(secret, rawBody)
  if (!signature || !timingSafeStringEqual(expected, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 })
  }

  let event: RazorpayEvent
  try { event = JSON.parse(rawBody) as RazorpayEvent }
  catch { return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 }) }
  const eventName = typeof event.event === "string" ? event.event : ""
  const admin = createAdminClient()

  // Only reconcile after the refund is processed; refund.created may still fail.
  if (eventName === "refund.processed") {
    const paymentId = event.payload?.refund?.entity?.payment_id
    const refundAmount = event.payload?.refund?.entity?.amount
    if (!paymentId || typeof refundAmount !== "number" || !Number.isInteger(refundAmount)) {
      return NextResponse.json({ error: "Refund event is missing its payment ID or amount." }, { status: 400 })
    }
    try {
      const { error } = await admin.rpc("reconcile_refunded_payment", {
        p_payment_id: paymentId, p_refund_amount: refundAmount,
      })
      if (error) throw new Error(error.message)
      return NextResponse.json({ ok: true, event: eventName })
    } catch (error) {
      captureError(error, { scope: "razorpay/webhook", stage: "refund", paymentId })
      return NextResponse.json({ error: "Refund reconciliation failed; retry expected." }, { status: 500 })
    }
  }

  if (eventName !== "payment.captured" && eventName !== "order.paid") {
    return NextResponse.json({ ok: true, event: eventName || "ignored" })
  }

  const payment = event.payload?.payment?.entity
  const order = event.payload?.order?.entity
  const userId = payment?.notes?.user_id ?? order?.notes?.user_id
  const paymentId = payment?.id
  const orderId = payment?.order_id ?? order?.id
  const amount = payment?.amount ?? order?.amount
  const currency = payment?.currency ?? order?.currency
  if (!userId || !paymentId) return NextResponse.json({ ok: true, event: eventName, skipped: true })
  if (amount !== PREMIUM_PRICE_INR * 100 || currency !== "INR") {
    logger.warn("[webhook] Payment amount/currency mismatch", { paymentId, amount, currency })
    return NextResponse.json({ ok: true, event: eventName, skipped: true })
  }

  try {
    const recorded = await recordPaymentOnce(admin, {
      paymentId, orderId: orderId ?? "", userId, amount,
      currency, source: "webhook",
    })
    if (recorded === "replayed-by-other-user") {
      captureError(new Error("Payment already consumed by another user"), {
        scope: "razorpay/webhook", paymentId, userId,
      })
      return NextResponse.json({ ok: false, event: eventName, skipped: true })
    }
    await grantPremiumForPayment(admin, paymentId, userId, PREMIUM_DURATION_DAYS)
    logger.info("[webhook] premium activation handled", { event: eventName, userId })
    return NextResponse.json({ ok: true, event: eventName })
  } catch (error) {
    captureError(error, { scope: "razorpay/webhook", stage: "activation", paymentId, userId })
    return NextResponse.json({ error: "Activation failed, retry expected." }, { status: 500 })
  }
}

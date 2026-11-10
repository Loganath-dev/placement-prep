import { NextResponse } from "next/server"
import { PREMIUM_PRICE_INR, PREMIUM_DURATION_DAYS } from "@/lib/access"
import { getRazorpayEnvOrNull } from "@/lib/env"
import { captureError } from "@/lib/logger"
import { hmacSha256Hex, timingSafeStringEqual } from "@/lib/crypto/edge-hmac"
import { grantPremiumForPayment, recordPaymentOnce } from "@/lib/entitlement"
import { rateLimit } from "@/lib/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const razorpay = getRazorpayEnvOrNull()
  if (!razorpay) return NextResponse.json({ error: "Razorpay keys are not configured." }, { status: 500 })
  const { keyId, keySecret } = razorpay
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const { allowed } = await rateLimit(`verify:${user.id}`, 10, 60 * 60 * 1000)
  if (!allowed) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 })

  const body = await request.json().catch(() => ({}))
  const orderId = String(body.razorpay_order_id ?? "")
  const paymentId = String(body.razorpay_payment_id ?? "")
  const signature = String(body.razorpay_signature ?? "")
  if (!orderId || !paymentId || !signature) return NextResponse.json({ error: "Missing Razorpay verification fields." }, { status: 400 })

  const expected = await hmacSha256Hex(keySecret, `${orderId}|${paymentId}`)
  if (!timingSafeStringEqual(expected, signature)) return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 })

  const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}` }, cache: "no-store",
  })
  if (!orderResponse.ok) return NextResponse.json({ error: "Could not confirm the order with Razorpay. Try again." }, { status: 502 })
  const order = await orderResponse.json()
  if (order?.notes?.user_id !== user.id) return NextResponse.json({ error: "This payment belongs to a different account." }, { status: 403 })
  if (order?.amount !== PREMIUM_PRICE_INR * 100 || order?.currency !== "INR") {
    return NextResponse.json({ error: "Order amount mismatch." }, { status: 400 })
  }

  const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}` }, cache: "no-store",
  })
  if (!paymentResponse.ok) return NextResponse.json({ error: "Could not confirm payment status with Razorpay. Try again." }, { status: 502 })
  const payment = await paymentResponse.json()
  if (payment?.status !== "captured" || payment?.order_id !== orderId ||
      payment?.amount !== order.amount || payment?.currency !== order.currency) {
    return NextResponse.json({ error: "Payment is not captured or does not match this order." }, { status: 400 })
  }

  const admin = createAdminClient()
  try {
    const recorded = await recordPaymentOnce(admin, {
      paymentId, orderId, userId: user.id, amount: order.amount,
      currency: order.currency, source: "verify",
    })
    if (recorded === "replayed-by-other-user") {
      return NextResponse.json({ error: "This payment has already been used." }, { status: 409 })
    }
    const premiumUntil = await grantPremiumForPayment(admin, paymentId, user.id, PREMIUM_DURATION_DAYS)
    return NextResponse.json({ ok: true, paymentId, premiumUntil })
  } catch (error) {
    captureError(error, { scope: "razorpay/verify", stage: "activation", userId: user.id, paymentId })
    return NextResponse.json({ error: "Payment verified but could not activate premium. Contact support." }, { status: 500 })
  }
}

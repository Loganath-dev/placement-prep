import { NextResponse } from "next/server"
import { resolveRazorpayOrderPlan } from "@/lib/subscriptions/plans"
import { getRazorpayEnvOrNull } from "@/lib/env"
import { captureError } from "@/lib/logger"
import { hmacSha256Hex, timingSafeStringEqual } from "@/lib/crypto/edge-hmac"
import { grantPremiumForPayment, recordAffiliateCommission, recordPaymentOnce } from "@/lib/entitlement"
import { rateLimit } from "@/lib/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { hasTrustedRequestOrigin } from "@/lib/security/request-origin"

/**
 * Verifies a Razorpay checkout and activates only a captured, correctly-priced
 * payment belonging to the authenticated user. The final entitlement grant is
 * keyed by payment ID in the database, so verify/webhook retries cannot extend
 * the same purchase more than once.
 */
export async function POST(request: Request) {
  if (!hasTrustedRequestOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 })
  }

  const razorpay = getRazorpayEnvOrNull()
  if (!razorpay) {
    return NextResponse.json(
      { error: "Razorpay keys are not configured." },
      { status: 500 },
    )
  }
  const { keyId, keySecret } = razorpay

  // 1. Authenticate the caller from the session cookie.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  const { allowed } = await rateLimit(`verify:${user.id}`, 10, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 })
  }

  // 2. Verify the checkout signature.
  const bodyValue: unknown = await request.json().catch(() => null)
  const body = bodyValue && typeof bodyValue === "object" && !Array.isArray(bodyValue)
    ? bodyValue as Record<string, unknown>
    : {}
  const orderId = typeof body.razorpay_order_id === "string" ? body.razorpay_order_id : ""
  const paymentId = typeof body.razorpay_payment_id === "string" ? body.razorpay_payment_id : ""
  const signature = typeof body.razorpay_signature === "string" ? body.razorpay_signature : ""
  if (!/^order_[A-Za-z0-9]+$/.test(orderId) || !/^pay_[A-Za-z0-9]+$/.test(paymentId) || !/^[a-f0-9]{64}$/i.test(signature)) {
    return NextResponse.json({ error: "Missing Razorpay verification fields." }, { status: 400 })
  }

  const expected = await hmacSha256Hex(keySecret, `${orderId}|${paymentId}`)
  if (!timingSafeStringEqual(expected, signature)) {
    return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 })
  }

  // 3. Confirm with Razorpay that this order is ours, for this user, at the
  //    right price. notes.user_id was embedded at order creation.
  let orderResponse: Response
  try {
    orderResponse = await fetch(
      `https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`,
      {
        headers: { Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}` },
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      },
    )
  } catch {
    return NextResponse.json({ error: "Razorpay order lookup timed out. Please retry." }, { status: 502 })
  }
  if (!orderResponse.ok) {
    return NextResponse.json(
      { error: "Could not confirm the order with Razorpay. Try again." },
      { status: 502 },
    )
  }
  const order = await orderResponse.json().catch(() => null)
  if (!order || typeof order !== "object") {
    return NextResponse.json({ error: "Razorpay returned an invalid order response." }, { status: 502 })
  }

  if (order?.id !== orderId || order?.notes?.user_id !== user.id) {
    return NextResponse.json(
      { error: "This payment belongs to a different account." },
      { status: 403 },
    )
  }
  const plan = resolveRazorpayOrderPlan(order)
  if (!plan) {
    return NextResponse.json({ error: "Order amount or plan mismatch." }, { status: 400 })
  }

  // A valid checkout signature does not prove the payment has been captured.
  let paymentResponse: Response
  try {
    paymentResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: { Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}` },
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      },
    )
  } catch {
    return NextResponse.json({ error: "Razorpay payment lookup timed out. Please retry." }, { status: 502 })
  }
  if (!paymentResponse.ok) {
    return NextResponse.json(
      { error: "Could not confirm payment status with Razorpay. Try again." },
      { status: 502 },
    )
  }
  const payment = await paymentResponse.json().catch(() => null)
  if (!payment || typeof payment !== "object") {
    return NextResponse.json({ error: "Razorpay returned an invalid payment response." }, { status: 502 })
  }
  if (
    payment?.id !== paymentId ||
    payment?.status !== "captured" ||
    payment?.order_id !== orderId ||
    payment?.amount !== order.amount ||
    payment?.currency !== order.currency
  ) {
    return NextResponse.json(
      { error: "Payment is not captured or does not match this order." },
      { status: 400 },
    )
  }

  // 4. Consume the payment once and grant the entitlement (service role —
  //    entitlement columns are locked to clients by a DB trigger).
  const admin = createAdminClient()
  try {
    const recorded = await recordPaymentOnce(admin, {
      paymentId,
      orderId,
      userId: user.id,
      amount: order.amount,
      currency: order.currency,
      source: "verify",
      planKey: plan.planKey,
    })
    if (recorded === "replayed-by-other-user") {
      return NextResponse.json(
        { error: "This payment has already been used." },
        { status: 409 },
      )
    }

    const premiumUntil = await grantPremiumForPayment(admin, {
      paymentId,
      userId: user.id,
      days: plan.entitlementDays,
    })

    await recordAffiliateCommission(admin, {
      userId: user.id, paymentId, paymentAmount: order.amount,
      commissionAmount: plan.affiliateCommissionPaise, planKey: plan.planKey,
    })

    return NextResponse.json({ ok: true, paymentId, premiumUntil, planKey: plan.planKey })
  } catch (error) {
    captureError(error, { scope: "razorpay/verify", stage: "activation", userId: user.id, paymentId })
    return NextResponse.json(
      { error: "Payment was verified, but account reconciliation is incomplete. Retry verification; do not pay again." },
      { status: 503 },
    )
  }
}

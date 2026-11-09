import { NextResponse } from "next/server"
import { PREMIUM_PRICE_INR } from "@/lib/access"
import { getRazorpayEnvOrNull } from "@/lib/env"
import { captureError } from "@/lib/logger"
import { hmacSha256Hex, timingSafeStringEqual } from "@/lib/crypto/edge-hmac"
import { grantPremiumYear, recordPaymentOnce } from "@/lib/entitlement"
import { rateLimit } from "@/lib/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

/**
 * Verifies a Razorpay payment and activates premium for the caller.
 *
 * The checkout signature (HMAC of `orderId|paymentId`) only proves Razorpay
 * processed a payment for that order — it does NOT prove the order belongs to
 * the caller, was for the right amount, or hasn't been used before. So after
 * the signature check we:
 *   1. fetch the order from Razorpay and assert notes.user_id === caller
 *      and the amount/currency match the premium price,
 *   2. record the payment in the ledger (PK on payment_id rejects replays),
 *   3. grant premium via the service role with never-shorten semantics —
 *      identical to the webhook path.
 */
export async function POST(request: Request) {
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
  const body = await request.json().catch(() => ({}))
  const orderId = String(body.razorpay_order_id ?? "")
  const paymentId = String(body.razorpay_payment_id ?? "")
  const signature = String(body.razorpay_signature ?? "")
  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Missing Razorpay verification fields." }, { status: 400 })
  }

  const expected = await hmacSha256Hex(keySecret, `${orderId}|${paymentId}`)
  if (!timingSafeStringEqual(expected, signature)) {
    return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 })
  }

  // 3. Confirm with Razorpay that this order is ours, for this user, at the
  //    right price. notes.user_id was embedded at order creation.
  const orderResponse = await fetch(
    `https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`,
    {
      headers: { Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}` },
      cache: "no-store",
    },
  )
  if (!orderResponse.ok) {
    return NextResponse.json(
      { error: "Could not confirm the order with Razorpay. Try again." },
      { status: 502 },
    )
  }
  const order = await orderResponse.json()

  if (order?.notes?.user_id !== user.id) {
    return NextResponse.json(
      { error: "This payment belongs to a different account." },
      { status: 403 },
    )
  }
  if (order?.amount !== PREMIUM_PRICE_INR * 100 || order?.currency !== "INR") {
    return NextResponse.json({ error: "Order amount mismatch." }, { status: 400 })
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
    })
    if (recorded === "replayed-by-other-user") {
      return NextResponse.json(
        { error: "This payment has already been used." },
        { status: 409 },
      )
    }

    const premiumUntil = await grantPremiumYear(admin, user.id)
    
    // Process affiliate commission if applicable.
    try {
      const { data: profile } = await admin
        .from("profiles")
        .select("referred_by")
        .eq("id", user.id)
        .maybeSingle()

      if (profile?.referred_by && profile.referred_by !== user.id) {
        const { data: settings } = await admin
          .from("affiliate_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle()

        if (settings?.is_enabled) {
          const commissionRate = settings.default_commission_rate
          const commissionAmount = Math.floor(order.amount * (commissionRate / 100))
          const eligibleDate = new Date()
          eligibleDate.setDate(eligibleDate.getDate() + settings.waiting_period_days)
          
          // Idempotent upsert: if verify + webhook both fire for the same payment,
          // the second call is a no-op. Previously this relied on an accidental
          // unique-constraint violation being silently swallowed by catch.
          await admin.from("affiliate_commissions").upsert({
            referrer_id: profile.referred_by,
            buyer_id: user.id,
            payment_id: paymentId,
            payment_amount: order.amount,
            commission_amount: commissionAmount,
            commission_rate: commissionRate,
            eligible_date: eligibleDate.toISOString(),
            status: "pending",
          }, { onConflict: "payment_id", ignoreDuplicates: true })
        }
      }
    } catch (affiliateError) {
      captureError(affiliateError, { scope: "razorpay/verify", stage: "affiliate", userId: user.id, paymentId })
    }

    return NextResponse.json({ ok: true, paymentId, premiumUntil })
  } catch (error) {
    captureError(error, { scope: "razorpay/verify", stage: "activation", userId: user.id, paymentId })
    return NextResponse.json(
      { error: "Payment verified but could not activate premium. Contact support." },
      { status: 500 },
    )
  }
}

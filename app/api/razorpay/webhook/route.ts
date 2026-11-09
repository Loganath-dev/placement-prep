import { NextResponse } from "next/server"
import { PREMIUM_PRICE_INR } from "@/lib/access"
import { getRazorpayWebhookSecretOrNull } from "@/lib/env"
import { captureError, logger } from "@/lib/logger"
import { hmacSha256Hex, timingSafeStringEqual } from "@/lib/crypto/edge-hmac"
import { grantPremiumYear, recordPaymentOnce } from "@/lib/entitlement"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "edge"

/**
 * Razorpay webhook — server-side reconciliation for premium activation.
 * This fires even if the user's browser tab was closed after payment,
 * guaranteeing premium is activated via the notes.user_id embedded at order
 * creation. Shares recordPaymentOnce/grantPremiumYear with the verify route so
 * both paths are idempotent and never shorten an existing entitlement.
 */
export async function POST(request: Request) {
  const secret = getRazorpayWebhookSecretOrNull()
  if (!secret) {
    return NextResponse.json(
      { error: "Razorpay webhook secret is not configured." },
      { status: 500 },
    )
  }

  const rawBody = await request.text()
  const signature = request.headers.get("x-razorpay-signature") ?? ""
  const expected = await hmacSha256Hex(secret, rawBody)

  if (!signature || !timingSafeStringEqual(expected, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 })
  }

  const event = JSON.parse(rawBody)
  const eventName: string = event.event ?? ""

  // Note: we do NOT reject "old" events. The HMAC signature already guarantees
  // authenticity, and Razorpay legitimately retries a signed delivery for hours
  // with backoff. Re-applying a signed activation is harmless because both the
  // ledger insert and the grant are idempotent.

  if (eventName === "payment.refunded" || eventName === "refund.created") {
    const refundPaymentId = event.payload?.payment?.entity?.id ?? event.payload?.refund?.entity?.payment_id
    if (refundPaymentId) {
      const admin = createAdminClient()
      await admin.from("affiliate_commissions").update({ status: "refunded" }).eq("payment_id", refundPaymentId)
    }
    return NextResponse.json({ ok: true, event: eventName })
  }

  if (eventName !== "payment.captured" && eventName !== "order.paid") {
    return NextResponse.json({ ok: true, event: eventName || "ignored" })
  }

  const payment = event.payload?.payment?.entity
  const order = event.payload?.order?.entity
  const userId: string | undefined = payment?.notes?.user_id ?? order?.notes?.user_id
  const paymentId: string | undefined = payment?.id
  const orderId: string | undefined = payment?.order_id ?? order?.id
  const amount: number | undefined = payment?.amount ?? order?.amount

  if (!userId || !paymentId) {
    // Not one of our premium orders (no embedded user) — acknowledge and skip.
    return NextResponse.json({ ok: true, event: eventName, skipped: true })
  }

  if (typeof amount === "number" && amount !== PREMIUM_PRICE_INR * 100) {
    console.warn("[webhook] Amount mismatch, not granting:", { paymentId, amount })
    return NextResponse.json({ ok: true, event: eventName, skipped: true })
  }

  const admin = createAdminClient()
  try {
    const recorded = await recordPaymentOnce(admin, {
      paymentId,
      orderId: orderId ?? "",
      userId,
      amount: amount ?? PREMIUM_PRICE_INR * 100,
      currency: payment?.currency ?? "INR",
      source: "webhook",
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

    await grantPremiumYear(admin, userId)
    
    // Process affiliate commission if applicable.
    try {
      const { data: profile } = await admin
        .from("profiles")
        .select("referred_by")
        .eq("id", userId)
        .maybeSingle()

      if (profile?.referred_by && profile.referred_by !== userId) {
        const { data: settings } = await admin
          .from("affiliate_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle()

        if (settings?.is_enabled) {
          const commissionRate = settings.default_commission_rate
          const paymentAmount = amount ?? PREMIUM_PRICE_INR * 100
          const commissionAmount = Math.floor(paymentAmount * (commissionRate / 100))
          const eligibleDate = new Date()
          eligibleDate.setDate(eligibleDate.getDate() + settings.waiting_period_days)
          
          // Idempotent upsert — webhook + verify can both fire for the same payment.
          // ON CONFLICT DO NOTHING ensures the second call is a silent no-op rather
          // than an accidental swallowed unique-constraint exception.
          await admin.from("affiliate_commissions").upsert({
            referrer_id: profile.referred_by,
            buyer_id: userId,
            payment_id: paymentId,
            payment_amount: paymentAmount,
            commission_amount: commissionAmount,
            commission_rate: commissionRate,
            eligible_date: eligibleDate.toISOString(),
            status: "pending",
          }, { onConflict: "payment_id", ignoreDuplicates: true })
        }
      }
    } catch (affiliateError) {
      captureError(affiliateError, { scope: "razorpay/webhook", stage: "affiliate", userId, paymentId })
    }

    logger.info("[webhook] premium activation handled", { event: eventName, userId })
    return NextResponse.json({ ok: true, event: eventName })
  } catch (error) {
    // Transient DB failure: return 5xx so Razorpay retries the signed delivery.
    // Both recordPaymentOnce and grantPremiumYear are idempotent, so a retry
    // can only complete the activation, never double-grant.
    captureError(error, { scope: "razorpay/webhook", stage: "activation", paymentId, userId })
    return NextResponse.json(
      { error: "Activation failed, retry expected." },
      { status: 500 },
    )
  }
}

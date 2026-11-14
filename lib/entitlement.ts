// SERVER-ONLY — imports the service-role admin client path. Use only from
// route handlers (verify route, webhook). Edge-runtime safe: plain supabase-js.
import type { SupabaseClient } from "@supabase/supabase-js"

/* eslint-disable @typescript-eslint/no-explicit-any */
type AdminClient = SupabaseClient<any, any, any>

export interface PaymentInput {
  paymentId: string
  orderId: string
  userId: string
  amount: number // paise
  currency: string
  source: "verify" | "webhook"
  planKey: string
}

export type RecordPaymentResult =
  | "recorded" // first time this payment is seen
  | "already-recorded" // same payment, same user — idempotent retry (e.g. webhook + verify race)
  | "replayed-by-other-user" // same payment presented by a different account — reject

const UNIQUE_VIOLATION = "23505"

/**
 * Insert the payment into the ledger exactly once. The primary key on
 * payment_id is the replay guard: a second insert tells us whether it is a
 * harmless retry (same user) or a cross-account replay attack.
 */
export async function recordPaymentOnce(
  admin: AdminClient,
  payment: PaymentInput,
): Promise<RecordPaymentResult> {
  const { error } = await admin.from("payments").insert({
    payment_id: payment.paymentId,
    order_id: payment.orderId,
    user_id: payment.userId,
    amount: payment.amount,
    currency: payment.currency,
    source: payment.source,
    plan_key: payment.planKey,
  })

  if (!error) return "recorded"
  if (error.code !== UNIQUE_VIOLATION) {
    throw new Error(`payments insert failed: ${error.message}`)
  }

  const { data: existing, error: readError } = await admin
    .from("payments")
    .select("user_id")
    .eq("payment_id", payment.paymentId)
    .single()
  if (readError) throw new Error(`payments lookup failed: ${readError.message}`)

  return existing.user_id === payment.userId ? "already-recorded" : "replayed-by-other-user"
}

/** Grant the entitlement exactly once for a ledgered payment (verify/webhook safe). */
export async function grantPremiumForPayment(
  admin: AdminClient,
  input: { paymentId: string; userId: string; days: number | null },
): Promise<string | null> {
  const { data, error } = await admin.rpc("grant_premium_for_payment", {
    p_payment_id: input.paymentId,
    p_user_id: input.userId,
    p_days: input.days,
  })
  if (error) throw new Error(`payment entitlement grant failed: ${error.message}`)
  return data ? new Date(data).toISOString() : null
}

/**
 * Grant a fixed number of Premium days from now, never shortening a longer
 * existing entitlement. Payment routes pass only server-resolved durations.
 */
export async function grantPremiumDays(
  admin: AdminClient,
  userId: string,
  days: number,
): Promise<string> {
  if (!Number.isInteger(days) || days <= 0) throw new Error("Premium duration must be a positive whole number of days")
  const target = new Date()
  target.setDate(target.getDate() + days)

  const { data: existing, error: readError } = await admin
    .from("user_state")
    .select("premium_until")
    .eq("id", userId)
    .maybeSingle()
  if (readError) throw new Error(`user_state read failed: ${readError.message}`)

  const existingUntil = existing?.premium_until ? new Date(existing.premium_until) : null
  const premiumUntil =
    existingUntil && existingUntil > target ? existingUntil : target
  const premiumUntilIso = premiumUntil.toISOString()

  const { error } = await admin
    .from("user_state")
    .upsert({ id: userId, premium: true, premium_until: premiumUntilIso })
  if (error) throw new Error(`user_state entitlement write failed: ${error.message}`)

  return premiumUntilIso
}

/** Preserve lifetime access for old ₹249 orders already in flight. */
export async function grantPremiumLifetime(admin: AdminClient, userId: string): Promise<string | null> {
  const { error } = await admin.from("user_state").upsert({ id: userId, premium: true, premium_until: null })
  if (error) throw new Error(`user_state entitlement write failed: ${error.message}`)
  return null
}

/** Backwards-compatible creator grant wrapper. */
export async function grantPremiumYear(admin: AdminClient, userId: string): Promise<string> {
  return grantPremiumDays(admin, userId, 365)
}

/**
 * Record a plan-specific fixed referral reward after a verified purchase.
 * Errors are thrown so the payment endpoint can return a retryable 5xx.
 */
export async function recordAffiliateCommission(
  admin: AdminClient,
  input: { userId: string; paymentId: string; paymentAmount: number; commissionAmount: number; planKey: string },
): Promise<void> {
  if (input.commissionAmount <= 0) return
  const { data: profile, error: profileError } = await admin
    .from("profiles").select("referred_by").eq("id", input.userId).maybeSingle()
  if (profileError) throw new Error(`referral profile lookup failed: ${profileError.message}`)
  if (!profile?.referred_by || profile.referred_by === input.userId) return
  const { data: affiliate, error: affiliateError } = await admin
    .from("affiliate_accounts").select("status").eq("user_id", profile.referred_by).maybeSingle()
  if (affiliateError) throw new Error(`affiliate account lookup failed: ${affiliateError.message}`)
  if (affiliate?.status !== "active") return
  const { data: settings, error: settingsError } = await admin
    .from("affiliate_settings").select("is_enabled, waiting_period_days").eq("id", 1).maybeSingle()
  if (settingsError) throw new Error(`affiliate settings lookup failed: ${settingsError.message}`)
  if (!settings?.is_enabled) return
  const eligibleDate = new Date()
  eligibleDate.setDate(eligibleDate.getDate() + (settings.waiting_period_days ?? 15))
  const { error } = await admin.from("affiliate_commissions").upsert({
    referrer_id: profile.referred_by,
    buyer_id: input.userId,
    payment_id: input.paymentId,
    payment_amount: input.paymentAmount,
    commission_amount: input.commissionAmount,
    commission_rate: 0,
    plan_key: input.planKey,
    eligible_date: eligibleDate.toISOString(),
    status: "pending",
    notes: `Fixed reward for ${input.planKey}`,
  }, { onConflict: "payment_id", ignoreDuplicates: true })
  if (error) throw new Error(`affiliate commission write failed: ${error.message}`)
}

/**
 * Grant Premium for a small bonus window. Unlike yearly purchases, referral
 * rewards extend from the later of now or the user's current expiry, because
 * this is a bonus on top of any active plan.
 */
export async function grantPremiumMonths(
  admin: AdminClient,
  userId: string,
  months: number,
): Promise<string> {
  const { data: existing, error: readError } = await admin
    .from("user_state")
    .select("premium_until")
    .eq("id", userId)
    .maybeSingle()
  if (readError) throw new Error(`user_state read failed: ${readError.message}`)

  const now = new Date()
  const existingUntil = existing?.premium_until ? new Date(existing.premium_until) : null
  const base = existingUntil && existingUntil > now ? existingUntil : now
  const premiumUntil = new Date(base)
  premiumUntil.setMonth(premiumUntil.getMonth() + months)
  const premiumUntilIso = premiumUntil.toISOString()

  const { error } = await admin
    .from("user_state")
    .upsert({ id: userId, premium: true, premium_until: premiumUntilIso })
  if (error) throw new Error(`user_state entitlement write failed: ${error.message}`)

  return premiumUntilIso
}

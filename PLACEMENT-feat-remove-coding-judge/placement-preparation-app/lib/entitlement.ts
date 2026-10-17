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

/**
 * Grant one year of premium from now, but never shorten an existing longer
 * entitlement (promo grant, still-valid prior purchase). max() also makes
 * retries idempotent: re-running for the same payment never downgrades.
 * Returns the resulting premium_until as an ISO string.
 */
export async function grantPremiumYear(admin: AdminClient, userId: string): Promise<string> {
  const oneYearOut = new Date()
  oneYearOut.setFullYear(oneYearOut.getFullYear() + 1)

  const { data: existing, error: readError } = await admin
    .from("user_state")
    .select("premium_until")
    .eq("id", userId)
    .maybeSingle()
  if (readError) throw new Error(`user_state read failed: ${readError.message}`)

  const existingUntil = existing?.premium_until ? new Date(existing.premium_until) : null
  const premiumUntil =
    existingUntil && existingUntil > oneYearOut ? existingUntil : oneYearOut
  const premiumUntilIso = premiumUntil.toISOString()

  const { error } = await admin
    .from("user_state")
    .upsert({ id: userId, premium: true, premium_until: premiumUntilIso })
  if (error) throw new Error(`user_state entitlement write failed: ${error.message}`)

  return premiumUntilIso
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

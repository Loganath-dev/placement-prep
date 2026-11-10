// SERVER-ONLY — this module is imported by payment route handlers.
import type { SupabaseClient } from "@supabase/supabase-js"

/* eslint-disable @typescript-eslint/no-explicit-any */
type AdminClient = SupabaseClient<any, any, any>

export interface PaymentInput {
  paymentId: string
  orderId: string
  userId: string
  amount: number
  currency: string
  source: "verify" | "webhook"
}

export type RecordPaymentResult = "recorded" | "already-recorded" | "replayed-by-other-user"
const UNIQUE_VIOLATION = "23505"

export async function recordPaymentOnce(admin: AdminClient, payment: PaymentInput): Promise<RecordPaymentResult> {
  const { error } = await admin.from("payments").insert({
    payment_id: payment.paymentId, order_id: payment.orderId, user_id: payment.userId,
    amount: payment.amount, currency: payment.currency, source: payment.source,
  })
  if (!error) return "recorded"
  if (error.code !== UNIQUE_VIOLATION) throw new Error(`payments insert failed: ${error.message}`)
  const { data: existing, error: readError } = await admin.from("payments")
    .select("user_id").eq("payment_id", payment.paymentId).single()
  if (readError) throw new Error(`payments lookup failed: ${readError.message}`)
  return existing.user_id === payment.userId ? "already-recorded" : "replayed-by-other-user"
}

/** Grant a payment's entitlement once using the service-role-only database RPC. */
export async function grantPremiumForPayment(
  admin: AdminClient, paymentId: string, userId: string, days: number | null,
): Promise<string | null> {
  const { data, error } = await admin.rpc("grant_premium_for_payment", {
    p_payment_id: paymentId, p_user_id: userId, p_days: days,
  })
  if (error) throw new Error(`payment entitlement grant failed: ${error.message}`)
  return data ? new Date(data).toISOString() : null
}

/** Backwards-compatible helper for non-payment premium grants. */
export async function grantPremiumYear(admin: AdminClient, userId: string): Promise<string> {
  const target = new Date()
  target.setFullYear(target.getFullYear() + 1)
  const { data: existing, error: readError } = await admin.from("user_state")
    .select("premium_until").eq("id", userId).maybeSingle()
  if (readError) throw new Error(`user_state read failed: ${readError.message}`)
  const current = existing?.premium_until ? new Date(existing.premium_until) : null
  const expiry = current && current > target ? current : target
  const iso = expiry.toISOString()
  const { error } = await admin.from("user_state").upsert({ id: userId, premium: true, premium_until: iso })
  if (error) throw new Error(`user_state entitlement write failed: ${error.message}`)
  return iso
}

export async function grantPremiumMonths(admin: AdminClient, userId: string, months: number): Promise<string> {
  const { data: existing, error: readError } = await admin.from("user_state")
    .select("premium_until").eq("id", userId).maybeSingle()
  if (readError) throw new Error(`user_state read failed: ${readError.message}`)
  const now = new Date()
  const current = existing?.premium_until ? new Date(existing.premium_until) : null
  const expiry = new Date(current && current > now ? current : now)
  expiry.setMonth(expiry.getMonth() + months)
  const iso = expiry.toISOString()
  const { error } = await admin.from("user_state").upsert({ id: userId, premium: true, premium_until: iso })
  if (error) throw new Error(`user_state entitlement write failed: ${error.message}`)
  return iso
}

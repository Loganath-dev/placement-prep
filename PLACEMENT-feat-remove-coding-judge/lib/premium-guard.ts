// SERVER-ONLY. The canonical server-side entitlement check.
//
// The client's `state.premium` is only a UI echo — it is reconciled from this
// same source (user_state) on every hydrate and can never be written by the
// client (DB trigger). Any server route that exposes a premium-only resource
// should gate on `requirePremium()` here, so the server, not the browser, is
// the authority on what a user is allowed to receive.

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isCreatorEmail } from "@/lib/creators"

export type EntitlementSource = "creator" | "purchase" | "free"

export interface Entitlement {
  userId: string
  email?: string
  /** True only when premium is set AND not expired. */
  premium: boolean
  premiumUntil: string | null
  source: EntitlementSource
}

interface UserStateEntitlementRow {
  premium: boolean | null
  premium_until: string | null
}

/**
 * Pure expiry rule: premium is active only when the flag is set AND the expiry
 * is absent or still in the future. Extracted so it can be unit-tested without a
 * database. An unparseable `premiumUntil` is treated as expired (fail closed).
 */
export function isPremiumActive(
  premium: boolean | null | undefined,
  premiumUntil: string | null | undefined,
  now: number = Date.now(),
): boolean {
  if (!premium) return false
  if (!premiumUntil) return true
  const expiresAt = Date.parse(premiumUntil)
  if (Number.isNaN(expiresAt)) return false
  return expiresAt > now
}

/**
 * Read the authoritative entitlement for the signed-in user, or null when no
 * session. Reads the user's own user_state row through the RLS server client —
 * no service role needed for a self-read. Expiry is normalised here so callers
 * never have to re-check `premium_until`.
 */
export async function readEntitlement(): Promise<Entitlement | null> {
  const sb = await createClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return null

  const { data } = await sb
    .from("user_state")
    .select("premium, premium_until")
    .eq("id", user.id)
    .maybeSingle()

  const { data: creatorGrant } = await sb
    .from("creator_access")
    .select("user_id, expires_at")
    .eq("user_id", user.id)
    .maybeSingle()

  const row = data as UserStateEntitlementRow | null
  const premiumUntil = row?.premium_until ?? null
  const internalCreator = isCreatorEmail(user.email)
  const inviteExpiry = creatorGrant?.expires_at ?? null
  const activeInvite = Boolean(inviteExpiry && Date.parse(inviteExpiry) > Date.now())
  const creator = internalCreator || activeInvite
  const active = creator || isPremiumActive(row?.premium, premiumUntil)

  return {
    userId: user.id,
    email: user.email ?? undefined,
    premium: active,
    premiumUntil: internalCreator ? null : activeInvite ? inviteExpiry : premiumUntil,
    source: creator ? "creator" : active ? "purchase" : "free",
  }
}

/**
 * Route guard: returns the entitlement when the caller is a premium user, or a
 * ready-to-return NextResponse (401 when unauthenticated, 402 when not premium).
 *
 *   const gate = await requirePremium()
 *   if (gate instanceof NextResponse) return gate
 *   // ...gate.userId is a confirmed premium user
 */
export async function requirePremium(): Promise<Entitlement | NextResponse> {
  const ent = await readEntitlement()
  if (!ent) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }
  if (!ent.premium) {
    return NextResponse.json({ error: "Premium required." }, { status: 402 })
  }
  return ent
}

// SERVER-ONLY. The canonical server-side entitlement check.
//
// The client's `state.premium` is only a UI echo — it is reconciled from this
// same source (user_state) on every hydrate and can never be written by the
// client (DB trigger). Any server route that exposes a premium-only resource
// should gate on `requirePremium()` here, so the server, not the browser, is
// the authority on what a user is allowed to receive.

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isCreatorUser } from "@/lib/creators"

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
 * session. Prefer the user's RLS-scoped read and use a user-ID-filtered
 * service-role read only as a recovery path. Database failures never become a
 * false Free result.
 */
export class EntitlementUnavailableError extends Error {
  readonly code = "ENTITLEMENT_UNAVAILABLE"

  constructor() {
    super("Your subscription status could not be verified right now.")
    this.name = "EntitlementUnavailableError"
  }
}

/**
 * Read an entitlement without ever translating a database/network failure into
 * Free access. The authenticated RLS read is preferred; a narrowly scoped
 * service-role read is used only as a recovery path for the same authenticated
 * user. If both reads fail, callers receive an availability error (not Free).
 */
export async function readEntitlement(): Promise<Entitlement | null> {
  try {
    const sb = await createClient()
    const { data: authData, error: authError } = await sb.auth.getUser()
    if (authError) throw authError
    const user = authData.user
    if (!user) return null

    const [stateResult, creatorResult] = await Promise.all([
      sb.from("user_state").select("premium, premium_until").eq("id", user.id).maybeSingle(),
      sb.from("creator_access").select("user_id, expires_at").eq("user_id", user.id).maybeSingle(),
    ])

    let state = stateResult.data as UserStateEntitlementRow | null
    let creatorGrant = creatorResult.data as { user_id: string; expires_at: string | null } | null

    if (stateResult.error || creatorResult.error || !state) {
      try {
        const admin = createAdminClient()
        const [adminState, adminCreator] = await Promise.all([
          admin.from("user_state").select("premium, premium_until").eq("id", user.id).maybeSingle(),
          admin.from("creator_access").select("user_id, expires_at").eq("user_id", user.id).maybeSingle(),
        ])
        if (adminState.error || adminCreator.error) throw adminState.error ?? adminCreator.error
        state = adminState.data as UserStateEntitlementRow | null
        creatorGrant = adminCreator.data as { user_id: string; expires_at: string | null } | null
      } catch {
        throw new EntitlementUnavailableError()
      }
    }

    const premiumUntil = state?.premium_until ?? null
    const internalCreator = isCreatorUser(user)
    const inviteExpiry = creatorGrant?.expires_at ?? null
    const parsedInviteExpiry = inviteExpiry ? Date.parse(inviteExpiry) : Number.NaN
    const activeInvite = Number.isFinite(parsedInviteExpiry) && parsedInviteExpiry > Date.now()
    const creator = internalCreator || activeInvite
    const active = creator || isPremiumActive(state?.premium, premiumUntil)

    return {
      userId: user.id,
      email: user.email ?? undefined,
      premium: active,
      premiumUntil: internalCreator ? null : activeInvite ? inviteExpiry : premiumUntil,
      source: creator ? "creator" : active ? "purchase" : "free",
    }
  } catch (error) {
    if (error instanceof EntitlementUnavailableError) throw error
    throw new EntitlementUnavailableError()
  }
}

/**
 * Route guard: returns the entitlement when the caller is a premium user, or a
 * ready-to-return NextResponse (401 when unauthenticated, 402 when not premium,
 * 503 when subscription status cannot be verified).
 *
 *   const gate = await requirePremium()
 *   if (gate instanceof NextResponse) return gate
 *   // ...gate.userId is a confirmed premium user
 */
export async function requirePremium(): Promise<Entitlement | NextResponse> {
  let ent: Entitlement | null
  try {
    ent = await readEntitlement()
  } catch {
    return NextResponse.json(
      { error: "We could not verify your subscription. Please retry shortly." },
      { status: 503, headers: { "Cache-Control": "private, no-store", "Retry-After": "5" } },
    )
  }
  if (!ent) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }
  if (!ent.premium) {
    return NextResponse.json({ error: "Premium required." }, { status: 402 })
  }
  return ent
}

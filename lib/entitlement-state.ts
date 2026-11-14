import type { AppState } from "@/lib/types"

export type KnownEntitlement = Pick<AppState, "premium" | "premiumUntil" | "entitlementSource">

/**
 * Merge general profile/progress data without allowing user_state to become an
 * entitlement authority. Use the last known local entitlement until the
 * dedicated server status endpoint returns an authoritative response.
 */
export function preserveKnownEntitlement<T extends AppState>(
  remoteState: T,
  knownEntitlement: KnownEntitlement,
): T {
  return {
    ...remoteState,
    premium: knownEntitlement.premium,
    premiumUntil: knownEntitlement.premiumUntil,
    entitlementSource: knownEntitlement.entitlementSource,
  }
}

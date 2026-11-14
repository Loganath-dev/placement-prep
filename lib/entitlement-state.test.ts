import { describe, expect, it } from "vitest"
import type { AppState } from "@/lib/types"
import { preserveKnownEntitlement } from "./entitlement-state"

const remoteState = {
  premium: false,
  premiumUntil: undefined,
  entitlementSource: "free",
  xp: 120,
} as unknown as AppState

describe("client entitlement fallback", () => {
  it("preserves a creator entitlement when the status endpoint is unavailable", () => {
    const result = preserveKnownEntitlement(remoteState, {
      premium: true,
      premiumUntil: "2027-11-14T00:00:00.000Z",
      entitlementSource: "creator",
    })
    expect(result.premium).toBe(true)
    expect(result.entitlementSource).toBe("creator")
    expect(result.xp).toBe(120)
  })

  it("preserves a purchased entitlement and expiry", () => {
    const expiry = "2027-02-01T00:00:00.000Z"
    const result = preserveKnownEntitlement(remoteState, {
      premium: true,
      premiumUntil: expiry,
      entitlementSource: "purchase",
    })
    expect(result).toMatchObject({ premium: true, premiumUntil: expiry, entitlementSource: "purchase" })
  })

  it("preserves a known Free state instead of accepting remote entitlement fields", () => {
    const result = preserveKnownEntitlement({ ...remoteState, premium: true } as AppState, {
      premium: false,
      premiumUntil: undefined,
      entitlementSource: "free",
    })
    expect(result.premium).toBe(false)
    expect(result.entitlementSource).toBe("free")
  })
})

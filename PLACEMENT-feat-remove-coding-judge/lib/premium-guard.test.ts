import { describe, expect, it } from "vitest"
import { isPremiumActive } from "@/lib/premium-guard"

const NOW = 1_700_000_000_000
const DAY = 24 * 60 * 60 * 1000

describe("isPremiumActive", () => {
  it("is false when the flag is not set, regardless of expiry", () => {
    expect(isPremiumActive(false, new Date(NOW + DAY).toISOString(), NOW)).toBe(false)
    expect(isPremiumActive(null, null, NOW)).toBe(false)
    expect(isPremiumActive(undefined, undefined, NOW)).toBe(false)
  })

  it("is true when flagged with no expiry (lifetime/promo grant)", () => {
    expect(isPremiumActive(true, null, NOW)).toBe(true)
    expect(isPremiumActive(true, undefined, NOW)).toBe(true)
  })

  it("respects a future vs past expiry", () => {
    expect(isPremiumActive(true, new Date(NOW + DAY).toISOString(), NOW)).toBe(true)
    expect(isPremiumActive(true, new Date(NOW - DAY).toISOString(), NOW)).toBe(false)
  })

  it("fails closed on an unparseable expiry", () => {
    expect(isPremiumActive(true, "not-a-date", NOW)).toBe(false)
  })

  it("treats the exact expiry instant as expired (strict greater-than)", () => {
    const at = new Date(NOW).toISOString()
    expect(isPremiumActive(true, at, NOW)).toBe(false)
  })
})

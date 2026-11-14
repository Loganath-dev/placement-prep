import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  authResult: { data: { user: { id: "user-1", email: "student@example.com", app_metadata: {} } }, error: null } as { data: any; error: any },
  primaryState: { data: { premium: true, premium_until: "2099-01-01T00:00:00.000Z" }, error: null } as { data: any; error: any },
  primaryCreator: { data: null, error: null } as { data: any; error: any },
  adminState: { data: { premium: true, premium_until: "2099-01-01T00:00:00.000Z" }, error: null } as { data: any; error: any },
  adminCreator: { data: null, error: null } as { data: any; error: any },
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: vi.fn(async () => mocks.authResult) },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => table === "user_state" ? mocks.primaryState : mocks.primaryCreator,
        }),
      }),
    }),
  })),
}))

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => table === "user_state" ? mocks.adminState : mocks.adminCreator,
        }),
      }),
    }),
  })),
}))

import { EntitlementUnavailableError, isPremiumActive, readEntitlement } from "@/lib/premium-guard"

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

  it("treats the exact expiry instant as expired", () => {
    expect(isPremiumActive(true, new Date(NOW).toISOString(), NOW)).toBe(false)
  })
})

describe("readEntitlement resilience", () => {
  beforeEach(() => {
    mocks.authResult = { data: { user: { id: "user-1", email: "student@example.com", app_metadata: {} } }, error: null }
    mocks.primaryState = { data: { premium: true, premium_until: "2099-01-01T00:00:00.000Z" }, error: null }
    mocks.primaryCreator = { data: null, error: null }
    mocks.adminState = { data: { premium: true, premium_until: "2099-01-01T00:00:00.000Z" }, error: null }
    mocks.adminCreator = { data: null, error: null }
  })

  it("uses the normal authenticated read when it succeeds", async () => {
    await expect(readEntitlement()).resolves.toMatchObject({ userId: "user-1", premium: true, source: "purchase" })
  })

  it("recovers a transient user_state read failure through a user-scoped admin read", async () => {
    mocks.primaryState = { data: null, error: { message: "temporary database error" } }
    await expect(readEntitlement()).resolves.toMatchObject({ userId: "user-1", premium: true, source: "purchase" })
  })

  it("does not downgrade a creator when the creator-access RLS read fails", async () => {
    mocks.primaryCreator = { data: null, error: { message: "temporary database error" } }
    mocks.adminCreator = { data: { user_id: "user-1", expires_at: "2099-01-01T00:00:00.000Z" }, error: null }
    await expect(readEntitlement()).resolves.toMatchObject({ premium: true, source: "creator" })
  })

  it("returns an availability error instead of Free when both database reads fail", async () => {
    mocks.primaryState = { data: null, error: { message: "database unavailable" } }
    mocks.adminState = { data: null, error: { message: "database unavailable" } }
    await expect(readEntitlement()).rejects.toBeInstanceOf(EntitlementUnavailableError)
  })

  it("treats an authentication lookup error as unavailable, not logged out", async () => {
    mocks.authResult = { data: { user: null }, error: { message: "auth service unavailable" } }
    await expect(readEntitlement()).rejects.toBeInstanceOf(EntitlementUnavailableError)
  })
})

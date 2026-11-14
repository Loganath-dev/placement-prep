import { describe, expect, it } from "vitest"
import {
  grantPremiumMonths,
  grantPremiumDays,
  grantPremiumForPayment,
  grantPremiumYear,
  recordAffiliateCommission,
  recordPaymentOnce,
  type PaymentInput,
} from "@/lib/entitlement"

// Minimal fake of the supabase-js admin client covering exactly the calls
// entitlement.ts makes: payments.insert, payments.select().eq().single(),
// user_state.select().eq().maybeSingle(), user_state.upsert.
interface FakeOptions {
  paymentInsertError?: { code: string; message: string } | null
  paymentOwner?: string
  premiumUntil?: string | null
  userStateUpsertError?: { message: string } | null
}

interface RecordedCalls {
  paymentInserted?: Record<string, unknown>
  userStateUpserted?: Record<string, unknown>
}

function makeAdmin(opts: FakeOptions = {}) {
  const calls: RecordedCalls = {}
  const admin = {
    from(table: string) {
      if (table === "payments") {
        return {
          insert: async (row: Record<string, unknown>) => {
            calls.paymentInserted = row
            return { error: opts.paymentInsertError ?? null }
          },
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: { user_id: opts.paymentOwner ?? "unknown" },
                error: null,
              }),
            }),
          }),
        }
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data:
                opts.premiumUntil === undefined
                  ? null
                  : { premium_until: opts.premiumUntil },
              error: null,
            }),
          }),
        }),
        upsert: async (row: Record<string, unknown>) => {
          calls.userStateUpserted = row
          return { error: opts.userStateUpsertError ?? null }
        },
      }
    },
  }
  // entitlement.ts only calls the methods modelled above.
  return { admin: admin as unknown as Parameters<typeof grantPremiumYear>[0], calls }
}

const PAYMENT: PaymentInput = {
  paymentId: "pay_123",
  orderId: "order_456",
  userId: "user-a",
  amount: 9900,
  currency: "INR",
  source: "verify",
  planKey: "premium_6_months_299",
}

const UNIQUE_VIOLATION = { code: "23505", message: "duplicate key" }

describe("recordPaymentOnce", () => {
  it("records a fresh payment with the full ledger row", async () => {
    const { admin, calls } = makeAdmin()
    await expect(recordPaymentOnce(admin, PAYMENT)).resolves.toBe("recorded")
    expect(calls.paymentInserted).toMatchObject({
      payment_id: "pay_123",
      order_id: "order_456",
      user_id: "user-a",
      amount: 9900,
      currency: "INR",
      source: "verify",
      plan_key: "premium_6_months_299",
    })
  })

  it("treats a duplicate from the same user as an idempotent retry", async () => {
    const { admin } = makeAdmin({
      paymentInsertError: UNIQUE_VIOLATION,
      paymentOwner: "user-a",
    })
    await expect(recordPaymentOnce(admin, PAYMENT)).resolves.toBe("already-recorded")
  })

  it("rejects a payment already consumed by a different user (replay attack)", async () => {
    const { admin } = makeAdmin({
      paymentInsertError: UNIQUE_VIOLATION,
      paymentOwner: "user-b",
    })
    await expect(recordPaymentOnce(admin, PAYMENT)).resolves.toBe(
      "replayed-by-other-user",
    )
  })

  it("throws on unexpected DB errors so callers can return 5xx and retry", async () => {
    const { admin } = makeAdmin({
      paymentInsertError: { code: "08000", message: "connection lost" },
    })
    await expect(recordPaymentOnce(admin, PAYMENT)).rejects.toThrow("connection lost")
  })
})

describe("grantPremiumDays", () => {
  it("grants the exact six-month duration without shortening longer access", async () => {
    const { admin, calls } = makeAdmin({ premiumUntil: null })
    const until = await grantPremiumDays(admin, "user-a", 180)
    const expected = new Date()
    expected.setDate(expected.getDate() + 180)
    expect(Math.abs(Date.parse(until) - expected.getTime())).toBeLessThan(2000)
    expect(calls.userStateUpserted).toMatchObject({ id: "user-a", premium: true, premium_until: until })
  })

  it("rejects invalid entitlement durations", async () => {
    const { admin } = makeAdmin()
    await expect(grantPremiumDays(admin, "user-a", 0)).rejects.toThrow("positive whole number")
    await expect(grantPremiumDays(admin, "user-a", 1.5)).rejects.toThrow("positive whole number")
  })
})

describe("grantPremiumYear", () => {
  const YEAR_MS = 365 * 24 * 60 * 60 * 1000

  it("grants ~one year from now to a first-time buyer and flips premium on", async () => {
    const { admin, calls } = makeAdmin({ premiumUntil: null })
    const until = await grantPremiumYear(admin, "user-a")
    const granted = Date.parse(until)
    expect(Math.abs(granted - (Date.now() + YEAR_MS))).toBeLessThan(48 * 60 * 60 * 1000)
    expect(calls.userStateUpserted).toMatchObject({
      id: "user-a",
      premium: true,
      premium_until: until,
    })
  })

  it("never shortens a longer existing entitlement (promo / prior purchase)", async () => {
    const twoYearsOut = new Date(Date.now() + 2 * YEAR_MS).toISOString()
    const { admin } = makeAdmin({ premiumUntil: twoYearsOut })
    await expect(grantPremiumYear(admin, "user-a")).resolves.toBe(twoYearsOut)
  })

  it("extends an expired entitlement to one year from now", async () => {
    const lastYear = new Date(Date.now() - YEAR_MS).toISOString()
    const { admin } = makeAdmin({ premiumUntil: lastYear })
    const until = await grantPremiumYear(admin, "user-a")
    expect(Date.parse(until)).toBeGreaterThan(Date.now())
  })

  it("works when the user_state row does not exist yet (upsert path)", async () => {
    const { admin, calls } = makeAdmin() // premiumUntil undefined -> no row
    const until = await grantPremiumYear(admin, "user-a")
    expect(Date.parse(until)).toBeGreaterThan(Date.now())
    expect(calls.userStateUpserted).toMatchObject({ id: "user-a", premium: true })
  })

  it("throws when the entitlement write fails so the payment is not silently lost", async () => {
    const { admin } = makeAdmin({
      premiumUntil: null,
      userStateUpsertError: { message: "write failed" },
    })
    await expect(grantPremiumYear(admin, "user-a")).rejects.toThrow("write failed")
  })
})

describe("grantPremiumMonths", () => {
  const MONTH_MS = 30 * 24 * 60 * 60 * 1000

  it("grants about one month to a user without active premium", async () => {
    const { admin, calls } = makeAdmin({ premiumUntil: null })
    const until = await grantPremiumMonths(admin, "referrer-a", 1)
    expect(Math.abs(Date.parse(until) - (Date.now() + MONTH_MS))).toBeLessThan(4 * 24 * 60 * 60 * 1000)
    expect(calls.userStateUpserted).toMatchObject({
      id: "referrer-a",
      premium: true,
      premium_until: until,
    })
  })

  it("extends from an existing future expiry", async () => {
    const currentExpiry = new Date(Date.now() + MONTH_MS).toISOString()
    const { admin } = makeAdmin({ premiumUntil: currentExpiry })
    const until = await grantPremiumMonths(admin, "referrer-a", 1)
    expect(Date.parse(until)).toBeGreaterThan(Date.parse(currentExpiry))
    expect(Date.parse(until) - Date.parse(currentExpiry)).toBeGreaterThan(25 * 24 * 60 * 60 * 1000)
  })
})


describe("recordAffiliateCommission", () => {
  it("records the fixed ₹25 six-month reward after the review period", async () => {
    let inserted: Record<string, unknown> | null = null
    const admin = {
      from(table: string) {
        if (table === "profiles") return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { referred_by: "referrer-a" }, error: null }) }) }) }
        if (table === "affiliate_accounts") return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { status: "active" }, error: null }) }) }) }
        if (table === "affiliate_settings") return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { is_enabled: true, waiting_period_days: 15 }, error: null }) }) }) }
        return { upsert: async (row: Record<string, unknown>) => { inserted = row; return { error: null } } }
      },
    } as unknown as Parameters<typeof recordAffiliateCommission>[0]
    await recordAffiliateCommission(admin, { userId: "buyer-a", paymentId: "pay-6m", paymentAmount: 29900, commissionAmount: 2500, planKey: "premium_6_months_299" })
    expect(inserted).toMatchObject({ referrer_id: "referrer-a", buyer_id: "buyer-a", payment_amount: 29900, commission_amount: 2500, commission_rate: 0, plan_key: "premium_6_months_299", status: "pending", notes: "Fixed reward for premium_6_months_299" })
  })

  it("records the fixed ₹50 annual reward", async () => {
    let inserted: Record<string, unknown> | null = null
    const admin = {
      from(table: string) {
        if (table === "profiles") return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { referred_by: "referrer-a" }, error: null }) }) }) }
        if (table === "affiliate_accounts") return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { status: "active" }, error: null }) }) }) }
        if (table === "affiliate_settings") return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { is_enabled: true, waiting_period_days: 15 }, error: null }) }) }) }
        return { upsert: async (row: Record<string, unknown>) => { inserted = row; return { error: null } } }
      },
    } as unknown as Parameters<typeof recordAffiliateCommission>[0]
    await recordAffiliateCommission(admin, { userId: "buyer-a", paymentId: "pay-1y", paymentAmount: 24900, commissionAmount: 2500, planKey: "premium_annual_249" })
    expect(inserted).toMatchObject({ commission_amount: 2500, payment_amount: 24900, plan_key: "premium_annual_249" })
  })

  it("does not create a commission for a self-referral", async () => {
    let upsertCalled = false
    const admin = {
      from(table: string) {
        if (table === "profiles") return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { referred_by: "buyer-a" }, error: null }) }) }) }
        return { upsert: async () => { upsertCalled = true; return { error: null } } }
      },
    } as unknown as Parameters<typeof recordAffiliateCommission>[0]
    await recordAffiliateCommission(admin, { userId: "buyer-a", paymentId: "pay-self", paymentAmount: 49900, commissionAmount: 5000, planKey: "premium_annual_499" })
    expect(upsertCalled).toBe(false)
  })
})


describe("grantPremiumForPayment", () => {
  it("delegates duration and payment identity to the atomic idempotency RPC", async () => {
    const rpc = async (name: string, args: Record<string, unknown>) => {
      expect(name).toBe("grant_premium_for_payment")
      expect(args).toEqual({ p_payment_id: "pay-6m", p_user_id: "buyer-a", p_days: 180 })
      return { data: "2027-05-01T00:00:00.000Z", error: null }
    }
    const admin = { rpc } as unknown as Parameters<typeof grantPremiumForPayment>[0]
    await expect(grantPremiumForPayment(admin, { paymentId: "pay-6m", userId: "buyer-a", days: 180 })).resolves.toBe("2027-05-01T00:00:00.000Z")
  })

  it("uses a null duration only for a legacy lifetime payment", async () => {
    let argsSeen: Record<string, unknown> | null = null
    const admin = {
      rpc: async (_name: string, args: Record<string, unknown>) => {
        argsSeen = args
        return { data: null, error: null }
      },
    } as unknown as Parameters<typeof grantPremiumForPayment>[0]
    await expect(grantPremiumForPayment(admin, { paymentId: "old-pay", userId: "buyer-a", days: null })).resolves.toBeNull()
    expect(argsSeen).toMatchObject({ p_payment_id: "old-pay", p_user_id: "buyer-a", p_days: null })
  })
})

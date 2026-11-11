import { describe, expect, it } from "vitest"
import {
  ACTIVE_PURCHASE_PLANS,
  PREMIUM_ANNUAL_PLAN_KEY,
  PREMIUM_SIX_MONTH_PLAN_KEY,
  LEGACY_ANNUAL_PLAN_KEY,
  getActivePurchasePlan,
  resolveRazorpayOrderPlan,
} from "@/lib/subscriptions/plans"

describe("Premium purchase plans", () => {
  it("offers only ₹249 for 365 days", () => {
    expect(Object.keys(ACTIVE_PURCHASE_PLANS)).toEqual([PREMIUM_ANNUAL_PLAN_KEY])
    expect(getActivePurchasePlan(PREMIUM_ANNUAL_PLAN_KEY)).toMatchObject({
      amountPaise: 24900, entitlementDays: 365, affiliateCommissionPaise: 2500, legacy: false,
    })
    expect(getActivePurchasePlan(PREMIUM_SIX_MONTH_PLAN_KEY)).toBeNull()
    expect(getActivePurchasePlan(LEGACY_ANNUAL_PLAN_KEY)).toBeNull()
    expect(getActivePurchasePlan("premium_lifetime_249")).toBeNull()
  })

  it("resolves the current ₹249 annual plan only with its server-owned key", () => {
    expect(resolveRazorpayOrderPlan({
      amount: 24900, currency: "INR", notes: { plan_key: PREMIUM_ANNUAL_PLAN_KEY },
    })).toMatchObject({ entitlementDays: 365, legacy: false, affiliateCommissionPaise: 2500 })
    expect(resolveRazorpayOrderPlan({
      amount: 24900, currency: "INR", notes: { plan_key: PREMIUM_ANNUAL_PLAN_KEY },
    })?.planKey).toBe(PREMIUM_ANNUAL_PLAN_KEY)
    expect(resolveRazorpayOrderPlan({
      amount: 24900, currency: "USD", notes: { plan_key: PREMIUM_ANNUAL_PLAN_KEY },
    })).toBeNull()
  })

  it("keeps already-created ₹299 six-month and ₹499 annual orders verifiable", () => {
    expect(resolveRazorpayOrderPlan({
      amount: 29900, currency: "INR", notes: { plan_key: PREMIUM_SIX_MONTH_PLAN_KEY },
    })).toMatchObject({ entitlementDays: 180, legacy: true })
    expect(resolveRazorpayOrderPlan({
      amount: 49900, currency: "INR", notes: { plan_key: LEGACY_ANNUAL_PLAN_KEY },
    })).toMatchObject({ entitlementDays: 365, legacy: true })
  })

  it("resolves untagged historical ₹24900 orders as annual, matching the live ledger", () => {
    expect(resolveRazorpayOrderPlan({
      amount: 24900, currency: "INR", notes: { user_id: "old-user" },
    })).toMatchObject({ legacy: true, entitlementDays: 365, affiliateCommissionPaise: 2500 })
  })

  it("resolves lifetime only when the explicit historical lifetime key is present", () => {
    expect(resolveRazorpayOrderPlan({
      amount: 24900, currency: "INR", notes: { plan_key: "premium_lifetime_249" },
    })).toMatchObject({ legacy: true, entitlementDays: null, affiliateCommissionPaise: 0 })
  })

  it("rejects historical plan keys with tampered amounts", () => {
    expect(resolveRazorpayOrderPlan({
      amount: 49900, currency: "INR", notes: { plan_key: PREMIUM_SIX_MONTH_PLAN_KEY },
    })).toBeNull()
  })
})

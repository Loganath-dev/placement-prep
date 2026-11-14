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
  it("offers ₹299 for six months and ₹499 for one year", () => {
    expect(Object.keys(ACTIVE_PURCHASE_PLANS)).toEqual([PREMIUM_SIX_MONTH_PLAN_KEY, PREMIUM_ANNUAL_PLAN_KEY])
    expect(getActivePurchasePlan(PREMIUM_SIX_MONTH_PLAN_KEY)).toMatchObject({
      amountPaise: 29900, entitlementDays: 180, affiliateCommissionPaise: 2500, legacy: false,
    })
    expect(getActivePurchasePlan(PREMIUM_ANNUAL_PLAN_KEY)).toMatchObject({
      amountPaise: 49900, entitlementDays: 365, affiliateCommissionPaise: 5000, legacy: false,
    })
    expect(getActivePurchasePlan(LEGACY_ANNUAL_PLAN_KEY)).toBeNull()
    expect(getActivePurchasePlan("premium_lifetime_249")).toBeNull()
  })

  it("resolves current plans only with their matching server-owned key and amount", () => {
    expect(resolveRazorpayOrderPlan({
      amount: 29900, currency: "INR", notes: { plan_key: PREMIUM_SIX_MONTH_PLAN_KEY },
    })).toMatchObject({ entitlementDays: 180, legacy: false, affiliateCommissionPaise: 2500 })
    expect(resolveRazorpayOrderPlan({
      amount: 49900, currency: "INR", notes: { plan_key: PREMIUM_ANNUAL_PLAN_KEY },
    })?.planKey).toBe(PREMIUM_ANNUAL_PLAN_KEY)
    expect(resolveRazorpayOrderPlan({
      amount: 49900, currency: "USD", notes: { plan_key: PREMIUM_ANNUAL_PLAN_KEY },
    })).toBeNull()
  })

  it("keeps historical ₹249 annual orders verifiable", () => {
    expect(resolveRazorpayOrderPlan({
      amount: 24900, currency: "INR", notes: { plan_key: LEGACY_ANNUAL_PLAN_KEY },
    })).toMatchObject({ entitlementDays: 365, legacy: true, affiliateCommissionPaise: 2500 })
    expect(resolveRazorpayOrderPlan({
      amount: 24900, currency: "INR", notes: { user_id: "old-user" },
    })).toMatchObject({ legacy: true, entitlementDays: 365, affiliateCommissionPaise: 2500 })
  })

  it("rejects untagged current prices and historical keys with tampered amounts", () => {
    expect(resolveRazorpayOrderPlan({ amount: 29900, currency: "INR", notes: { user_id: "old-user" } })).toBeNull()
    expect(resolveRazorpayOrderPlan({ amount: 49900, currency: "INR", notes: { user_id: "old-user" } })).toBeNull()
    expect(resolveRazorpayOrderPlan({
      amount: 49900, currency: "INR", notes: { plan_key: PREMIUM_SIX_MONTH_PLAN_KEY },
    })).toBeNull()
  })

  it("resolves lifetime only when the explicit historical lifetime key is present", () => {
    expect(resolveRazorpayOrderPlan({
      amount: 24900, currency: "INR", notes: { plan_key: "premium_lifetime_249" },
    })).toMatchObject({ legacy: true, entitlementDays: null, affiliateCommissionPaise: 0 })
  })

  it("rejects historical plan keys with tampered amounts", () => {
    expect(resolveRazorpayOrderPlan({
      amount: 29900, currency: "INR", notes: { plan_key: LEGACY_ANNUAL_PLAN_KEY },
    })).toBeNull()
  })
})

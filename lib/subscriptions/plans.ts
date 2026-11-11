import { PREMIUM_DURATION_DAYS, PREMIUM_PRICE_INR } from "@/lib/access"

export const PREMIUM_ANNUAL_PLAN_KEY = "premium_annual_249"

/** Historical plan keys remain resolvable for orders created before the price change. */
export const PREMIUM_SIX_MONTH_PLAN_KEY = "premium_6_months_299"
export const LEGACY_ANNUAL_PLAN_KEY = "premium_annual_499"
export const LEGACY_LIFETIME_PLAN_KEY = "premium_lifetime_249"

export interface PurchasePlan {
  planKey: string
  name: string
  amountPaise: number
  entitlementDays: number | null
  affiliateCommissionPaise: number
  legacy: boolean
}

const CURRENT_ANNUAL_PLAN: PurchasePlan = {
  planKey: PREMIUM_ANNUAL_PLAN_KEY,
  name: "Premium — 1 year",
  amountPaise: PREMIUM_PRICE_INR * 100,
  entitlementDays: PREMIUM_DURATION_DAYS,
  affiliateCommissionPaise: 2500,
  legacy: false,
}

export const ACTIVE_PURCHASE_PLANS: Record<string, PurchasePlan> = {
  [PREMIUM_ANNUAL_PLAN_KEY]: CURRENT_ANNUAL_PLAN,
}

const HISTORICAL_PLANS: Record<string, PurchasePlan> = {
  [PREMIUM_SIX_MONTH_PLAN_KEY]: {
    planKey: PREMIUM_SIX_MONTH_PLAN_KEY,
    name: "Legacy Premium — 6 months",
    amountPaise: 29900,
    entitlementDays: 180,
    affiliateCommissionPaise: 2500,
    legacy: true,
  },
  [LEGACY_ANNUAL_PLAN_KEY]: {
    planKey: LEGACY_ANNUAL_PLAN_KEY,
    name: "Legacy Premium — 1 year",
    amountPaise: 49900,
    entitlementDays: 365,
    affiliateCommissionPaise: 5000,
    legacy: true,
  },
}

export function getActivePurchasePlan(planKey: unknown): PurchasePlan | null {
  if (typeof planKey !== "string") return null
  return ACTIVE_PURCHASE_PLANS[planKey] ?? null
}

/** Resolve server-owned plan metadata; old in-flight orders remain verifiable. */
export function resolveRazorpayOrderPlan(order: {
  amount?: unknown
  currency?: unknown
  notes?: unknown
}): PurchasePlan | null {
  if (order.currency !== "INR" || !Number.isInteger(order.amount)) return null
  const amountPaise = order.amount as number
  const notes = order.notes && typeof order.notes === "object"
    ? order.notes as Record<string, unknown>
    : {}
  const planKey = typeof notes.plan_key === "string" ? notes.plan_key : null

  if (planKey === PREMIUM_ANNUAL_PLAN_KEY) {
    return CURRENT_ANNUAL_PLAN.amountPaise === amountPaise ? CURRENT_ANNUAL_PLAN : null
  }

  if (planKey && HISTORICAL_PLANS[planKey]) {
    const historical = HISTORICAL_PLANS[planKey]
    return historical.amountPaise === amountPaise ? historical : null
  }

  if (planKey === LEGACY_LIFETIME_PLAN_KEY && amountPaise === 24900) {
    return {
      planKey: LEGACY_LIFETIME_PLAN_KEY,
      name: "Legacy Premium lifetime",
      amountPaise,
      entitlementDays: null,
      affiliateCommissionPaise: 0,
      legacy: true,
    }
  }

  // The connected production ledger contains ₹24900 purchases with
  // entitlement_days = 365. Resolve untagged historical ₹249 orders as annual;
  // lifetime is granted only when the explicit legacy lifetime key is present.
  if (!planKey && amountPaise === 24900) {
    return {
      planKey: PREMIUM_ANNUAL_PLAN_KEY,
      name: "Legacy Premium — 1 year",
      amountPaise,
      entitlementDays: 365,
      affiliateCommissionPaise: 2500,
      legacy: true,
    }
  }
  return null
}

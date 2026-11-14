import {
  PREMIUM_ANNUAL_PRICE_INR,
  PREMIUM_DURATION_DAYS,
  PREMIUM_SIX_MONTH_DURATION_DAYS,
  PREMIUM_SIX_MONTH_PRICE_INR,
} from "@/lib/access"

export const PREMIUM_SIX_MONTH_PLAN_KEY = "premium_6_months_299"
export const PREMIUM_ANNUAL_PLAN_KEY = "premium_annual_499"
export const LEGACY_ANNUAL_PLAN_KEY = "premium_annual_249"
export const LEGACY_LIFETIME_PLAN_KEY = "premium_lifetime_249"

export interface PurchasePlan {
  planKey: string
  name: string
  amountPaise: number
  entitlementDays: number | null
  affiliateCommissionPaise: number
  legacy: boolean
}

const CURRENT_SIX_MONTH_PLAN: PurchasePlan = {
  planKey: PREMIUM_SIX_MONTH_PLAN_KEY,
  name: "Premium — 6 months",
  amountPaise: PREMIUM_SIX_MONTH_PRICE_INR * 100,
  entitlementDays: PREMIUM_SIX_MONTH_DURATION_DAYS,
  affiliateCommissionPaise: 2500,
  legacy: false,
}

const CURRENT_ANNUAL_PLAN: PurchasePlan = {
  planKey: PREMIUM_ANNUAL_PLAN_KEY,
  name: "Premium — 1 year",
  amountPaise: PREMIUM_ANNUAL_PRICE_INR * 100,
  entitlementDays: PREMIUM_DURATION_DAYS,
  affiliateCommissionPaise: 5000,
  legacy: false,
}

export const ACTIVE_PURCHASE_PLANS: Record<string, PurchasePlan> = {
  [PREMIUM_SIX_MONTH_PLAN_KEY]: CURRENT_SIX_MONTH_PLAN,
  [PREMIUM_ANNUAL_PLAN_KEY]: CURRENT_ANNUAL_PLAN,
}

/** Prior purchases stay verifiable, but cannot be selected for new orders. */
const HISTORICAL_PLANS: Record<string, PurchasePlan> = {
  [LEGACY_ANNUAL_PLAN_KEY]: {
    planKey: LEGACY_ANNUAL_PLAN_KEY,
    name: "Legacy Premium — 1 year",
    amountPaise: 24900,
    entitlementDays: 365,
    affiliateCommissionPaise: 2500,
    legacy: true,
  },
}

export function getActivePurchasePlan(planKey: unknown): PurchasePlan | null {
  if (typeof planKey !== "string") return null
  return ACTIVE_PURCHASE_PLANS[planKey] ?? null
}

/** Fast allowlist for filtering unsupported captured-payment webhook events. */
export function isSupportedPurchaseAmount(amountPaise: unknown): amountPaise is number {
  if (!Number.isSafeInteger(amountPaise)) return false
  return [
    ...Object.values(ACTIVE_PURCHASE_PLANS),
    ...Object.values(HISTORICAL_PLANS),
  ].some((plan) => plan.amountPaise === amountPaise) || amountPaise === 24900
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

  if (planKey) {
    const active = getActivePurchasePlan(planKey)
    if (active) return active.amountPaise === amountPaise ? active : null

    const historical = HISTORICAL_PLANS[planKey]
    if (historical) return historical.amountPaise === amountPaise ? historical : null
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

  // Old untagged ₹24900 orders were annual purchases in the live ledger.
  if (!planKey && amountPaise === 24900) {
    return {
      ...HISTORICAL_PLANS[LEGACY_ANNUAL_PLAN_KEY],
    }
  }
  return null
}

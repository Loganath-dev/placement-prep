import {
 PREMIUM_AMOUNT_PAISE, PREMIUM_DURATION_DAYS, PREMIUM_PLAN_KEY,
 PREMIUM_SIX_MONTH_AMOUNT_PAISE, PREMIUM_SIX_MONTH_DURATION_DAYS, PREMIUM_SIX_MONTH_PLAN_KEY,
} from "@/lib/access"

export interface ResolvedPurchasePlan {
 planKey:string; amountPaise:number; entitlementDays:number|null;
 affiliateEligible:boolean; legacy:boolean;
}

export const ACTIVE_PURCHASE_PLANS = {
 [PREMIUM_SIX_MONTH_PLAN_KEY]: {
  planKey: PREMIUM_SIX_MONTH_PLAN_KEY, name: "Premium — 6 months",
  amountPaise: PREMIUM_SIX_MONTH_AMOUNT_PAISE, entitlementDays: PREMIUM_SIX_MONTH_DURATION_DAYS,
  affiliateEligible: true, legacy: false,
 },
 [PREMIUM_PLAN_KEY]: {
  planKey: PREMIUM_PLAN_KEY, name: "Premium — 1 year",
  amountPaise: PREMIUM_AMOUNT_PAISE, entitlementDays: PREMIUM_DURATION_DAYS,
  affiliateEligible: true, legacy: false,
 },
} satisfies Record<string,ResolvedPurchasePlan & {name:string}>

export function getActivePurchasePlan(planKey:unknown) {
 if(typeof planKey!=="string" || !(planKey in ACTIVE_PURCHASE_PLANS)) return null
 return ACTIVE_PURCHASE_PLANS[planKey as keyof typeof ACTIVE_PURCHASE_PLANS]
}

export function resolveRazorpayOrderPlan(order:{amount?:unknown;currency?:unknown;notes?:unknown}):ResolvedPurchasePlan|null {
 if(order.currency!=="INR"||!Number.isInteger(order.amount)) return null
 const amountPaise=order.amount as number
 const notes=order.notes&&typeof order.notes==="object" ? order.notes as Record<string,unknown> : {}
 const planKey=typeof notes.plan_key==="string" ? notes.plan_key : null
 if(planKey) {
  const active=getActivePurchasePlan(planKey)
  if(active && amountPaise===active.amountPaise) return active
  return null
 }
 // Resolve only historical orders that predate explicit plan metadata.
 const legacy:Record<number,Omit<ResolvedPurchasePlan,"amountPaise">>={
  14900:{planKey:"premium_3_months",entitlementDays:90,affiliateEligible:false,legacy:true},
  49900:{planKey:"premium_yearly",entitlementDays:365,affiliateEligible:false,legacy:true},
  24900:{planKey:"premium_lifetime_legacy",entitlementDays:null,affiliateEligible:false,legacy:true},
 }
 return legacy[amountPaise] ? {...legacy[amountPaise],amountPaise} : null
}

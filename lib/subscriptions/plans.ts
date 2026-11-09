import { PREMIUM_AMOUNT_PAISE, PREMIUM_DURATION_DAYS, PREMIUM_PLAN_KEY } from "@/lib/access"

export interface ResolvedPurchasePlan {
 planKey:string; amountPaise:number; entitlementDays:number|null;
 affiliateEligible:boolean; legacy:boolean;
}
export function resolveRazorpayOrderPlan(order:{amount?:unknown;currency?:unknown;notes?:unknown}):ResolvedPurchasePlan|null {
 if(order.currency!=="INR"||!Number.isInteger(order.amount)) return null
 const amountPaise=order.amount as number
 const notes=order.notes&&typeof order.notes==="object" ? order.notes as Record<string,unknown> : {}
 const planKey=typeof notes.plan_key==="string" ? notes.plan_key : null
 if(planKey===PREMIUM_PLAN_KEY) {
  if(amountPaise!==PREMIUM_AMOUNT_PAISE) return null
  return {planKey:PREMIUM_PLAN_KEY,amountPaise,entitlementDays:PREMIUM_DURATION_DAYS,affiliateEligible:true,legacy:false}
 }
 if(planKey) return null
 const legacy:Record<number,Omit<ResolvedPurchasePlan,"amountPaise">>={
  14900:{planKey:"premium_3_months",entitlementDays:90,affiliateEligible:false,legacy:true},
  49900:{planKey:"premium_yearly",entitlementDays:365,affiliateEligible:false,legacy:true},
  24900:{planKey:"premium_lifetime_legacy",entitlementDays:null,affiliateEligible:false,legacy:true},
 }
 return legacy[amountPaise] ? {...legacy[amountPaise],amountPaise} : null
}

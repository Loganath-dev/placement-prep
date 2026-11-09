import { describe,expect,it } from "vitest"
import { PREMIUM_AMOUNT_PAISE,PREMIUM_DURATION_DAYS,PREMIUM_PLAN_KEY } from "@/lib/access"
import { resolveRazorpayOrderPlan } from "@/lib/subscriptions/plans"

describe("resolveRazorpayOrderPlan",()=>{
 it("accepts only the current annual plan for new checkout orders",()=>{
  expect(resolveRazorpayOrderPlan({amount:24900,currency:"INR",notes:{plan_key:PREMIUM_PLAN_KEY}}))
   .toEqual({planKey:PREMIUM_PLAN_KEY,amountPaise:PREMIUM_AMOUNT_PAISE,entitlementDays:PREMIUM_DURATION_DAYS,affiliateEligible:true,legacy:false})
 })
 it("rejects a mismatched amount or unknown explicit plan",()=>{
  expect(resolveRazorpayOrderPlan({amount:49900,currency:"INR",notes:{plan_key:PREMIUM_PLAN_KEY}})).toBeNull()
  expect(resolveRazorpayOrderPlan({amount:24900,currency:"INR",notes:{plan_key:"other"}})).toBeNull()
 })
 it("honours already-created legacy orders without enabling them for new checkout",()=>{
  expect(resolveRazorpayOrderPlan({amount:14900,currency:"INR",notes:{user_id:"u"}})).toMatchObject({planKey:"premium_3_months",entitlementDays:90,legacy:true,affiliateEligible:false})
  expect(resolveRazorpayOrderPlan({amount:49900,currency:"INR",notes:{user_id:"u"}})).toMatchObject({planKey:"premium_yearly",entitlementDays:365,legacy:true,affiliateEligible:false})
  expect(resolveRazorpayOrderPlan({amount:24900,currency:"INR",notes:{user_id:"u"}})).toMatchObject({planKey:"premium_lifetime_legacy",entitlementDays:null,legacy:true,affiliateEligible:false})
 })
 it("rejects unsupported currencies and amounts",()=>{
  expect(resolveRazorpayOrderPlan({amount:24900,currency:"USD",notes:{plan_key:PREMIUM_PLAN_KEY}})).toBeNull()
  expect(resolveRazorpayOrderPlan({amount:12345,currency:"INR",notes:{}})).toBeNull()
 })
})

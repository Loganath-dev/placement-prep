// SERVER-ONLY: use only from trusted payment routes.
import type { SupabaseClient } from "@supabase/supabase-js"
/* eslint-disable @typescript-eslint/no-explicit-any */
type AdminClient = SupabaseClient<any,any,any>

export interface PaymentInput {
 paymentId:string; orderId:string; userId:string; amount:number; currency:string;
 source:"verify"|"webhook"; planKey:string; entitlementDays:number|null;
}
export type RecordPaymentResult="recorded"|"already-recorded"|"replayed-by-other-user"
const UNIQUE_VIOLATION="23505"

export async function recordPaymentOnce(admin:AdminClient,payment:PaymentInput):Promise<RecordPaymentResult> {
 const {error}=await admin.from("payments").insert({
  payment_id:payment.paymentId,order_id:payment.orderId,user_id:payment.userId,
  amount:payment.amount,currency:payment.currency,source:payment.source,
  plan_key:payment.planKey,entitlement_days:payment.entitlementDays,
 })
 if(!error) return "recorded"
 if(error.code!==UNIQUE_VIOLATION) throw new Error(`payments insert failed: ${error.message}`)
 const {data:existing,error:readError}=await admin.from("payments")
  .select("user_id,order_id,amount,plan_key,entitlement_days").eq("payment_id",payment.paymentId).single()
 if(readError) throw new Error(`payments lookup failed: ${readError.message}`)
 return existing.user_id===payment.userId && existing.order_id===payment.orderId &&
  existing.amount===payment.amount && existing.plan_key===payment.planKey &&
  existing.entitlement_days===payment.entitlementDays ? "already-recorded" : "replayed-by-other-user"
}

export async function grantPaymentEntitlement(admin:AdminClient,paymentId:string):Promise<string|null> {
 const {data,error}=await admin.rpc("grant_payment_entitlement",{p_payment_id:paymentId})
 if(error) throw new Error(`payment entitlement grant failed: ${error.message}`)
 return typeof data==="string" ? data : null
}

export async function recordAnnualAffiliateCommission(
 admin:AdminClient,input:{userId:string;paymentId:string;paymentAmount:number;commissionAmount:number},
):Promise<void> {
 const {data:profile,error:profileError}=await admin.from("profiles").select("referred_by").eq("id",input.userId).maybeSingle()
 if(profileError) throw new Error(`affiliate profile lookup failed: ${profileError.message}`)
 const referrerId=profile?.referred_by
 if(!referrerId || referrerId===input.userId) return
 const {data:settings,error:settingsError}=await admin.from("affiliate_settings")
  .select("is_enabled,waiting_period_days").eq("id",1).maybeSingle()
 if(settingsError) throw new Error(`affiliate settings lookup failed: ${settingsError.message}`)
 if(!settings?.is_enabled) return
 const days=Number(settings.waiting_period_days)
 if(!Number.isInteger(days)||days<0||days>90) throw new Error("Affiliate waiting period configuration is invalid.")
 const eligibleDate=new Date(Date.now()+days*86400000)
 const {error}=await admin.from("affiliate_commissions").upsert({
  referrer_id:referrerId,buyer_id:input.userId,payment_id:input.paymentId,
  payment_amount:input.paymentAmount,commission_amount:input.commissionAmount,commission_rate:null,
  eligible_date:eligibleDate.toISOString(),status:"pending",
 },{onConflict:"payment_id",ignoreDuplicates:true})
 if(error) throw new Error(`affiliate commission insert failed: ${error.message}`)
}

import { NextResponse } from "next/server"
import { getRazorpayEnvOrNull,getRazorpayWebhookSecretOrNull } from "@/lib/env"
import { captureError,logger } from "@/lib/logger"
import { hmacSha256Hex,timingSafeStringEqual } from "@/lib/crypto/edge-hmac"
import { grantPaymentEntitlement,recordAnnualAffiliateCommission,recordPaymentOnce } from "@/lib/entitlement"
import { resolveRazorpayOrderPlan } from "@/lib/subscriptions/plans"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime="edge"
export async function POST(request:Request) {
 const secret=getRazorpayWebhookSecretOrNull()
 if(!secret) return NextResponse.json({error:"Razorpay webhook secret is not configured."},{status:500})
 const rawBody=await request.text()
 const signature=request.headers.get("x-razorpay-signature")??""
 const expected=await hmacSha256Hex(secret,rawBody)
 if(!signature||!timingSafeStringEqual(expected,signature)) return NextResponse.json({error:"Invalid webhook signature."},{status:400})
 const event=JSON.parse(rawBody)
 const eventName:string=event.event??""
 if(eventName==="payment.refunded"||eventName==="refund.created") {
  const paymentId=event.payload?.payment?.entity?.id??event.payload?.refund?.entity?.payment_id
  if(paymentId) {
   const {error}=await createAdminClient().from("affiliate_commissions").update({status:"refunded"}).eq("payment_id",paymentId)
   if(error) { captureError(error,{scope:"razorpay/webhook",stage:"refund",paymentId}); return NextResponse.json({error:"Refund event could not be reconciled."},{status:500}) }
  }
  return NextResponse.json({ok:true,event:eventName})
 }
 if(eventName!=="payment.captured"&&eventName!=="order.paid") return NextResponse.json({ok:true,event:eventName||"ignored"})
 const payment=event.payload?.payment?.entity
 const paymentId:string|undefined=payment?.id
 const orderId:string|undefined=payment?.order_id??event.payload?.order?.entity?.id
 if(!paymentId||!orderId) return NextResponse.json({ok:true,event:eventName,skipped:true})
 const razorpay=getRazorpayEnvOrNull()
 if(!razorpay) return NextResponse.json({error:"Razorpay API credentials are not configured."},{status:500})
 let order:Record<string,unknown>
 try {
  const response=await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`,{
   headers:{Authorization:`Basic ${btoa(`${razorpay.keyId}:${razorpay.keySecret}`)}`},cache:"no-store"
  })
  if(!response.ok) return NextResponse.json({error:"Could not reconcile Razorpay order."},{status:502})
  order=await response.json()
 } catch(error) {
  captureError(error,{scope:"razorpay/webhook",stage:"order_lookup",paymentId,orderId})
  return NextResponse.json({error:"Could not reconcile Razorpay order."},{status:502})
 }
 const notes=order.notes&&typeof order.notes==="object" ? order.notes as Record<string,unknown> : {}
 const userId=typeof notes.user_id==="string" ? notes.user_id : undefined
 const plan=resolveRazorpayOrderPlan(order)
 if(!userId||!plan) return NextResponse.json({ok:true,event:eventName,skipped:true})
 if(payment.status!=="captured" || payment.order_id!==orderId ||
    payment.amount!==plan.amountPaise || payment.currency!=="INR" ||
    order.amount!==plan.amountPaise || order.currency!=="INR") {
  captureError(new Error("Razorpay payment capture, order, amount or currency mismatch"),{scope:"razorpay/webhook",paymentId,orderId,userId})
  return NextResponse.json({ok:false,error:"Payment details did not pass reconciliation."},{status:409})
 }
 const admin=createAdminClient()
 try {
  const recorded=await recordPaymentOnce(admin,{paymentId,orderId,userId,amount:plan.amountPaise,currency:"INR",source:"webhook",planKey:plan.planKey,entitlementDays:plan.entitlementDays})
  if(recorded==="replayed-by-other-user") {
   captureError(new Error("Payment replay or mismatched details"),{scope:"razorpay/webhook",paymentId,userId})
   return NextResponse.json({ok:false,event:eventName,skipped:true})
  }
  await grantPaymentEntitlement(admin,paymentId)
  if(plan.affiliateEligible) {
   // A failed affiliate write must fail the webhook so Razorpay retries it.
   // Payment and entitlement writes are idempotent on the retry.
   await recordAnnualAffiliateCommission(admin,{userId,paymentId,paymentAmount:plan.amountPaise,commissionAmount:plan.affiliateCommissionPaise})
  }
  logger.info("[webhook] Premium activation handled",{event:eventName,userId,planKey:plan.planKey})
  return NextResponse.json({ok:true,event:eventName})
 } catch(error) {
  captureError(error,{scope:"razorpay/webhook",stage:"activation",paymentId,userId})
  return NextResponse.json({error:"Activation failed; Razorpay retry expected."},{status:500})
 }
}

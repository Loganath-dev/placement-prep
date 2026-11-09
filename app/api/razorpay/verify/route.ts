import { NextResponse } from "next/server"
import { getRazorpayEnvOrNull } from "@/lib/env"
import { captureError } from "@/lib/logger"
import { hmacSha256Hex,timingSafeStringEqual } from "@/lib/crypto/edge-hmac"
import { grantPaymentEntitlement,recordAnnualAffiliateCommission,recordPaymentOnce } from "@/lib/entitlement"
import { resolveRazorpayOrderPlan } from "@/lib/subscriptions/plans"
import { rateLimit } from "@/lib/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(request:Request) {
 const razorpay=getRazorpayEnvOrNull()
 if(!razorpay) return NextResponse.json({error:"Razorpay keys are not configured."},{status:500})
 const supabase=await createClient()
 const {data:{user}}=await supabase.auth.getUser()
 if(!user) return NextResponse.json({error:"Not authenticated."},{status:401})
 const {allowed}=await rateLimit(`verify:${user.id}`,10,3600000)
 if(!allowed) return NextResponse.json({error:"Too many requests. Try again later."},{status:429})
 const body=await request.json().catch(()=>({}))
 const orderId=String(body.razorpay_order_id??"")
 const paymentId=String(body.razorpay_payment_id??"")
 const signature=String(body.razorpay_signature??"")
 if(!orderId||!paymentId||!signature) return NextResponse.json({error:"Missing Razorpay verification fields."},{status:400})
 const expected=await hmacSha256Hex(razorpay.keySecret,`${orderId}|${paymentId}`)
 if(!timingSafeStringEqual(expected,signature)) return NextResponse.json({error:"Invalid payment signature."},{status:400})
 const response=await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`,{
  headers:{Authorization:`Basic ${btoa(`${razorpay.keyId}:${razorpay.keySecret}`)}`},cache:"no-store"
 })
 if(!response.ok) return NextResponse.json({error:"Could not confirm the order with Razorpay. Try again."},{status:502})
 const order=await response.json()
 if(order?.notes?.user_id!==user.id) return NextResponse.json({error:"This payment belongs to a different account."},{status:403})
 const plan=resolveRazorpayOrderPlan(order)
 if(!plan) return NextResponse.json({error:"Order does not match an active or grandfathered StudyBench plan."},{status:400})
 const admin=createAdminClient()
 try {
  const recorded=await recordPaymentOnce(admin,{paymentId,orderId,userId:user.id,amount:plan.amountPaise,currency:"INR",source:"verify",planKey:plan.planKey,entitlementDays:plan.entitlementDays})
  if(recorded==="replayed-by-other-user") return NextResponse.json({error:"Payment already used or details do not match."},{status:409})
  const premiumUntil=await grantPaymentEntitlement(admin,paymentId)
  if(plan.affiliateEligible) {
   try { await recordAnnualAffiliateCommission(admin,{userId:user.id,paymentId,paymentAmount:plan.amountPaise}) }
   catch(error) { captureError(error,{scope:"razorpay/verify",stage:"affiliate",userId:user.id,paymentId}) }
  }
  return NextResponse.json({ok:true,paymentId,premiumUntil,planKey:plan.planKey})
 } catch(error) {
  captureError(error,{scope:"razorpay/verify",stage:"activation",userId:user.id,paymentId})
  return NextResponse.json({error:"Payment verified but could not activate Premium. Contact support."},{status:500})
 }
}

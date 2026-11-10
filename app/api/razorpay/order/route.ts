import { NextResponse } from "next/server"
import { getActivePurchasePlan } from "@/lib/subscriptions/plans"
import { getRazorpayEnvOrNull } from "@/lib/env"
import { rateLimit } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"

export async function POST(request:Request) {
 const body=await request.json().catch(()=>({})) as {planKey?:unknown}
 const plan=getActivePurchasePlan(body.planKey)
 if(!plan) return NextResponse.json({error:"Choose a valid Premium plan."},{status:400})
 const razorpay=getRazorpayEnvOrNull()
 if(!razorpay) return NextResponse.json({error:"Razorpay keys are not configured."},{status:500})
 const supabase=await createClient()
 const {data:{user}}=await supabase.auth.getUser()
 if(!user) return NextResponse.json({error:"Not authenticated."},{status:401})
 const {data:current,error}=await supabase.from("user_state").select("premium,premium_until").eq("id",user.id).maybeSingle()
 if(error) return NextResponse.json({error:"Could not verify your subscription status."},{status:500})
 if(current?.premium&&!current.premium_until)
  return NextResponse.json({error:"Your account already has non-expiring Premium access."},{status:409})
 const {allowed}=await rateLimit(`order:${user.id}`,5,3600000)
 if(!allowed) return NextResponse.json({error:"Too many requests. Try again later."},{status:429})
 const receipt=`sb_${user.id.slice(0,8)}_${Date.now()}`
 const response=await fetch("https://api.razorpay.com/v1/orders",{
  method:"POST",headers:{"Content-Type":"application/json",Authorization:`Basic ${btoa(`${razorpay.keyId}:${razorpay.keySecret}`)}`},
  body:JSON.stringify({amount:plan.amountPaise,currency:"INR",receipt,notes:{user_id:user.id,plan_key:plan.planKey}})
 })
 const data=await response.json()
 if(!response.ok) return NextResponse.json({error:data?.error?.description??"Could not create Razorpay order."},{status:response.status})
 return NextResponse.json({keyId:razorpay.keyId,orderId:data.id,amount:data.amount,currency:data.currency,planName:`StudyBench ${plan.name}`})
}

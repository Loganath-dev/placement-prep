import { afterEach,beforeEach,describe,expect,it,vi } from "vitest"
import { PREMIUM_AMOUNT_PAISE,PREMIUM_PLAN_KEY } from "@/lib/access"
import { hmacSha256Hex } from "@/lib/crypto/edge-hmac"

vi.mock("@/lib/supabase/server",()=>({createClient:vi.fn()}))
vi.mock("@/lib/supabase/admin",()=>({createAdminClient:vi.fn(()=>({}))}))
vi.mock("@/lib/rate-limit",()=>({rateLimit:vi.fn(async()=>({allowed:true,remaining:9}))}))
vi.mock("@/lib/env",()=>({
 getRazorpayEnvOrNull:vi.fn(()=>({keyId:"kid",keySecret:"secret"})),
 getRazorpayWebhookSecretOrNull:vi.fn(()=>"webhook-secret"),
}))
vi.mock("@/lib/entitlement",()=>({
 recordPaymentOnce:vi.fn(async()=>"recorded"),
 grantPaymentEntitlement:vi.fn(async()=>"2027-11-09T00:00:00.000Z"),
 recordAnnualAffiliateCommission:vi.fn(async()=>undefined),
}))
vi.mock("@/lib/logger",()=>({captureError:vi.fn(),logger:{info:vi.fn(),warn:vi.fn(),error:vi.fn(),debug:vi.fn()}}))

import { createClient } from "@/lib/supabase/server"
import { rateLimit } from "@/lib/rate-limit"
import { getRazorpayEnvOrNull } from "@/lib/env"
import { recordPaymentOnce,grantPaymentEntitlement,recordAnnualAffiliateCommission } from "@/lib/entitlement"
import { POST as orderPOST } from "@/app/api/razorpay/order/route"
import { POST as verifyPOST } from "@/app/api/razorpay/verify/route"
import { POST as webhookPOST } from "@/app/api/razorpay/webhook/route"

const USER={id:"user-1",email:"student@example.com"}
const AMOUNT=PREMIUM_AMOUNT_PAISE
function mockAuth(user:unknown,state:Record<string,unknown>|null=null) {
 vi.mocked(createClient).mockResolvedValue({
  auth:{getUser:async()=>({data:{user}})},
  from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:state,error:null})})})}),
 } as never)
}
function req(body:unknown) { return new Request("http://localhost/api",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}) }
function annualOrder(overrides:Record<string,unknown>={}) {
 return {notes:{user_id:USER.id,plan_key:PREMIUM_PLAN_KEY},amount:AMOUNT,currency:"INR",...overrides}
}
beforeEach(()=>{
 vi.clearAllMocks()
 vi.mocked(rateLimit).mockResolvedValue({allowed:true,remaining:9})
 vi.mocked(getRazorpayEnvOrNull).mockReturnValue({keyId:"kid",keySecret:"secret",webhookSecret:"webhook-secret"})
 vi.mocked(recordPaymentOnce).mockResolvedValue("recorded")
 vi.mocked(grantPaymentEntitlement).mockResolvedValue("2027-11-09T00:00:00.000Z")
})
afterEach(()=>vi.unstubAllGlobals())

describe("Razorpay annual checkout",()=>{
 it("requires authentication",async()=>{mockAuth(null);expect((await orderPOST()).status).toBe(401)})
 it("blocks checkout for a grandfathered non-expiring account",async()=>{
  mockAuth(USER,{premium:true,premium_until:null})
  expect((await orderPOST()).status).toBe(409)
 })
 it("creates exactly one ₹249 annual plan order",async()=>{
  mockAuth(USER)
  const fetchMock=vi.fn(async(_url:string,init:RequestInit)=>({ok:true,json:async()=>({id:"order_1",amount:AMOUNT,currency:"INR"}),init}))
  vi.stubGlobal("fetch",fetchMock)
  const response=await orderPOST()
  expect(response.status).toBe(200)
  const sent=JSON.parse(fetchMock.mock.calls[0][1].body as string)
  expect(sent.amount).toBe(24900)
  expect(sent.notes).toEqual({user_id:USER.id,plan_key:PREMIUM_PLAN_KEY})
 })
 it("honours rate limits",async()=>{
  mockAuth(USER);vi.mocked(rateLimit).mockResolvedValue({allowed:false,remaining:0})
  expect((await orderPOST()).status).toBe(429)
 })
})

describe("Razorpay payment verification",()=>{
 const orderId="order_1",paymentId="pay_1"
 async function signature(){return hmacSha256Hex("secret",`${orderId}|${paymentId}`)}
 function mockOrder(order:Record<string,unknown>){vi.stubGlobal("fetch",vi.fn(async()=>({ok:true,json:async()=>order})))}
 it("requires authentication",async()=>{mockAuth(null);expect((await verifyPOST(req({}))).status).toBe(401)})
 it("rejects invalid signatures",async()=>{
  mockAuth(USER)
  expect((await verifyPOST(req({razorpay_order_id:orderId,razorpay_payment_id:paymentId,razorpay_signature:"bad"}))).status).toBe(400)
 })
 it("records plan metadata, grants once and creates the fixed affiliate reward",async()=>{
  mockAuth(USER);mockOrder(annualOrder())
  const response=await verifyPOST(req({razorpay_order_id:orderId,razorpay_payment_id:paymentId,razorpay_signature:await signature()}))
  expect(response.status).toBe(200)
  expect(recordPaymentOnce).toHaveBeenCalledWith(expect.anything(),expect.objectContaining({amount:24900,planKey:PREMIUM_PLAN_KEY,entitlementDays:365}))
  expect(grantPaymentEntitlement).toHaveBeenCalledWith(expect.anything(),paymentId)
  expect(recordAnnualAffiliateCommission).toHaveBeenCalledWith(expect.anything(),{userId:USER.id,paymentId,paymentAmount:24900})
 })
 it("rejects order ownership and amount mismatch",async()=>{
  mockAuth(USER);mockOrder(annualOrder({notes:{user_id:"other",plan_key:PREMIUM_PLAN_KEY}}))
  const wrongOwner=await verifyPOST(req({razorpay_order_id:orderId,razorpay_payment_id:paymentId,razorpay_signature:await signature()}))
  expect(wrongOwner.status).toBe(403)
  mockOrder(annualOrder({amount:49900}))
  const wrongAmount=await verifyPOST(req({razorpay_order_id:orderId,razorpay_payment_id:paymentId,razorpay_signature:await signature()}))
  expect(wrongAmount.status).toBe(400)
 })
 it("accepts already-created legacy yearly orders without commission",async()=>{
  mockAuth(USER);mockOrder({notes:{user_id:USER.id},amount:49900,currency:"INR"})
  const response=await verifyPOST(req({razorpay_order_id:orderId,razorpay_payment_id:paymentId,razorpay_signature:await signature()}))
  expect(response.status).toBe(200)
  expect(recordAnnualAffiliateCommission).not.toHaveBeenCalled()
 })
})

describe("Razorpay webhook reconciliation",()=>{
 function signed(payload:unknown,signature:string){return new Request("http://localhost/api",{method:"POST",headers:{"x-razorpay-signature":signature},body:JSON.stringify(payload)})}
 async function sign(payload:unknown){return hmacSha256Hex("webhook-secret",JSON.stringify(payload))}
 it("rejects invalid webhook signatures",async()=>{expect((await webhookPOST(signed({event:"payment.captured"},"bad"))).status).toBe(400)})
 it("ignores non-captured events",async()=>{
  const payload={event:"payment.failed"}
  expect((await webhookPOST(signed(payload,await sign(payload)))).status).toBe(200)
  expect(grantPaymentEntitlement).not.toHaveBeenCalled()
 })
 it("loads the Razorpay order and grants the verified annual plan",async()=>{
  vi.stubGlobal("fetch",vi.fn(async()=>({ok:true,json:async()=>annualOrder()})))
  const payload={event:"payment.captured",payload:{payment:{entity:{id:"pay_2",order_id:"order_2",amount:24900,currency:"INR"}}}}
  const response=await webhookPOST(signed(payload,await sign(payload)))
  expect(response.status).toBe(200)
  expect(recordPaymentOnce).toHaveBeenCalledWith(expect.anything(),expect.objectContaining({planKey:PREMIUM_PLAN_KEY,entitlementDays:365}))
  expect(grantPaymentEntitlement).toHaveBeenCalledWith(expect.anything(),"pay_2")
 })
})

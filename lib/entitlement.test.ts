import { describe, expect, it, vi } from "vitest"
import { grantPaymentEntitlement, recordPaymentOnce, type PaymentInput } from "@/lib/entitlement"

const payment:PaymentInput={
 paymentId:"pay_1",orderId:"order_1",userId:"user_1",amount:24900,currency:"INR",
 source:"verify",planKey:"premium_annual_249",entitlementDays:365,
}
function fakeAdmin(options:{insertError?:{code:string;message:string};existing?:Record<string,unknown>}={}) {
 const calls:{inserted?:Record<string,unknown>}={}
 const admin={
  from:()=>({
   insert:async(row:Record<string,unknown>)=>{calls.inserted=row;return {error:options.insertError??null}},
   select:()=>({eq:()=>({single:async()=>({data:options.existing??null,error:null})})}),
  }),
 }
 return {admin:admin as never,calls}
}
describe("recordPaymentOnce",()=>{
 it("writes the annual plan metadata to the append-only payment ledger",async()=>{
  const {admin,calls}=fakeAdmin()
  await expect(recordPaymentOnce(admin,payment)).resolves.toBe("recorded")
  expect(calls.inserted).toMatchObject({payment_id:"pay_1",amount:24900,plan_key:"premium_annual_249",entitlement_days:365})
 })
 it("accepts an identical retry",async()=>{
  const {admin}=fakeAdmin({insertError:{code:"23505",message:"duplicate"},existing:{
   user_id:"user_1",order_id:"order_1",amount:24900,plan_key:"premium_annual_249",entitlement_days:365
  }})
  await expect(recordPaymentOnce(admin,payment)).resolves.toBe("already-recorded")
 })
 it("rejects cross-account or mismatched payment replay",async()=>{
  const {admin}=fakeAdmin({insertError:{code:"23505",message:"duplicate"},existing:{
   user_id:"other",order_id:"order_1",amount:24900,plan_key:"premium_annual_249",entitlement_days:365
  }})
  await expect(recordPaymentOnce(admin,payment)).resolves.toBe("replayed-by-other-user")
 })
})
describe("grantPaymentEntitlement",()=>{
 it("uses the transaction-safe database grant function",async()=>{
  const rpc=vi.fn(async()=>({data:"2027-11-09T00:00:00.000Z",error:null}))
  await expect(grantPaymentEntitlement({rpc} as never,"pay_1")).resolves.toBe("2027-11-09T00:00:00.000Z")
  expect(rpc).toHaveBeenCalledWith("grant_payment_entitlement",{p_payment_id:"pay_1"})
 })
 it("does not fail when a grandfathered entitlement has no expiry",async()=>{
  const admin={rpc:vi.fn(async()=>({data:null,error:null}))}
  await expect(grantPaymentEntitlement(admin as never,"pay_legacy")).resolves.toBeNull()
 })
 it("surfaces database failures for provider retry",async()=>{
  const admin={rpc:vi.fn(async()=>({data:null,error:{message:"database unavailable"}}))}
  await expect(grantPaymentEntitlement(admin as never,"pay_1")).rejects.toThrow("database unavailable")
 })
})

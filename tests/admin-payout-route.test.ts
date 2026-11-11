import { describe, expect, it, vi, beforeEach } from "vitest"

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }))
vi.mock("@/lib/admin", () => ({ requireAdmin: vi.fn(async () => ({ id: "admin-user-1" })) }))
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn(() => ({ rpc })) }))

import { POST } from "@/app/api/admin/referrals/payout/route"

const COMMISSION_ID = "123e4567-e89b-42d3-a456-426614174000"

function request(body: unknown) {
  return new Request("http://localhost/api/admin/referrals/payout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/admin/referrals/payout", () => {
  beforeEach(() => rpc.mockReset())

  it("rejects null or malformed bodies without calling the payout RPC", async () => {
    const response = await POST(request(null))
    expect(response.status).toBe(400)
    expect(rpc).not.toHaveBeenCalled()
  })

  it("requires a valid commission UUID and non-empty transaction reference", async () => {
    expect((await POST(request({ commissionId: "bad", transactionId: "upi-ref" }))).status).toBe(400)
    expect((await POST(request({ commissionId: COMMISSION_ID, transactionId: " " }))).status).toBe(400)
    expect(rpc).not.toHaveBeenCalled()
  })

  it("settles through the service-side RPC with the MFA-verified admin identity", async () => {
    rpc.mockResolvedValue({ data: "payout-row-1", error: null })
    const response = await POST(request({ commissionId: COMMISSION_ID, transactionId: "UPI-REF-123" }))
    expect(response.status).toBe(200)
    expect(rpc).toHaveBeenCalledWith("admin_pay_affiliate_commission", {
      p_commission_id: COMMISSION_ID,
      p_transaction_id: "UPI-REF-123",
      p_paid_by: "admin-user-1",
    })
  })

  it("does not expose raw database errors to the admin client", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "internal SQL details" } })
    const response = await POST(request({ commissionId: COMMISSION_ID, transactionId: "UPI-REF-123" }))
    expect(response.status).toBe(409)
    expect((await response.json()).error).not.toContain("internal SQL details")
  })
})

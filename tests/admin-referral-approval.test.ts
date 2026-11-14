import { beforeEach, describe, expect, it, vi } from "vitest"

const { requireAdminMfa, rpc, hasTrustedRequestOrigin } = vi.hoisted(() => ({
  requireAdminMfa: vi.fn(),
  rpc: vi.fn(),
  hasTrustedRequestOrigin: vi.fn(),
}))

vi.mock("@/lib/admin", () => ({ requireAdminMfa }))
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({ rpc })),
}))
vi.mock("@/lib/security/request-origin", () => ({ hasTrustedRequestOrigin }))

import { POST } from "@/app/api/admin/referrals/approve/route"

const ID = "123e4567-e89b-42d3-a456-426614174000"

beforeEach(() => {
  vi.clearAllMocks()
  hasTrustedRequestOrigin.mockReturnValue(true)
  requireAdminMfa.mockResolvedValue({ id: "admin-user" })
  rpc.mockResolvedValue({ data: ID, error: null })
})

describe("POST /api/admin/referrals/approve", () => {
  it("requires a trusted request origin", async () => {
    hasTrustedRequestOrigin.mockReturnValueOnce(false)
    const response = await POST(new Request("https://studybench.in/api/admin/referrals/approve", {
      method: "POST", body: JSON.stringify({ commissionId: ID }),
    }))
    expect(response.status).toBe(403)
    expect(requireAdminMfa).not.toHaveBeenCalled()
  })

  it("requires MFA and calls the database's manual verification RPC", async () => {
    const response = await POST(new Request("https://studybench.in/api/admin/referrals/approve", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ commissionId: ID }),
    }))
    expect(response.status).toBe(200)
    expect(requireAdminMfa).toHaveBeenCalledOnce()
    expect(rpc).toHaveBeenCalledWith("admin_approve_affiliate_commission", {
      p_commission_id: ID, p_approved_by: "admin-user",
    })
  })

  it("rejects malformed commission IDs", async () => {
    const response = await POST(new Request("https://studybench.in/api/admin/referrals/approve", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ commissionId: "bad-id" }),
    }))
    expect(response.status).toBe(400)
    expect(rpc).not.toHaveBeenCalled()
  })

  it("returns a conflict when the database rejects review or eligibility", async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: "15-day period not complete" } })
    const response = await POST(new Request("https://studybench.in/api/admin/referrals/approve", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ commissionId: ID }),
    }))
    expect(response.status).toBe(409)
  })
})

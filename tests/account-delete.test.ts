import { beforeEach, describe, expect, it, vi } from "vitest"

const { getUser, rpc, deleteUser } = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
  deleteUser: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser } })),
}))
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({ rpc, auth: { admin: { deleteUser } } })),
}))

import { POST } from "@/app/api/account/delete/route"

const USER = { id: "user-1" }

beforeEach(() => {
  vi.clearAllMocks()
  getUser.mockResolvedValue({ data: { user: USER } })
  rpc.mockImplementation(async (name: string) => name === "assert_financial_erasure_schema_ready"
    ? { data: true, error: null }
    : { error: null })
  deleteUser.mockResolvedValue({ error: null })
})

describe("POST /api/account/delete", () => {
  it("checks financial retention schema before erasing application data and Auth identity", async () => {
    const sequence: string[] = []
    rpc.mockImplementation(async (name: string) => {
      sequence.push(name)
      return { data: true, error: null }
    })
    deleteUser.mockImplementation(async () => {
      sequence.push("delete-auth-user")
      return { error: null }
    })

    const response = await POST(new Request("http://localhost/api/account/delete", { method: "POST" }))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(sequence).toEqual([
      "assert_financial_erasure_schema_ready",
      "erase_user_data",
      "delete-auth-user",
    ])
  })

  it("fails closed when financial foreign keys are not safe for account erasure", async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: "schema not migrated" } })
    const response = await POST(new Request("http://localhost/api/account/delete", { method: "POST" }))
    expect(response.status).toBe(503)
    expect(rpc).toHaveBeenCalledOnce()
    expect(deleteUser).not.toHaveBeenCalled()
    expect((await response.json()).error).toContain("financial-record retention")
  })

  it("does not delete the Auth identity when transactional cleanup fails", async () => {
    rpc.mockResolvedValueOnce({ data: true, error: null }).mockResolvedValueOnce({ error: { message: "database unavailable" } })
    const response = await POST(new Request("http://localhost/api/account/delete", { method: "POST" }))
    expect(response.status).toBe(500)
    expect(deleteUser).not.toHaveBeenCalled()
    expect((await response.json()).error).toContain("could not be erased")
  })

  it("reports incomplete closure if Auth deletion fails after data erasure", async () => {
    deleteUser.mockResolvedValueOnce({ error: { message: "Auth API unavailable" } })
    const response = await POST(new Request("http://localhost/api/account/delete", { method: "POST" }))
    expect(response.status).toBe(500)
    expect(rpc).toHaveBeenNthCalledWith(1, "assert_financial_erasure_schema_ready")
    expect(rpc).toHaveBeenNthCalledWith(2, "erase_user_data", { p_user_id: USER.id })
    expect((await response.json()).error).toContain("account closure could not finish")
  })

  it("requires an authenticated user", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } })
    const response = await POST(new Request("http://localhost/api/account/delete", { method: "POST" }))
    expect(response.status).toBe(401)
    expect(rpc).not.toHaveBeenCalled()
    expect(deleteUser).not.toHaveBeenCalled()
  })
})

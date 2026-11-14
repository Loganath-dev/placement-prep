import { beforeEach, describe, expect, it, vi } from "vitest"

const { getUser, from, insert } = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
  insert: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser } })),
}))
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({ from })),
}))
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(async () => ({ allowed: true, remaining: 2 })),
}))

import { POST } from "@/app/api/affiliate/apply/route"
import { AFFILIATE_PRIVACY_VERSION, AFFILIATE_TERMS_VERSION } from "@/lib/affiliate-terms"

const USER = { id: "user-1", email: "student@example.com", email_confirmed_at: "2026-01-01T00:00:00Z" }

function request() {
  return new Request("http://localhost/api/affiliate/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      termsAccepted: true,
      privacyAccepted: true,
      upiId: "student@bank",
      upiName: "Student Name",
    }),
  })
}

function query(data: unknown) {
  const q: Record<string, unknown> = {}
  q.select = () => q
  q.eq = () => q
  q.maybeSingle = async () => ({ data, error: null })
  q.insert = insert
  return q
}

beforeEach(() => {
  vi.clearAllMocks()
  getUser.mockResolvedValue({ data: { user: USER } })
  insert.mockResolvedValue({ error: null })
  from.mockImplementation(() => query(null))
})

describe("POST /api/affiliate/apply payout destination protection", () => {
  it("creates an application with a single insert", async () => {
    const response = await POST(request())
    expect(response.status).toBe(200)
    expect(insert).toHaveBeenCalledOnce()
    expect(insert.mock.calls[0][0]).toMatchObject({
      user_id: USER.id,
      upi_id: "student@bank",
      upi_name: "Student Name",
      status: "active",
      terms_version: AFFILIATE_TERMS_VERSION,
      privacy_version: AFFILIATE_PRIVACY_VERSION,
    })
  })

  it("returns conflict when a concurrent application already inserted the account", async () => {
    insert.mockResolvedValueOnce({ error: { code: "23505", message: "duplicate key" } })
    let lookupCount = 0
    from.mockImplementation(() => {
      lookupCount += 1
      return query(lookupCount === 3 ? { user_id: USER.id } : null)
    })
    const response = await POST(request())
    expect(response.status, `affiliate account lookups: ${lookupCount}`).toBe(409)
    expect((await response.json()).error).toContain("already exists")
  })

  it("does not overwrite an existing payout destination", async () => {
    from.mockImplementation(() => query({ referral_code: "ABCDEF123456" }))
    const response = await POST(request())
    expect(response.status).toBe(409)
    expect(insert).not.toHaveBeenCalled()
  })

  it("requires verified email before accepting payout details", async () => {
    getUser.mockResolvedValueOnce({ data: { user: { id: USER.id, email: USER.email } } })
    const response = await POST(request())
    expect(response.status).toBe(403)
    expect(insert).not.toHaveBeenCalled()
  })
})

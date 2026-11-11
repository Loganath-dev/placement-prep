import { beforeEach, describe, expect, it, vi } from "vitest"

const { getUser, update, eq, select, maybeSingle, rateLimit } = vi.hoisted(() => ({
  getUser: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  maybeSingle: vi.fn(),
  rateLimit: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser } })),
}))
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: () => ({ update, eq, select, maybeSingle }),
  })),
}))
vi.mock("@/lib/rate-limit", () => ({ rateLimit }))

import { POST } from "@/app/api/affiliate/terms/accept/route"

function request(body: unknown) {
  return new Request("http://localhost/api/affiliate/terms/accept", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  getUser.mockResolvedValue({ data: { user: { id: "affiliate-1" } } })
  rateLimit.mockResolvedValue({ allowed: true })
  update.mockReturnValue({ eq })
  eq.mockReturnValue({ select })
  select.mockReturnValue({ maybeSingle })
  maybeSingle.mockResolvedValue({
    data: {
      user_id: "affiliate-1",
      terms_version: "affiliate-2026-11-10-v2",
      privacy_version: "privacy-2026-11-10",
      accepted_at: "2026-11-10T00:00:00.000Z",
    },
    error: null,
  })
})

describe("POST /api/affiliate/terms/accept", () => {
  it("requires both current documents to be accepted", async () => {
    const response = await POST(request({ termsAccepted: true, privacyAccepted: false }))
    expect(response.status).toBe(400)
    expect(update).not.toHaveBeenCalled()
  })

  it("records the current terms version for the authenticated affiliate only", async () => {
    const response = await POST(request({ termsAccepted: true, privacyAccepted: true }))
    expect(response.status).toBe(200)
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      terms_version: "affiliate-2026-11-10-v2",
      privacy_version: "privacy-2026-11-10",
    }))
    expect(eq).toHaveBeenCalledWith("user_id", "affiliate-1")
  })

  it("returns not found when the user has no affiliate account", async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null })
    const response = await POST(request({ termsAccepted: true, privacyAccepted: true }))
    expect(response.status).toBe(404)
  })
})

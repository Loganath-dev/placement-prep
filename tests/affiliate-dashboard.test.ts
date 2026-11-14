import { beforeEach, describe, expect, it, vi } from "vitest"

const { getUser, from } = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser } })),
}))
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({ from })),
}))

import { GET } from "@/app/api/affiliate/dashboard/route"

function queryResult(data: unknown, count: number | null = null) {
  const result = { data, count, error: null }
  const query: Record<string, unknown> = {}
  query.select = () => query
  query.eq = () => query
  query.in = () => query
  query.order = () => query
  query.maybeSingle = async () => result
  query.then = (resolve: (value: typeof result) => unknown, reject?: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject)
  return query
}

describe("GET /api/affiliate/dashboard privacy boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUser.mockResolvedValue({ data: { user: { id: "referrer-1" } } })
    from.mockImplementation((table: string) => {
      if (table === "affiliate_accounts") {
        return queryResult({
          referral_code: "SB-ABCD-1234-EFGH",
          status: "active",
          terms_version: "v1",
          privacy_version: "v1",
          accepted_at: "2026-01-01T00:00:00.000Z",
          upi_id: "owner@bank",
          upi_name: "Account Owner",
        })
      }
      if (table === "affiliate_commissions") {
        return queryResult([{
          id: "commission-1",
          buyer_id: "private-buyer-id",
          payment_id: "private-payment-id",
          payment_amount: 49900,
          commission_amount: 5000,
          status: "approved",
          eligible_date: "2026-01-16T00:00:00.000Z",
          created_at: "2026-01-01T00:00:00.000Z",
        }, {
          id: "commission-refunded",
          buyer_id: "refunded-buyer-id",
          payment_id: "refunded-payment-id",
          payment_amount: 29900,
          commission_amount: 2500,
          status: "refunded",
          eligible_date: "2026-01-16T00:00:00.000Z",
          created_at: "2026-01-02T00:00:00.000Z",
        }])
      }
      if (table === "profiles") return queryResult([
        { id: "private-student-1", name: "Student One", created_at: "2026-11-01T00:00:00.000Z" },
        { id: "private-student-2", name: "Student Two", created_at: "2026-11-02T00:00:00.000Z" },
        { id: "private-student-3", name: "Student Three", created_at: "2026-11-03T00:00:00.000Z" },
        { id: "private-student-4", name: "Student Four", created_at: "2026-11-04T00:00:00.000Z" },
      ], 4)
      if (table === "payments") return queryResult([
        { user_id: "private-student-1", amount: 49900, created_at: "2026-11-05T00:00:00.000Z" },
      ])
      if (table === "affiliate_payouts") return queryResult([])
      throw new Error(`Unexpected table: ${table}`)
    })
  })

  it("returns only attributed referral names and reconciled plan status without private identifiers", async () => {
    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toMatchObject({
      referralsCount: 4,
      referrals: [
        { studentName: "Student Four", joinedAt: "2026-11-04T00:00:00.000Z", planLabel: "No Premium purchase", paymentStatus: "No Premium purchase yet" },
        { studentName: "Student Three", joinedAt: "2026-11-03T00:00:00.000Z" },
        { studentName: "Student Two", joinedAt: "2026-11-02T00:00:00.000Z" },
        { studentName: "Student One", joinedAt: "2026-11-01T00:00:00.000Z", planLabel: "1-year Premium (₹499)", paymentStatus: "Premium payment captured" },
      ],
      premiumConversions: 1,
      commissions: [
        { id: "commission-1", planLabel: "1-year Premium (₹499)", commission_amount: 5000, status: "approved" },
        { id: "commission-refunded", planLabel: "6-month Premium (₹299)", commission_amount: 2500, status: "refunded" },
      ],
    })
    const serialized = JSON.stringify(body)
    expect(body.commissions).toHaveLength(2)
    expect(body.commissions.map((row: { id: string }) => row.id)).toEqual(["commission-1", "commission-refunded"])
    expect(body.commissions.find((row: { id: string }) => row.id === "commission-refunded")?.status).toBe("refunded")
    expect(serialized).not.toContain("private-buyer-id")
    expect(serialized).not.toContain("private-payment-id")
    expect(serialized).not.toContain("private-student-1")
    expect(serialized).not.toContain("49900")
    expect(serialized).not.toContain("buyer_id")
    expect(serialized).not.toContain("payment_id")
    expect(response.headers.get("Cache-Control")).toContain("no-store")
  })

  it("labels an untagged ₹24900 commission as annual, matching the live ledger", async () => {
    from.mockImplementation((table: string) => {
      if (table === "affiliate_accounts") return queryResult({ referral_code: "SB-ABCD-1234-EFGH", status: "active" })
      if (table === "affiliate_commissions") return queryResult([{
        id: "commission-249", buyer_id: "buyer", payment_id: "payment",
        payment_amount: 24900, commission_amount: 2500, status: "pending",
        eligible_date: "2026-11-25T00:00:00.000Z", created_at: "2026-11-10T00:00:00.000Z",
      }])
      if (table === "profiles") return queryResult(null, 1)
      if (table === "affiliate_payouts") return queryResult([])
      throw new Error(`Unexpected table: ${table}`)
    })
    const response = await GET()
    expect((await response.json()).commissions[0].planLabel).toBe("Legacy 1-year Premium (₹249)")
  })

  it("scopes referred student details to the authenticated affiliate", async () => {
    const response = await GET()
    const body = await response.json()
    expect(body.referrals).toHaveLength(4)
    expect(body.referrals.map((row: { studentName: string }) => row.studentName)).toContain("Student One")
    expect(from).toHaveBeenCalledWith("profiles")
    expect(response.status).toBe(200)
  })

  it("requires an authenticated affiliate", async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } })
    const response = await GET()
    expect(response.status).toBe(401)
  })
})

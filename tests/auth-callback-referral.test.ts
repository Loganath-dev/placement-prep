import { beforeEach, describe, expect, it, vi } from "vitest"

const { exchangeCodeForSession, verifyOtp, from } = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  verifyOtp: vi.fn(),
  from: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession, verifyOtp },
  })),
}))

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({ from })),
}))

import { GET } from "@/app/auth/callback/route"

const USER_ID = "student-1"
const REFERRER_ID = "affiliate-1"
const REFERRAL_CODE = "A1B2C3D4E5F6"

function request(next = "/dashboard") {
  return new Request(
    `https://studybench.in/auth/callback?code=valid-code&ref=${REFERRAL_CODE}&next=${encodeURIComponent(next)}`,
  )
}

function query<T>(result: T) {
  const builder: Record<string, unknown> = {}
  builder.select = vi.fn(() => builder)
  builder.eq = vi.fn(() => builder)
  builder.is = vi.fn(() => builder)
  builder.maybeSingle = async () => result
  builder.then = (resolve: (value: T) => unknown, reject?: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject)
  return builder
}

function configure(profileResult: unknown, options?: {
  insertError?: { code?: string; message?: string } | null
  profileError?: { message: string } | null
  affiliateResult?: { user_id: string } | null
  affiliateError?: { message: string } | null
}) {
  const insert = vi.fn().mockResolvedValue({ error: options?.insertError ?? null })
  const update = vi.fn()
  const profileQuery = query({ data: profileResult, error: options?.profileError ?? null })
  profileQuery.insert = insert
  profileQuery.update = update.mockReturnValue(profileQuery)

  from.mockImplementation((table: string) => {
    if (table === "affiliate_accounts") {
      return query({
        data: options?.affiliateResult === undefined ? { user_id: REFERRER_ID } : options.affiliateResult,
        error: options?.affiliateError ?? null,
      })
    }
    if (table === "profiles") return profileQuery
    throw new Error(`Unexpected table: ${table}`)
  })

  return { insert, update, profileQuery }
}

beforeEach(() => {
  vi.clearAllMocks()
  exchangeCodeForSession.mockResolvedValue({
    data: { user: { id: USER_ID } },
    error: null,
  })
})

describe("auth callback referral attribution", () => {

  it("does not query affiliate data when no referral code is supplied", async () => {
    const response = await GET(new Request("https://studybench.in/auth/callback?code=valid-code"))

    expect(response.status).toBe(307)
    expect(from).not.toHaveBeenCalled()
  })

  it("does not create a profile for an inactive or unknown affiliate code", async () => {
    const { insert, update } = configure(null, { affiliateResult: null })

    await GET(request())

    expect(insert).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it("rejects self-referral", async () => {
    const { insert, update } = configure(null, {
      affiliateResult: { user_id: USER_ID },
    })

    await GET(request())

    expect(insert).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it("does not write attribution when affiliate lookup fails", async () => {
    const { insert, update } = configure(null, {
      affiliateError: { message: "temporary database failure" },
    })

    await GET(request())

    expect(insert).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it("does not attempt a conditional update after a non-duplicate insert failure", async () => {
    const { insert, update } = configure(null, {
      insertError: { code: "42501", message: "permission denied" },
    })

    await GET(request())

    expect(insert).toHaveBeenCalledOnce()
    expect(update).not.toHaveBeenCalled()
  })

  it("supports email verification tokens", async () => {
    verifyOtp.mockResolvedValueOnce({
      data: { user: { id: USER_ID } },
      error: null,
    })
    configure({ id: USER_ID, referred_by: REFERRER_ID })

    const response = await GET(new Request(
      "https://studybench.in/auth/callback?token_hash=valid-token&type=signup",
    ))

    expect(response.status).toBe(307)
    expect(verifyOtp).toHaveBeenCalledWith({ type: "signup", token_hash: "valid-token" })
  })

  it("returns to login when authentication exchange fails", async () => {
    exchangeCodeForSession.mockResolvedValueOnce({ data: { user: null }, error: new Error("invalid code") })

    const response = await GET(request())

    expect(response.headers.get("location")).toBe(
      "https://studybench.in/auth/login?error=auth_callback_failed",
    )
  })

  it("inserts a new profile with the first referral attribution", async () => {
    const { insert, update } = configure(null)

    const response = await GET(request())

    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe("https://studybench.in/dashboard")
    expect(insert).toHaveBeenCalledOnce()
    expect(insert).toHaveBeenCalledWith({ id: USER_ID, referred_by: REFERRER_ID })
    expect(update).not.toHaveBeenCalled()
  })

  it("recovers from a concurrent profile insert without unconditional upsert", async () => {
    const { insert, update, profileQuery } = configure(null, {
      insertError: { code: "23505", message: "duplicate key" },
    })

    await GET(request())

    expect(insert).toHaveBeenCalledOnce()
    expect(update).toHaveBeenCalledWith({ referred_by: REFERRER_ID })
    expect(profileQuery.is).toHaveBeenCalledWith("referred_by", null)
    expect(profileQuery).not.toHaveProperty("upsert")
  })

  it("does not overwrite an existing referral attribution", async () => {
    const { insert, update } = configure({
      id: USER_ID,
      referred_by: "original-affiliate",
    })

    await GET(request())

    expect(insert).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it("does not treat a profile lookup failure as a missing profile", async () => {
    const { insert, update } = configure(null, {
      profileError: { message: "temporary database failure" },
    })

    await GET(request())

    expect(insert).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it.each(["//attacker.example", "/\\attacker.example", "https://attacker.example/path"]) (
    "rejects an unsafe redirect target: %s",
    async (target) => {
      configure({ id: USER_ID, referred_by: REFERRER_ID })

      const response = await GET(request(target))

      expect(response.headers.get("location")).toBe("https://studybench.in/dashboard")
    },
  )
})

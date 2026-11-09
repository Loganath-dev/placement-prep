import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { getRazorpayEnvOrNull, getResendEnvOrNull, inspectEnv } from "@/lib/env"

const TOUCHED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
] as const

let saved: Record<string, string | undefined>

beforeEach(() => {
  saved = {}
  for (const k of TOUCHED) {
    saved[k] = process.env[k]
    delete process.env[k]
  }
})

afterEach(() => {
  for (const k of TOUCHED) {
    if (saved[k] === undefined) delete process.env[k]
    else process.env[k] = saved[k]
  }
})

describe("inspectEnv", () => {
  it("flags every missing core var and is not ok", () => {
    const report = inspectEnv()
    expect(report.ok).toBe(false)
    expect(report.missingRequired).toEqual(
      expect.arrayContaining([
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
      ]),
    )
  })

  it("is ok once all core vars are present, and lists disabled features", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co"
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon"
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service"

    const report = inspectEnv()
    expect(report.ok).toBe(true)
    expect(report.missingRequired).toEqual([])
    // payments / email / rate-limit are all unset → reported as disabled features.
    expect(Object.keys(report.unconfiguredFeatures)).toEqual(
      expect.arrayContaining(["payments", "email", "rate-limit"]),
    )
  })

  it("treats whitespace-only values as unset", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "   "
    expect(inspectEnv().missingRequired).toContain("NEXT_PUBLIC_SUPABASE_URL")
  })
})

describe("feature getters", () => {
  it("getRazorpayEnvOrNull is null until BOTH keys are set", () => {
    expect(getRazorpayEnvOrNull()).toBeNull()
    process.env.RAZORPAY_KEY_ID = "rzp_test"
    expect(getRazorpayEnvOrNull()).toBeNull()
    process.env.RAZORPAY_KEY_SECRET = "secret"
    expect(getRazorpayEnvOrNull()).toEqual({
      keyId: "rzp_test",
      keySecret: "secret",
      webhookSecret: undefined,
    })
  })

  it("getResendEnvOrNull requires both api key and from address", () => {
    process.env.RESEND_API_KEY = "re_123"
    expect(getResendEnvOrNull()).toBeNull()
    process.env.RESEND_FROM_EMAIL = "no-reply@studybench.app"
    expect(getResendEnvOrNull()).toEqual({
      apiKey: "re_123",
      fromEmail: "no-reply@studybench.app",
    })
  })
})

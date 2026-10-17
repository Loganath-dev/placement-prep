import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { PREMIUM_PRICE_INR } from "@/lib/access"
import { hmacSha256Hex } from "@/lib/crypto/edge-hmac"

// ── Mocks ─────────────────────────────────────────────────────────────────────
// Supabase + Razorpay env + the entitlement ledger are mocked; the HMAC crypto
// and the route handlers themselves are the REAL code under test.

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }))
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn(() => ({})) }))
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn(async () => ({ allowed: true, remaining: 9 })) }))
vi.mock("@/lib/env", () => ({
  getRazorpayEnvOrNull: vi.fn(() => ({ keyId: "kid", keySecret: "ksecret", webhookSecret: "wsecret" })),
  getRazorpayWebhookSecretOrNull: vi.fn(() => "wsecret"),
}))
vi.mock("@/lib/entitlement", () => ({
  recordPaymentOnce: vi.fn(async () => "recorded"),
  grantPremiumYear: vi.fn(async () => "2027-06-18T00:00:00.000Z"),
}))
vi.mock("@/lib/logger", () => ({
  captureError: vi.fn(),
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

import { createClient } from "@/lib/supabase/server"
import { rateLimit } from "@/lib/rate-limit"
import { getRazorpayEnvOrNull } from "@/lib/env"
import { recordPaymentOnce, grantPremiumYear } from "@/lib/entitlement"
import { POST as orderPOST } from "@/app/api/razorpay/order/route"
import { POST as verifyPOST } from "@/app/api/razorpay/verify/route"
import { POST as webhookPOST } from "@/app/api/razorpay/webhook/route"

const USER = { id: "user-123", email: "u@x.com" }
const AMOUNT = PREMIUM_PRICE_INR * 100

function mockAuth(user: unknown) {
  vi.mocked(createClient).mockResolvedValue({
    auth: { getUser: async () => ({ data: { user } }) },
  } as never)
}

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(rateLimit).mockResolvedValue({ allowed: true, remaining: 9 })
  vi.mocked(getRazorpayEnvOrNull).mockReturnValue({
    keyId: "kid",
    keySecret: "ksecret",
    webhookSecret: "wsecret",
  })
  vi.mocked(recordPaymentOnce).mockResolvedValue("recorded")
  vi.mocked(grantPremiumYear).mockResolvedValue("2027-06-18T00:00:00.000Z")
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ── /api/razorpay/order ───────────────────────────────────────────────────────

describe("POST /api/razorpay/order", () => {
  it("401s when unauthenticated", async () => {
    mockAuth(null)
    const res = await orderPOST()
    expect(res.status).toBe(401)
  })

  it("500s when Razorpay is not configured", async () => {
    mockAuth(USER)
    vi.mocked(getRazorpayEnvOrNull).mockReturnValue(null)
    const res = await orderPOST()
    expect(res.status).toBe(500)
  })

  it("429s when rate limited", async () => {
    mockAuth(USER)
    vi.mocked(rateLimit).mockResolvedValue({ allowed: false, remaining: 0 })
    const res = await orderPOST()
    expect(res.status).toBe(429)
  })

  it("creates an order tied to the user and returns checkout fields", async () => {
    mockAuth(USER)
    const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => ({
      ok: true,
      json: async () => ({ id: "order_1", amount: AMOUNT, currency: "INR" }),
    }))
    vi.stubGlobal("fetch", fetchMock)

    const res = await orderPOST()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ keyId: "kid", orderId: "order_1", amount: AMOUNT, currency: "INR" })

    // The order must embed the user id so the webhook can activate server-side.
    const init = fetchMock.mock.calls[0][1]
    const sentBody = JSON.parse(init.body as string)
    expect(sentBody.notes.user_id).toBe(USER.id)
    expect(sentBody.amount).toBe(AMOUNT)
  })
})

// ── /api/razorpay/verify ──────────────────────────────────────────────────────

describe("POST /api/razorpay/verify", () => {
  const orderId = "order_1"
  const paymentId = "pay_1"

  async function validSignature() {
    return hmacSha256Hex("ksecret", `${orderId}|${paymentId}`)
  }

  function mockOrderFetch(order: Record<string, unknown>) {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => order })),
    )
  }

  it("401s when unauthenticated", async () => {
    mockAuth(null)
    const res = await verifyPOST(jsonRequest({}))
    expect(res.status).toBe(401)
  })

  it("400s on missing fields", async () => {
    mockAuth(USER)
    const res = await verifyPOST(jsonRequest({ razorpay_order_id: orderId }))
    expect(res.status).toBe(400)
  })

  it("400s on an invalid signature", async () => {
    mockAuth(USER)
    const res = await verifyPOST(
      jsonRequest({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: "deadbeef",
      }),
    )
    expect(res.status).toBe(400)
  })

  it("activates premium on a valid, owned, correctly-priced payment", async () => {
    mockAuth(USER)
    mockOrderFetch({ notes: { user_id: USER.id }, amount: AMOUNT, currency: "INR" })

    const res = await verifyPOST(
      jsonRequest({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: await validSignature(),
      }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.premiumUntil).toBeTruthy()
    expect(recordPaymentOnce).toHaveBeenCalledOnce()
    expect(grantPremiumYear).toHaveBeenCalledWith(expect.anything(), USER.id)
  })

  it("403s when the order belongs to another user", async () => {
    mockAuth(USER)
    mockOrderFetch({ notes: { user_id: "someone-else" }, amount: AMOUNT, currency: "INR" })
    const res = await verifyPOST(
      jsonRequest({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: await validSignature(),
      }),
    )
    expect(res.status).toBe(403)
    expect(grantPremiumYear).not.toHaveBeenCalled()
  })

  it("400s on an amount mismatch (anti-tamper)", async () => {
    mockAuth(USER)
    mockOrderFetch({ notes: { user_id: USER.id }, amount: 100, currency: "INR" })
    const res = await verifyPOST(
      jsonRequest({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: await validSignature(),
      }),
    )
    expect(res.status).toBe(400)
    expect(grantPremiumYear).not.toHaveBeenCalled()
  })

  it("409s when the payment was already consumed by another account", async () => {
    mockAuth(USER)
    mockOrderFetch({ notes: { user_id: USER.id }, amount: AMOUNT, currency: "INR" })
    vi.mocked(recordPaymentOnce).mockResolvedValue("replayed-by-other-user")
    const res = await verifyPOST(
      jsonRequest({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: await validSignature(),
      }),
    )
    expect(res.status).toBe(409)
    expect(grantPremiumYear).not.toHaveBeenCalled()
  })
})

// ── /api/razorpay/webhook ─────────────────────────────────────────────────────

describe("POST /api/razorpay/webhook", () => {
  function signedRequest(payload: unknown, signature: string) {
    const raw = JSON.stringify(payload)
    return new Request("http://localhost/api", {
      method: "POST",
      headers: { "x-razorpay-signature": signature },
      body: raw,
    })
  }

  async function sign(payload: unknown) {
    return hmacSha256Hex("wsecret", JSON.stringify(payload))
  }

  it("400s on an invalid signature", async () => {
    const payload = { event: "payment.captured" }
    const res = await webhookPOST(signedRequest(payload, "bad"))
    expect(res.status).toBe(400)
  })

  it("ignores non-activation events", async () => {
    const payload = { event: "payment.failed" }
    const res = await webhookPOST(signedRequest(payload, await sign(payload)))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.event).toBe("payment.failed")
    expect(grantPremiumYear).not.toHaveBeenCalled()
  })

  it("activates premium on a captured payment with our embedded user id", async () => {
    const payload = {
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_9", order_id: "order_9", amount: AMOUNT, currency: "INR", notes: { user_id: USER.id } } },
      },
    }
    const res = await webhookPOST(signedRequest(payload, await sign(payload)))
    expect(res.status).toBe(200)
    expect(recordPaymentOnce).toHaveBeenCalledOnce()
    expect(grantPremiumYear).toHaveBeenCalledWith(expect.anything(), USER.id)
  })

  it("skips (no grant) when the amount does not match the premium price", async () => {
    const payload = {
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_x", order_id: "order_x", amount: 100, currency: "INR", notes: { user_id: USER.id } } },
      },
    }
    const res = await webhookPOST(signedRequest(payload, await sign(payload)))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.skipped).toBe(true)
    expect(grantPremiumYear).not.toHaveBeenCalled()
  })
})

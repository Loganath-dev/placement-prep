import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { PREMIUM_ANNUAL_PRICE_INR, PREMIUM_SIX_MONTH_PRICE_INR } from "@/lib/access"
import { LEGACY_ANNUAL_PLAN_KEY, PREMIUM_ANNUAL_PLAN_KEY, PREMIUM_SIX_MONTH_PLAN_KEY } from "@/lib/subscriptions/plans"
import { hmacSha256Hex } from "@/lib/crypto/edge-hmac"

// ── Mocks ─────────────────────────────────────────────────────────────────────
const { adminRpc } = vi.hoisted(() => ({
  adminRpc: vi.fn(async (): Promise<{ data: unknown; error: { message: string } | null }> => ({ data: null, error: null })),
}))
// Supabase + Razorpay env + the entitlement ledger are mocked; the HMAC crypto
// and the route handlers themselves are the REAL code under test.

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }))
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn(() => ({ rpc: adminRpc })) }))
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn(async () => ({ allowed: true, remaining: 9 })) }))
vi.mock("@/lib/env", () => ({
  getRazorpayEnvOrNull: vi.fn(() => ({ keyId: "kid", keySecret: "ksecret", webhookSecret: "wsecret" })),
  getRazorpayWebhookSecretOrNull: vi.fn(() => "wsecret"),
}))
vi.mock("@/lib/entitlement", () => ({
  recordPaymentOnce: vi.fn(async () => "recorded"),
    grantPremiumForPayment: vi.fn(async () => "2027-06-18T00:00:00.000Z"),
  recordAffiliateCommission: vi.fn(async () => undefined),
}))
vi.mock("@/lib/logger", () => ({
  captureError: vi.fn(),
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

import { createClient } from "@/lib/supabase/server"
import { rateLimit } from "@/lib/rate-limit"
import { getRazorpayEnvOrNull } from "@/lib/env"
import { recordPaymentOnce, grantPremiumForPayment, recordAffiliateCommission } from "@/lib/entitlement"
import { POST as orderPOST } from "@/app/api/razorpay/order/route"
import { POST as verifyPOST } from "@/app/api/razorpay/verify/route"
import { POST as webhookPOST } from "@/app/api/razorpay/webhook/route"

const USER = { id: "user-123", email: "u@x.com" }
const AMOUNT = PREMIUM_ANNUAL_PRICE_INR * 100

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

const originalRazorpayKeyId = process.env.RAZORPAY_KEY_ID
const originalRazorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

beforeEach(() => {
  process.env.RAZORPAY_KEY_ID = "kid"
  process.env.RAZORPAY_KEY_SECRET = "ksecret"
  vi.clearAllMocks()
  adminRpc.mockResolvedValue({ data: null, error: null })
  vi.mocked(rateLimit).mockResolvedValue({ allowed: true, remaining: 9 })
  vi.mocked(getRazorpayEnvOrNull).mockReturnValue({
    keyId: "kid",
    keySecret: "ksecret",
    webhookSecret: "wsecret",
  })
  vi.mocked(recordPaymentOnce).mockResolvedValue("recorded")
  vi.mocked(grantPremiumForPayment).mockResolvedValue("2027-06-18T00:00:00.000Z")
  vi.mocked(recordAffiliateCommission).mockResolvedValue(undefined)
})

afterEach(() => {
  vi.unstubAllGlobals()
  if (originalRazorpayKeyId === undefined) delete process.env.RAZORPAY_KEY_ID
  else process.env.RAZORPAY_KEY_ID = originalRazorpayKeyId
  if (originalRazorpayKeySecret === undefined) delete process.env.RAZORPAY_KEY_SECRET
  else process.env.RAZORPAY_KEY_SECRET = originalRazorpayKeySecret
})

// ── /api/razorpay/order ───────────────────────────────────────────────────────

describe("POST /api/razorpay/order", () => {
  it("401s when unauthenticated", async () => {
    mockAuth(null)
    const res = await orderPOST(jsonRequest({ planKey: PREMIUM_ANNUAL_PLAN_KEY }))
    expect(res.status).toBe(401)
  })

  it("500s when Razorpay is not configured", async () => {
    mockAuth(USER)
    vi.mocked(getRazorpayEnvOrNull).mockReturnValue(null)
    const res = await orderPOST(jsonRequest({ planKey: PREMIUM_ANNUAL_PLAN_KEY }))
    expect(res.status).toBe(500)
  })

  it("429s when rate limited", async () => {
    mockAuth(USER)
    vi.mocked(rateLimit).mockResolvedValue({ allowed: false, remaining: 0 })
    const res = await orderPOST(jsonRequest({ planKey: PREMIUM_ANNUAL_PLAN_KEY }))
    expect(res.status).toBe(429)
  })

  it("does not create new orders for the historical ₹249 annual plan", async () => {
    mockAuth(USER)
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const res = await orderPOST(jsonRequest({ planKey: LEGACY_ANNUAL_PLAN_KEY }))
    expect(res.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("creates the six-month order for its server-owned amount", async () => {
    mockAuth(USER)
    const expectedAmount = PREMIUM_SIX_MONTH_PRICE_INR * 100
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => ({
      ok: true,
      json: async () => ({ id: "order_6m", amount: expectedAmount, currency: "INR" }),
    }))
    vi.stubGlobal("fetch", fetchMock)

    const res = await orderPOST(jsonRequest({ planKey: PREMIUM_SIX_MONTH_PLAN_KEY }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ orderId: "order_6m", amount: expectedAmount, currency: "INR" })
    const sentBody = JSON.parse(fetchMock.mock.calls[0][1].body as string)
    expect(sentBody).toMatchObject({ amount: expectedAmount, notes: { user_id: USER.id, plan_key: PREMIUM_SIX_MONTH_PLAN_KEY } })
  })

  it("creates an order tied to the user and returns checkout fields", async () => {
    mockAuth(USER)
    const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => ({
      ok: true,
      json: async () => ({ id: "order_1", amount: AMOUNT, currency: "INR" }),
    }))
    vi.stubGlobal("fetch", fetchMock)

    const res = await orderPOST(jsonRequest({ planKey: PREMIUM_ANNUAL_PLAN_KEY }))
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

  function mockOrderFetch(order: Record<string, unknown>, paymentOverrides: Record<string, unknown> = {}) {
    const payment = {
      id: paymentId,
      status: "captured",
      order_id: orderId,
      amount: order.amount,
      currency: order.currency ?? "INR",
      ...paymentOverrides,
    }
    vi.stubGlobal("fetch", vi.fn(async (url: string) => ({
      ok: true,
      json: async () => url.includes("/payments/") ? payment : { id: orderId, ...order },
    })))
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
    mockOrderFetch({ notes: { user_id: USER.id, plan_key: PREMIUM_ANNUAL_PLAN_KEY }, amount: AMOUNT, currency: "INR" })

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
    expect(grantPremiumForPayment).toHaveBeenCalledWith(expect.anything(), { paymentId, userId: USER.id, days: 365 })
    expect(recordAffiliateCommission).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ commissionAmount: 5000, planKey: PREMIUM_ANNUAL_PLAN_KEY }))
  })

  it("returns a retryable reconciliation error if affiliate commission persistence fails", async () => {
    mockAuth(USER)
    mockOrderFetch({ notes: { user_id: USER.id, plan_key: PREMIUM_ANNUAL_PLAN_KEY }, amount: AMOUNT, currency: "INR" })
    vi.mocked(recordAffiliateCommission).mockRejectedValueOnce(new Error("commission insert failed"))

    const res = await verifyPOST(jsonRequest({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: await validSignature(),
    }))
    expect(res.status).toBe(503)
    expect((await res.json()).error).toContain("do not pay again")
    expect(recordPaymentOnce).toHaveBeenCalledOnce()
    expect(grantPremiumForPayment).toHaveBeenCalledOnce()
  })

  it("activates a six-month plan for 180 days and records ₹25", async () => {
    mockAuth(USER)
    mockOrderFetch({ notes: { user_id: USER.id, plan_key: PREMIUM_SIX_MONTH_PLAN_KEY }, amount: 29900, currency: "INR" })
    const res = await verifyPOST(jsonRequest({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: await validSignature(),
    }))
    expect(res.status).toBe(200)
    expect(grantPremiumForPayment).toHaveBeenCalledWith(expect.anything(), { paymentId, userId: USER.id, days: 180 })
    expect(recordAffiliateCommission).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ commissionAmount: 2500, planKey: PREMIUM_SIX_MONTH_PLAN_KEY }))
  })

  it("does not activate an authorized but uncaptured payment", async () => {
    mockAuth(USER)
    mockOrderFetch(
      { notes: { user_id: USER.id, plan_key: PREMIUM_ANNUAL_PLAN_KEY }, amount: AMOUNT, currency: "INR" },
      { status: "authorized" },
    )
    const res = await verifyPOST(jsonRequest({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: await validSignature(),
    }))
    expect(res.status).toBe(400)
    expect(recordPaymentOnce).not.toHaveBeenCalled()
    expect(grantPremiumForPayment).not.toHaveBeenCalled()
  })

  it("403s when the order belongs to another user", async () => {
    mockAuth(USER)
    mockOrderFetch({ notes: { user_id: "someone-else", plan_key: PREMIUM_ANNUAL_PLAN_KEY }, amount: AMOUNT, currency: "INR" })
    const res = await verifyPOST(
      jsonRequest({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: await validSignature(),
      }),
    )
    expect(res.status).toBe(403)
    expect(grantPremiumForPayment).not.toHaveBeenCalled()
  })

  it("400s on an amount mismatch (anti-tamper)", async () => {
    mockAuth(USER)
    mockOrderFetch({ notes: { user_id: USER.id, plan_key: PREMIUM_ANNUAL_PLAN_KEY }, amount: 100, currency: "INR" })
    const res = await verifyPOST(
      jsonRequest({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: await validSignature(),
      }),
    )
    expect(res.status).toBe(400)
    expect(grantPremiumForPayment).not.toHaveBeenCalled()
  })

  it("409s when the payment was already consumed by another account", async () => {
    mockAuth(USER)
    mockOrderFetch({ notes: { user_id: USER.id, plan_key: PREMIUM_ANNUAL_PLAN_KEY }, amount: AMOUNT, currency: "INR" })
    vi.mocked(recordPaymentOnce).mockResolvedValue("replayed-by-other-user")
    const res = await verifyPOST(
      jsonRequest({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: await validSignature(),
      }),
    )
    expect(res.status).toBe(409)
    expect(grantPremiumForPayment).not.toHaveBeenCalled()
  })
})

// ── /api/razorpay/webhook ─────────────────────────────────────────────────────

describe("POST /api/razorpay/webhook", () => {
  function signedRequest(payload: unknown, signature: string) {
    return new Request("http://localhost/api", {
      method: "POST",
      headers: { "x-razorpay-signature": signature },
      body: JSON.stringify(payload),
    })
  }

  async function sign(payload: unknown) {
    return hmacSha256Hex("wsecret", JSON.stringify(payload))
  }

  function mockTrustedResources(
    order: Record<string, unknown>,
    paymentOverrides: Record<string, unknown> = {},
  ) {
    const payment = {
      id: "pay_9",
      order_id: "order_9",
      amount: AMOUNT,
      currency: "INR",
      status: "captured",
      ...paymentOverrides,
    }
    const fetchMock = vi.fn(async (url: string) => ({
      ok: true,
      json: async () => url.includes("/payments/") ? payment : { id: "order_9", ...order },
    }))
    vi.stubGlobal("fetch", fetchMock)
    return fetchMock
  }

  it("400s on an invalid signature", async () => {
    const payload = { event: "payment.captured" }
    const res = await webhookPOST(signedRequest(payload, "bad"))
    expect(res.status).toBe(400)
  })

  it("rejects an oversized webhook payload before parsing it", async () => {
    const body = "x".repeat(1_000_001)
    const res = await webhookPOST(new Request("http://localhost/api", {
      method: "POST",
      headers: { "x-razorpay-signature": "a".repeat(64) },
      body,
    }))
    expect(res.status).toBe(413)
  })

  it("ignores non-activation events without touching the payment API", async () => {
    const payload = { event: "payment.failed" }
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const res = await webhookPOST(signedRequest(payload, await sign(payload)))
    expect(res.status).toBe(200)
    expect((await res.json()).event).toBe("payment.failed")
    expect(fetchMock).not.toHaveBeenCalled()
    expect(grantPremiumForPayment).not.toHaveBeenCalled()
  })

  it("resolves ownership and plan from Razorpay's trusted order when payment.captured has no order notes", async () => {
    const trustedOrder = {
      id: "order_9",
      amount: AMOUNT,
      currency: "INR",
      notes: { user_id: USER.id, plan_key: PREMIUM_ANNUAL_PLAN_KEY },
    }
    mockTrustedResources(trustedOrder)
    const payload = {
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_9", status: "captured", order_id: "order_9", amount: AMOUNT, currency: "INR" } },
      },
    }
    const res = await webhookPOST(signedRequest(payload, await sign(payload)))
    expect(res.status).toBe(200)
    expect(recordPaymentOnce).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      paymentId: "pay_9", orderId: "order_9", userId: USER.id, amount: AMOUNT, currency: "INR",
    }))
    expect(grantPremiumForPayment).toHaveBeenCalledWith(expect.anything(), { paymentId: "pay_9", userId: USER.id, days: 365 })
    expect(recordAffiliateCommission).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ commissionAmount: 5000, planKey: PREMIUM_ANNUAL_PLAN_KEY }))
  })

  it("acknowledges a duplicate signed delivery for the same payment idempotently", async () => {
    mockTrustedResources({
      id: "order_9",
      amount: AMOUNT,
      currency: "INR",
      notes: { user_id: USER.id, plan_key: PREMIUM_ANNUAL_PLAN_KEY },
    })
    vi.mocked(recordPaymentOnce).mockResolvedValue("already-recorded")
    const payload = {
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_9", status: "captured", order_id: "order_9", amount: AMOUNT, currency: "INR" } },
      },
    }
    const res = await webhookPOST(signedRequest(payload, await sign(payload)))
    expect(res.status).toBe(200)
    expect(recordPaymentOnce).toHaveBeenCalledOnce()
    // The database RPC is called on retries but returns its already-applied
    // entitlement; it must not extend the period a second time.
    expect(grantPremiumForPayment).toHaveBeenCalledOnce()
    expect(recordAffiliateCommission).toHaveBeenCalledOnce()
  })

  it("activates the six-month plan using trusted order metadata", async () => {
    mockTrustedResources({
      id: "order_9", amount: 29900, currency: "INR",
      notes: { user_id: USER.id, plan_key: PREMIUM_SIX_MONTH_PLAN_KEY },
    }, { id: "pay_6m", order_id: "order_9", amount: 29900 })
    const payload = {
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_6m", status: "captured", order_id: "order_9", amount: 29900, currency: "INR" } },
      },
    }
    const res = await webhookPOST(signedRequest(payload, await sign(payload)))
    expect(res.status).toBe(200)
    expect(grantPremiumForPayment).toHaveBeenCalledWith(expect.anything(), { paymentId: "pay_6m", userId: USER.id, days: 180 })
    expect(recordAffiliateCommission).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ paymentId: "pay_6m", paymentAmount: 29900, commissionAmount: 2500, planKey: PREMIUM_SIX_MONTH_PLAN_KEY }))
  })

  it("rejects an event identity that conflicts with the trusted order owner", async () => {
    mockTrustedResources({
      id: "order_9", amount: AMOUNT, currency: "INR",
      notes: { user_id: USER.id, plan_key: PREMIUM_ANNUAL_PLAN_KEY },
    })
    const payload = {
      event: "order.paid",
      payload: {
        order: { entity: { id: "order_9", notes: { user_id: "attacker-user" } } },
        payment: { entity: { id: "pay_9", status: "captured", order_id: "order_9", amount: AMOUNT, currency: "INR" } },
      },
    }
    const res = await webhookPOST(signedRequest(payload, await sign(payload)))
    expect(res.status).toBe(400)
    expect(recordPaymentOnce).not.toHaveBeenCalled()
    expect(grantPremiumForPayment).not.toHaveBeenCalled()
  })

  it("returns a retryable 5xx when payment activation fails", async () => {
    mockTrustedResources({
      id: "order_9", amount: AMOUNT, currency: "INR",
      notes: { user_id: USER.id, plan_key: PREMIUM_ANNUAL_PLAN_KEY },
    })
    vi.mocked(grantPremiumForPayment).mockRejectedValueOnce(new Error("temporary database failure"))
    const payload = {
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_9", status: "captured", order_id: "order_9", amount: AMOUNT, currency: "INR" } },
      },
    }
    const res = await webhookPOST(signedRequest(payload, await sign(payload)))
    expect(res.status).toBe(500)
    expect(recordPaymentOnce).toHaveBeenCalledOnce()
  })

  it("ignores refund events because refund reconciliation is not part of the active product policy", async () => {
    const payload = {
      event: "payment.refunded",
      payload: { payment: { entity: { id: "pay_refund", amount: AMOUNT } } },
    }
    const res = await webhookPOST(signedRequest(payload, await sign(payload)))
    expect(res.status).toBe(200)
    expect(adminRpc).not.toHaveBeenCalled()
    expect(grantPremiumForPayment).not.toHaveBeenCalled()
  })

  it("skips unsupported amounts before making an order lookup", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const payload = {
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_x", order_id: "order_x", amount: 100, currency: "INR", status: "captured" } },
      },
    }
    const res = await webhookPOST(signedRequest(payload, await sign(payload)))
    expect(res.status).toBe(200)
    expect((await res.json()).skipped).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(grantPremiumForPayment).not.toHaveBeenCalled()
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { PREMIUM_PRICE_INR } from "@/lib/access"
import { hmacSha256Hex } from "@/lib/crypto/edge-hmac"
import { PREMIUM_ANNUAL_PLAN_KEY, PREMIUM_SIX_MONTH_PLAN_KEY } from "@/lib/subscriptions/plans"

const { adminRpc } = vi.hoisted(() => ({ adminRpc: vi.fn(async () => ({ data: null, error: null })) }))

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: vi.fn(async () => ({ data: { user: USER } })) } })),
}))
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
import {
  recordPaymentOnce,
  grantPremiumForPayment,
  recordAffiliateCommission,
} from "@/lib/entitlement"
import { POST as orderPOST } from "@/app/api/razorpay/order/route"
import { POST as verifyPOST } from "@/app/api/razorpay/verify/route"
import { POST as webhookPOST } from "@/app/api/razorpay/webhook/route"

const USER = { id: "user-123", email: "u@x.com" }
const AMOUNT = PREMIUM_PRICE_INR * 100
const ORDER_ID = "order_1"
const PAYMENT_ID = "pay_1"

function mockAuth(user: unknown) {
  vi.mocked(createClient).mockResolvedValue({
    auth: { getUser: async () => ({ data: { user } }) },
  } as never)
}

function jsonRequest(body: unknown, url = "http://localhost/api") {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function mockTrustedRazorpayFetch(
  orderOverrides: Record<string, unknown> = {},
  paymentOverrides: Record<string, unknown> = {},
) {
  const order = {
    id: ORDER_ID,
    amount: AMOUNT,
    currency: "INR",
    notes: { user_id: USER.id, plan_key: PREMIUM_ANNUAL_PLAN_KEY },
    ...orderOverrides,
  }
  const payment = {
    id: PAYMENT_ID,
    order_id: ORDER_ID,
    amount: order.amount,
    currency: order.currency,
    status: "captured",
    ...paymentOverrides,
  }
  const fetchMock = vi.fn(async (url: string) => ({
    ok: true,
    status: 200,
    json: async () => url.includes("/payments/") ? payment : order,
  }))
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth(USER)
  adminRpc.mockResolvedValue({ data: null, error: null })
  vi.mocked(rateLimit).mockResolvedValue({ allowed: true, remaining: 9 })
  vi.mocked(getRazorpayEnvOrNull).mockReturnValue({
    keyId: "kid", keySecret: "ksecret", webhookSecret: "wsecret",
  })
  vi.mocked(recordPaymentOnce).mockResolvedValue("recorded")
  vi.mocked(grantPremiumForPayment).mockResolvedValue("2027-06-18T00:00:00.000Z")
  vi.mocked(recordAffiliateCommission).mockResolvedValue(undefined)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("POST /api/razorpay/order", () => {
  it("requires authentication", async () => {
    mockAuth(null)
    const response = await orderPOST(jsonRequest({ planKey: PREMIUM_ANNUAL_PLAN_KEY }))
    expect(response.status).toBe(401)
  })

  it("creates only the active annual plan and binds it to the current user", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true, status: 200,
      json: async () => ({ id: ORDER_ID, amount: AMOUNT, currency: "INR" }),
    }))
    vi.stubGlobal("fetch", fetchMock)
    const response = await orderPOST(jsonRequest({ planKey: PREMIUM_ANNUAL_PLAN_KEY }))
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ orderId: ORDER_ID, amount: AMOUNT, planKey: PREMIUM_ANNUAL_PLAN_KEY })
    const init = fetchMock.mock.calls[0][1] as RequestInit
    const sent = JSON.parse(String(init.body))
    expect(sent.notes).toMatchObject({ user_id: USER.id, plan_key: PREMIUM_ANNUAL_PLAN_KEY })
  })

  it("does not create new orders for the retired six-month plan", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const response = await orderPOST(jsonRequest({ planKey: PREMIUM_SIX_MONTH_PLAN_KEY }))
    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("rejects cross-origin order creation", async () => {
    const response = await orderPOST(jsonRequest(
      { planKey: PREMIUM_ANNUAL_PLAN_KEY },
      "https://studybench.in/api/razorpay/order",
    ).clone())
    // The request's origin must match its own URL; an explicit hostile origin is rejected.
    const hostile = new Request("https://studybench.in/api/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json", origin: "https://attacker.example" },
      body: JSON.stringify({ planKey: PREMIUM_ANNUAL_PLAN_KEY }),
    })
    expect((await orderPOST(hostile)).status).toBe(403)
    expect(response.status).toBe(200)
  })

  it("returns 429 when the user exceeds the global order limit", async () => {
    vi.mocked(rateLimit).mockResolvedValue({ allowed: false, remaining: 0 })
    const response = await orderPOST(jsonRequest({ planKey: PREMIUM_ANNUAL_PLAN_KEY }))
    expect(response.status).toBe(429)
  })
})

describe("POST /api/razorpay/verify", () => {
  async function validSignature() {
    return hmacSha256Hex("ksecret", `${ORDER_ID}|${PAYMENT_ID}`)
  }

  function verificationRequest(signature: string) {
    return jsonRequest({
      razorpay_order_id: ORDER_ID,
      razorpay_payment_id: PAYMENT_ID,
      razorpay_signature: signature,
    })
  }

  it("requires a valid checkout signature and captured Razorpay payment", async () => {
    mockTrustedRazorpayFetch()
    const response = await verifyPOST(verificationRequest(await validSignature()))
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ ok: true, paymentId: PAYMENT_ID })
    expect(recordPaymentOnce).toHaveBeenCalledOnce()
    expect(grantPremiumForPayment).toHaveBeenCalledWith(expect.anything(), {
      paymentId: PAYMENT_ID, userId: USER.id, days: 365,
    })
    expect(recordAffiliateCommission).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      commissionAmount: 2500, planKey: PREMIUM_ANNUAL_PLAN_KEY,
    }))
  })

  it("does not grant an authorized but uncaptured payment", async () => {
    mockTrustedRazorpayFetch({}, { status: "authorized" })
    const response = await verifyPOST(verificationRequest(await validSignature()))
    expect(response.status).toBe(400)
    expect(recordPaymentOnce).not.toHaveBeenCalled()
    expect(grantPremiumForPayment).not.toHaveBeenCalled()
  })

  it("rejects a payment linked to a different account", async () => {
    mockTrustedRazorpayFetch({ notes: { user_id: "other-user", plan_key: PREMIUM_ANNUAL_PLAN_KEY } })
    const response = await verifyPOST(verificationRequest(await validSignature()))
    expect(response.status).toBe(403)
    expect(grantPremiumForPayment).not.toHaveBeenCalled()
  })

  it("rejects an amount mismatch between the trusted order and payment", async () => {
    mockTrustedRazorpayFetch({}, { amount: AMOUNT - 100 })
    const response = await verifyPOST(verificationRequest(await validSignature()))
    expect(response.status).toBe(400)
    expect(recordPaymentOnce).not.toHaveBeenCalled()
  })

  it("returns retryable reconciliation error when affiliate persistence fails; it never asks for a second payment", async () => {
    mockTrustedRazorpayFetch()
    vi.mocked(recordAffiliateCommission).mockRejectedValueOnce(new Error("commission insert failed"))
    const response = await verifyPOST(verificationRequest(await validSignature()))
    expect(response.status).toBe(503)
    expect((await response.json()).error).toContain("do not pay again")
    expect(recordPaymentOnce).toHaveBeenCalledOnce()
    expect(grantPremiumForPayment).toHaveBeenCalledOnce()
  })

  it("rejects a cross-origin verification request", async () => {
    const response = await verifyPOST(new Request("https://studybench.in/api/razorpay/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", origin: "https://attacker.example" },
      body: JSON.stringify({}),
    }))
    expect(response.status).toBe(403)
  })
})

describe("POST /api/razorpay/webhook", () => {
  async function signedRequest(payload: unknown) {
    const raw = JSON.stringify(payload)
    const signature = await hmacSha256Hex("wsecret", raw)
    return new Request("http://localhost/api/razorpay/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-razorpay-signature": signature },
      body: raw,
    })
  }

  function capturedEvent() {
    return {
      event: "payment.captured",
      payload: {
        payment: { entity: {
          id: PAYMENT_ID, order_id: ORDER_ID, amount: AMOUNT, currency: "INR", status: "captured",
        } },
        order: { entity: {
          id: ORDER_ID, amount: AMOUNT, currency: "INR",
          notes: { user_id: USER.id, plan_key: PREMIUM_ANNUAL_PLAN_KEY },
        } },
      },
    }
  }

  it("validates the webhook signature and ignores unrelated events", async () => {
    const invalid = await webhookPOST(new Request("http://localhost/api", {
      method: "POST", headers: { "x-razorpay-signature": "bad" }, body: JSON.stringify({ event: "payment.captured" }),
    }))
    expect(invalid.status).toBe(400)
    const ignored = await webhookPOST(await signedRequest({ event: "payment.failed" }))
    expect(ignored.status).toBe(200)
    expect(grantPremiumForPayment).not.toHaveBeenCalled()
  })

  it("fetches trusted order and payment details before applying an entitlement", async () => {
    mockTrustedRazorpayFetch()
    const response = await webhookPOST(await signedRequest(capturedEvent()))
    expect(response.status).toBe(200)
    expect(recordPaymentOnce).toHaveBeenCalledOnce()
    expect(grantPremiumForPayment).toHaveBeenCalledWith(expect.anything(), {
      paymentId: PAYMENT_ID, userId: USER.id, days: 365,
    })
  })

  it("retries failed commission persistence without losing payment idempotency", async () => {
    mockTrustedRazorpayFetch()
    vi.mocked(recordAffiliateCommission).mockRejectedValueOnce(new Error("database unavailable"))
    const response = await webhookPOST(await signedRequest(capturedEvent()))
    expect(response.status).toBe(500)
    expect(recordPaymentOnce).toHaveBeenCalledOnce()
    expect(grantPremiumForPayment).toHaveBeenCalledOnce()
  })

  it("rejects oversized webhook payloads before JSON processing", async () => {
    const raw = "x".repeat(1_000_001)
    const response = await webhookPOST(new Request("http://localhost/api", {
      method: "POST",
      headers: { "content-length": String(raw.length), "x-razorpay-signature": "a".repeat(64) },
      body: raw,
    }))
    expect(response.status).toBe(413)
  })
})

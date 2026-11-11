import { NextResponse } from "next/server"
import { getActivePurchasePlan } from "@/lib/subscriptions/plans"
import { getRazorpayEnvOrNull } from "@/lib/env"
import { rateLimit } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"
import { hasTrustedRequestOrigin } from "@/lib/security/request-origin"

/** Create a price-locked Razorpay order for the signed-in user. */
export async function POST(request: Request) {
  if (!hasTrustedRequestOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 })
  }

  const razorpay = getRazorpayEnvOrNull()
  if (!razorpay) return NextResponse.json({ error: "Razorpay keys are not configured." }, { status: 500 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const bodyValue: unknown = await request.json().catch(() => null)
  const planKey = bodyValue && typeof bodyValue === "object" && !Array.isArray(bodyValue)
    ? (bodyValue as { planKey?: unknown }).planKey
    : undefined
  const plan = getActivePurchasePlan(planKey)
  if (!plan) return NextResponse.json({ error: "Choose a valid Premium plan." }, { status: 400 })

  const { allowed } = await rateLimit(`order:${user.id}`, 5, 60 * 60 * 1000)
  if (!allowed) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 })

  const receipt = `sb_${user.id.slice(0, 8)}_${Date.now()}`
  let response: Response
  try {
    response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${razorpay.keyId}:${razorpay.keySecret}`)}`,
      },
      body: JSON.stringify({
        amount: plan.amountPaise,
        currency: "INR",
        receipt,
        notes: { user_id: user.id, plan_key: plan.planKey },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    })
  } catch {
    return NextResponse.json({ error: "Razorpay is temporarily unavailable. Please retry." }, { status: 502 })
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    return NextResponse.json(
      { error: data?.error?.description ?? "Could not create Razorpay order." },
      { status: response.status >= 400 && response.status < 500 ? response.status : 502 },
    )
  }
  if (
    !data || typeof data.id !== "string" || !data.id.startsWith("order_") ||
    data.amount !== plan.amountPaise || data.currency !== "INR"
  ) {
    return NextResponse.json({ error: "Razorpay returned an invalid order response." }, { status: 502 })
  }

  return NextResponse.json({
    keyId: razorpay.keyId,
    orderId: data.id,
    amount: data.amount,
    currency: data.currency,
    planName: `StudyBench ${plan.name}`,
    planKey: plan.planKey,
  }, { headers: { "Cache-Control": "private, no-store, max-age=0" } })
}

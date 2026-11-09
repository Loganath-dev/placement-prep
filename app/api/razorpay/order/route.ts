import { NextResponse } from "next/server"
import { PREMIUM_PRICE_INR } from "@/lib/access"
import { getRazorpayEnvOrNull } from "@/lib/env"
import { rateLimit } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"

/**
 * Creates a Razorpay order tied to the authenticated user.
 * The user ID is embedded in the `notes` field so the webhook can
 * activate premium server-side even if the client tab is closed.
 */
export async function POST() {
  const razorpay = getRazorpayEnvOrNull()
  if (!razorpay) {
    return NextResponse.json(
      { error: "Razorpay keys are not configured." },
      { status: 500 },
    )
  }
  const { keyId, keySecret } = razorpay

  // Authenticate the caller.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  // 5 order attempts per user per hour.
  const { allowed } = await rateLimit(`order:${user.id}`, 5, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 })
  }

  const receipt = `sb_${user.id.slice(0, 8)}_${Date.now()}`
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
    },
    body: JSON.stringify({
      amount: PREMIUM_PRICE_INR * 100,
      currency: "INR",
      receipt,
      notes: { user_id: user.id }, // used by webhook for server-side activation
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    return NextResponse.json(
      { error: data?.error?.description ?? "Could not create Razorpay order." },
      { status: response.status },
    )
  }

  return NextResponse.json({
    keyId,
    orderId: data.id,
    amount: data.amount,
    currency: data.currency,
    planName: "StudyBench Premium",
  })
}

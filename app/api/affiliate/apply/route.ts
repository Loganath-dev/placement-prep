import { NextResponse } from "next/server"
import { randomBytes } from "node:crypto"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { rateLimit } from "@/lib/rate-limit"
import { AFFILIATE_TERMS_VERSION, AFFILIATE_PRIVACY_VERSION } from "@/lib/affiliate-terms"
import { hasTrustedRequestOrigin } from "@/lib/security/request-origin"

function makeCode() {
  return randomBytes(6).toString("hex").toUpperCase()
}

export async function POST(request: Request) {
  if (!hasTrustedRequestOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Sign in to join the affiliate programme." }, { status: 401 })
  if (!user.email_confirmed_at) return NextResponse.json({ error: "Verify your email before applying to the affiliate programme." }, { status: 403 })

  const { allowed } = await rateLimit(`affiliate-apply:${user.id}`, 3, 24 * 60 * 60 * 1000)
  if (!allowed) return NextResponse.json({ error: "Too many application attempts. Please try again tomorrow." }, { status: 429 })

  const bodyValue: unknown = await request.json().catch(() => null)
  const body = bodyValue && typeof bodyValue === "object" && !Array.isArray(bodyValue)
    ? bodyValue as { termsAccepted?: unknown; privacyAccepted?: unknown; upiId?: unknown; upiName?: unknown }
    : {}
  const upiId = typeof body.upiId === "string" ? body.upiId.trim() : ""
  const upiName = typeof body.upiName === "string" ? body.upiName.trim() : ""
  if (body.termsAccepted !== true || body.privacyAccepted !== true) {
    return NextResponse.json({ error: "Read and accept both the Affiliate Terms and Privacy Policy to continue." }, { status: 400 })
  }
  if (!/^[\w.\-]{2,256}@[\w.-]{2,64}$/.test(upiId) || upiName.length < 2 || upiName.length > 120) {
    return NextResponse.json({ error: "Enter a valid UPI ID and account-holder name." }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: existing, error: existingError } = await admin
    .from("affiliate_accounts").select("referral_code").eq("user_id", user.id).maybeSingle()
  if (existingError) return NextResponse.json({ error: "Could not check your affiliate application." }, { status: 500 })

  if (existing?.referral_code) {
    return NextResponse.json({ error: "Your affiliate account already exists. Contact support to request a verified payout-detail change." }, { status: 409 })
  }

  let referralCode: string | undefined
  const now = new Date().toISOString()

  // Insert, never upsert: concurrent applications must not replace an
  // already-consented payout destination. Retry only genuine code collisions.
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = makeCode()
    const { error } = await admin.from("affiliate_accounts").insert({
      user_id: user.id,
      referral_code: candidate,
      status: "active",
      terms_version: AFFILIATE_TERMS_VERSION,
      privacy_version: AFFILIATE_PRIVACY_VERSION,
      accepted_at: now,
      upi_id: upiId,
      upi_name: upiName,
      updated_at: now,
    })

    if (!error) {
      referralCode = candidate
      break
    }
    if (error.code === "23505") {
      const { data: accountForUser, error: lookupError } = await admin
        .from("affiliate_accounts")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle()
      if (lookupError) return NextResponse.json({ error: "Could not verify your affiliate application." }, { status: 500 })
      if (accountForUser) {
        return NextResponse.json({ error: "An affiliate application already exists. Update payout details from your affiliate dashboard." }, { status: 409 })
      }
      continue
    }
    return NextResponse.json({ error: "Could not save your affiliate application." }, { status: 500 })
  }

  if (!referralCode) {
    return NextResponse.json({ error: "Could not create a unique referral code. Please retry." }, { status: 503 })
  }

  return NextResponse.json({ ok: true, referralCode, termsVersion: AFFILIATE_TERMS_VERSION, privacyVersion: AFFILIATE_PRIVACY_VERSION })
}

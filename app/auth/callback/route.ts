import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { safeInternalRedirectPath } from "@/lib/security/redirect"
import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = safeInternalRedirectPath(searchParams.get("next"), origin)
  const referralCode = searchParams.get("ref")?.trim().toUpperCase() ?? ""
  const validReferralCode = /^[A-F0-9]{12}$/.test(referralCode)
    ? referralCode
    : null

  const supabase = await createClient()

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      await attachReferralAttribution(data.user.id, validReferralCode)
      return NextResponse.redirect(`${origin}${next}`)
    }
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })
    if (!error && data.user) {
      await attachReferralAttribution(data.user.id, validReferralCode)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}

async function attachReferralAttribution(
  userId: string,
  referralCode: string | null,
): Promise<void> {
  if (!referralCode) return

  const admin = createAdminClient()
  const { data: affiliate, error: affiliateError } = await admin
    .from("affiliate_accounts")
    .select("user_id")
    .eq("referral_code", referralCode)
    .eq("status", "active")
    .maybeSingle()

  if (affiliateError) return

  const referrerId = affiliate?.user_id
  if (!referrerId || referrerId === userId) return

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id,referred_by")
    .eq("id", userId)
    .maybeSingle()

  // A failed read must never be interpreted as a missing profile: doing so
  // could turn a transient database error into an attribution overwrite.
  if (profileError || profile?.referred_by) return

  if (!profile) {
    const { error: insertError } = await admin.from("profiles").insert({
      id: userId,
      referred_by: referrerId,
    })

    if (!insertError) return

    // A parallel auth callback may have inserted the profile first. Only a
    // unique-key conflict is recoverable; all other errors leave attribution
    // untouched and can be retried by a later callback.
    if (insertError.code !== "23505") return
  }

  // First successful attribution wins, including when two callbacks race.
  await admin
    .from("profiles")
    .update({ referred_by: referrerId })
    .eq("id", userId)
    .is("referred_by", null)
}

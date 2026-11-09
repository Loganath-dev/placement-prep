import { createClient } from "@/lib/supabase/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse } from "next/server"


export const runtime = "edge"

/**
 * Handles auth redirects from:
 *  - OAuth / PKCE: `?code=...` (exchangeCodeForSession)
 *  - Email confirm: `?token_hash=&type=` (verifyOtp)
 *  - Password recovery via `?code=` + ?next=/auth/reset-password
 */

function safeRedirectPath(raw: string | null): string {
  if (!raw) return "/dashboard"
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard"
  return raw
}



export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = safeRedirectPath(searchParams.get("next"))
  const referralParam = searchParams.get("ref")
  const referralId = referralParam && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(referralParam) ? referralParam : null

  const supabase = await createClient()

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      if (referralId && referralId !== data.user.id) {
        // Attribute only an account without a profile. Opening an invite link
        // while signing into an existing account must not rewrite attribution.
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle()
        if (!existingProfile) {
          await supabase.from("profiles").insert({ id: data.user.id, referred_by: referralId })
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error && data.user) {
      if (referralId && referralId !== data.user.id) {
        // Attribute only an account without a profile. Opening an invite link
        // while signing into an existing account must not rewrite attribution.
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle()
        if (!existingProfile) {
          await supabase.from("profiles").insert({ id: data.user.id, referred_by: referralId })
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}

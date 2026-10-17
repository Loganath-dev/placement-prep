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

/** Ensure the redirect target is always a same-origin relative path. */
function safeRedirectPath(raw: string | null): string {
  if (!raw) return "/dashboard"
  // Must start with exactly one "/" — reject protocol-relative (//) and absolute URLs
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard"
  return raw
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = safeRedirectPath(searchParams.get("next"))

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}



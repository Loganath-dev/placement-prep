import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { rateLimit } from "@/lib/rate-limit"
import { AFFILIATE_TERMS_VERSION, AFFILIATE_PRIVACY_VERSION } from "@/lib/affiliate-terms"
import { hasTrustedRequestOrigin } from "@/lib/security/request-origin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (!hasTrustedRequestOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Sign in to update affiliate consent." }, { status: 401 })

  const { allowed } = await rateLimit(`affiliate-terms:${user.id}`, 3, 24 * 60 * 60 * 1000)
  if (!allowed) return NextResponse.json({ error: "Too many consent attempts. Please try again tomorrow." }, { status: 429 })

  const bodyValue: unknown = await request.json().catch(() => null)
  const body = bodyValue && typeof bodyValue === "object" && !Array.isArray(bodyValue)
    ? bodyValue as Record<string, unknown>
    : {}
  if (body.termsAccepted !== true || body.privacyAccepted !== true) {
    return NextResponse.json({ error: "Both the updated Affiliate Terms and Privacy Policy must be accepted." }, { status: 400 })
  }

  const admin = createAdminClient()
  const acceptedAt = new Date().toISOString()
  const { data, error } = await admin.from("affiliate_accounts")
    .update({
      terms_version: AFFILIATE_TERMS_VERSION,
      privacy_version: AFFILIATE_PRIVACY_VERSION,
      accepted_at: acceptedAt,
      updated_at: acceptedAt,
    })
    .eq("user_id", user.id)
    .select("user_id,terms_version,privacy_version,accepted_at")
    .maybeSingle()

  if (error) return NextResponse.json({ error: "Could not record updated affiliate consent." }, { status: 500 })
  if (!data) return NextResponse.json({ error: "No affiliate account was found for this user." }, { status: 404 })

  return NextResponse.json({
    ok: true,
    termsVersion: data.terms_version,
    privacyVersion: data.privacy_version,
    acceptedAt: data.accepted_at,
  }, { headers: { "Cache-Control": "private, no-store, max-age=0" } })
}

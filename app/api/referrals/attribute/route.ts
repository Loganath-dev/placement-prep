import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { rateLimit } from "@/lib/rate-limit"
import { hasTrustedRequestOrigin } from "@/lib/security/request-origin"

export async function POST(request: Request) {
  if (!hasTrustedRequestOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  const { allowed } = await rateLimit(`referral-attribute:${user.id}`, 5, 60 * 60 * 1000)
  if (!allowed) return NextResponse.json({ error: "Too many referral attempts. Try again later." }, { status: 429 })
  const bodyValue: unknown = await request.json().catch(() => null)
  const body = bodyValue && typeof bodyValue === "object" && !Array.isArray(bodyValue)
    ? bodyValue as { referrerCode?: unknown }
    : {}
  const referrerCode = typeof body.referrerCode === "string" ? body.referrerCode.trim().toUpperCase() : ""
  const admin = createAdminClient()
  let referrerId: string | null = null

  if (/^[A-F0-9]{12}$/.test(referrerCode)) {
    const { data } = await admin.from("affiliate_accounts").select("user_id").eq("referral_code", referrerCode).eq("status", "active").maybeSingle()
    referrerId = data?.user_id ?? null
  }
  if (!referrerId || referrerId === user.id) return NextResponse.json({ error: "This referral link is invalid or inactive." }, { status: 400 })

  const { data: profile, error: readError } = await admin.from("profiles").select("referred_by").eq("id", user.id).maybeSingle()
  if (readError) return NextResponse.json({ error: "Could not verify referral attribution." }, { status: 500 })
  if (profile?.referred_by) return NextResponse.json({ ok: true, alreadyAttributed: true })
  const { data: referrer } = await admin.from("affiliate_accounts").select("user_id").eq("user_id", referrerId).eq("status", "active").maybeSingle()
  if (!referrer) return NextResponse.json({ error: "This affiliate account is not active." }, { status: 400 })
  const { error } = await admin.from("profiles").update({ referred_by: referrerId }).eq("id", user.id).is("referred_by", null)
  if (error) return NextResponse.json({ error: "Could not save referral attribution." }, { status: 500 })
  return NextResponse.json({ ok: true })
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { rateLimit } from "@/lib/rate-limit"
import { hasTrustedRequestOrigin } from "@/lib/security/request-origin"

export async function PATCH(request: Request) {
  if (!hasTrustedRequestOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Sign in to update payout details." }, { status: 401 })

  const { allowed } = await rateLimit(`affiliate-account-update:${user.id}`, 5, 60 * 60 * 1000)
  if (!allowed) return NextResponse.json({ error: "Too many changes. Please try again later." }, { status: 429 })

  const bodyValue: unknown = await request.json().catch(() => null)
  const body = bodyValue && typeof bodyValue === "object" && !Array.isArray(bodyValue)
    ? bodyValue as Record<string, unknown>
    : {}
  const upiId = typeof body.upiId === "string" ? body.upiId.trim() : ""
  const upiName = typeof body.upiName === "string" ? body.upiName.trim() : ""
  if (!/^[\w.\-]{2,256}@[\w.-]{2,64}$/.test(upiId) || upiName.length < 2 || upiName.length > 120) {
    return NextResponse.json({ error: "Enter a valid UPI ID and account-holder name." }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.from("affiliate_accounts")
    .update({ upi_id: upiId, upi_name: upiName, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("status", "active")
    .select("upi_id,upi_name")
    .maybeSingle()

  if (error) return NextResponse.json({ error: "Could not update your payout details." }, { status: 500 })
  if (!data) return NextResponse.json({ error: "No active affiliate account was found." }, { status: 404 })
  return NextResponse.json({ ok: true, account: data }, { headers: { "Cache-Control": "private, no-store, max-age=0" } })
}

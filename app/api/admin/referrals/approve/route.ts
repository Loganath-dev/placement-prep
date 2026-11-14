import { NextResponse } from "next/server"
import { requireAdminMfa } from "@/lib/admin"
import { createAdminClient } from "@/lib/supabase/admin"
import { hasTrustedRequestOrigin } from "@/lib/security/request-origin"

export async function POST(request: Request) {
  if (!hasTrustedRequestOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 })
  }

  const adminUser = await requireAdminMfa()
  const bodyValue: unknown = await request.json().catch(() => null)
  const body = bodyValue && typeof bodyValue === "object" && !Array.isArray(bodyValue)
    ? bodyValue as { commissionId?: unknown }
    : {}
  const commissionId = typeof body.commissionId === "string" ? body.commissionId : ""
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(commissionId)) {
    return NextResponse.json({ error: "Choose a valid commission." }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.rpc("admin_approve_affiliate_commission", {
    p_commission_id: commissionId,
    p_approved_by: adminUser.id,
  })
  if (error) {
    return NextResponse.json(
      { error: "Reward approval was rejected. Refresh the queue and verify the purchase, referral attribution and 15-day review period." },
      { status: 409,
        headers: { "Cache-Control": "private, no-store, max-age=0" } },
    )
  }
  return NextResponse.json({ ok: true, commissionId: data }, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  })
}

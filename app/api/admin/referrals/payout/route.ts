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
    ? bodyValue as { commissionId?: unknown; transactionId?: unknown }
    : {}
  const commissionId = typeof body.commissionId === "string" ? body.commissionId : ""
  const transactionId = typeof body.transactionId === "string" ? body.transactionId.trim() : ""
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(commissionId)) {
    return NextResponse.json({ error: "Choose a valid commission." }, { status: 400 })
  }
  if (!transactionId || transactionId.length > 120) {
    return NextResponse.json({ error: "Enter the UPI transaction reference." }, { status: 400 })
  }
  const admin = createAdminClient()
  const { data, error } = await admin.rpc("admin_pay_affiliate_commission", {
    p_commission_id: commissionId,
    p_transaction_id: transactionId,
    p_paid_by: adminUser.id,
  })
  if (error) {
    return NextResponse.json({ error: "Payout settlement was rejected. Refresh the queue and verify the commission, threshold, payout date and UPI destination." }, {
      status: 409,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    })
  }
  return NextResponse.json({ ok: true, payoutId: data }, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  })
}

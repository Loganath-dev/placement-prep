import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const adminUser = await requireAdmin()
  const body = await request.json().catch(() => ({}))
  const userId = typeof body.userId === "string" ? body.userId : ""
  const transactionId = typeof body.transactionId === "string" ? body.transactionId.trim() : ""
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    return NextResponse.json({ error: "Invalid referrer account." }, { status: 400 })
  }
  if (transactionId.length < 3 || transactionId.length > 120) {
    return NextResponse.json({ error: "Enter the UPI transaction reference." }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.rpc("record_affiliate_payout", {
    p_user_id: userId,
    p_paid_by: adminUser.id,
    p_transaction_id: transactionId,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, payoutId: data })
}

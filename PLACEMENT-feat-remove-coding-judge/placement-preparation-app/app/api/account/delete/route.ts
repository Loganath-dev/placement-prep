import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "edge"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const admin = createAdminClient()
  const { error: cleanupError } = await admin.rpc("erase_user_data", { p_user_id: user.id })
  if (cleanupError) {
    console.error("[account/delete] Transactional cleanup failed", {
      userId: user.id, message: cleanupError.message,
    })
    return NextResponse.json(
      { error: "We could not delete your account data. Your account is still active; please retry or contact support." },
      { status: 500 },
    )
  }

  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

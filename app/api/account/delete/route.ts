import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "edge"

/**
 * Permanently deletes the signed-in user's account and all their data -
 * the DPDP "right to erasure" the Privacy Policy promises. Identity comes from
 * the session cookie (server client); the destructive work uses the service-role
 * admin client. Deleting the auth user cascades to every owned row via the
 * ON DELETE CASCADE foreign keys, but we also delete rows explicitly so erasure
 * is complete even if the cascade migration hasn't been applied yet.
 */
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  const admin = createAdminClient()
  const uid = user.id

  // Intentionally NOT deleted: `payments` (financial ledger retained for
  // reconciliation/GST; its user_id FK nulls out when the auth user is deleted)
  // and `question_reports` (anonymized the same way, kept for content QA).
  await Promise.allSettled([
    admin.from("company_progress").delete().eq("user_id", uid),
    admin.from("daily_challenges").delete().eq("id", uid),
    admin.from("mistakes").delete().eq("user_id", uid),
    admin.from("drive_outcomes").delete().eq("user_id", uid),
    admin.from("coding_attempts").delete().eq("user_id", uid),
    admin.from("user_state").delete().eq("id", uid),
    admin.from("profiles").delete().eq("id", uid),
  ])

  const { error } = await admin.auth.admin.deleteUser(uid)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}



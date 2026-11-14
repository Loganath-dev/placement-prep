import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { hasTrustedRequestOrigin } from "@/lib/security/request-origin"

/**
 * Permanently deletes the signed-in user's account and associated data.
 * Identity comes from the session cookie; destructive work uses the service-role
 * client. First remove application data in one database transaction. Only after
 * that succeeds do we delete the Auth identity, which also nulls retained
 * financial references and cascades question reports. If either step fails,
 * return an error instead of claiming erasure succeeded.
 */
export async function POST(request: Request) {
  if (!hasTrustedRequestOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  const admin = createAdminClient()
  const uid = user.id

  const { error: schemaError } = await admin.rpc("assert_financial_erasure_schema_ready")
  if (schemaError) {
    console.error("[account/delete] Financial retention schema check failed", { userId: uid, message: schemaError.message })
    return NextResponse.json({ error: "Account deletion is temporarily unavailable while financial-record retention is being secured. Please contact support." }, { status: 503 })
  }

  const { error: cleanupError } = await admin.rpc("erase_user_data", { p_user_id: uid })
  if (cleanupError) {
    console.error("[account/delete] Application-data cleanup failed", { userId: uid, message: cleanupError.message })
    return NextResponse.json({ error: "Account data could not be erased. Please retry." }, { status: 500 })
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(uid)
  if (deleteError) {
    console.error("[account/delete] Auth identity deletion failed after data cleanup", { userId: uid, message: deleteError.message })
    return NextResponse.json({ error: "Your application data was erased, but account closure could not finish. Please contact support." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}



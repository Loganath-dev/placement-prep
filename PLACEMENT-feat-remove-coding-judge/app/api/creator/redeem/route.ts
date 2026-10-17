import { createHash } from "node:crypto"
import { NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const CODE_PATTERN = /^STUDYBENCH-[A-Z0-9]{5}-[A-Z0-9]{5}$/

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const { allowed } = await rateLimit(`creator-code:${user.id}`, 8, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 })
  }

  let body: { code?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Enter a valid creator code." }, { status: 400 })
  }

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : ""
  if (!CODE_PATTERN.test(code)) {
    return NextResponse.json({ error: "This creator code is invalid or already used." }, { status: 400 })
  }

  const codeHash = createHash("sha256").update(code).digest("hex")
  const admin = createAdminClient()
  const { data, error } = await admin.rpc("redeem_creator_code", {
    p_user_id: user.id,
    p_code_hash: codeHash,
  })

  if (error) {
    return NextResponse.json({ error: "Could not redeem the code. Try again." }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: "This creator code is invalid or already used." }, { status: 400 })
  }

  const { data: grant } = await admin
    .from("creator_access")
    .select("expires_at")
    .eq("user_id", user.id)
    .single()

  return NextResponse.json({
    ok: true,
    premium: true,
    premiumUntil: grant?.expires_at ?? null,
    source: "creator",
  })
}

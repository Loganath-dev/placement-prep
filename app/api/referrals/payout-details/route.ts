import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 })

  const contentType = request.headers.get("content-type") ?? ""
  let body: Record<string, unknown>
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await request.formData()
    body = { upi_id: form.get("upi_id"), upi_name: form.get("upi_name") }
  } else {
    body = await request.json().catch(() => ({}))
  }

  const upiId = typeof body.upi_id === "string" ? body.upi_id.trim() : ""
  const upiName = typeof body.upi_name === "string" ? body.upi_name.trim() : ""
  if (upiId.length > 100 || upiName.length > 100 || (upiId && !/^[\w.-]{2,256}@[\w.-]{2,64}$/.test(upiId))) {
    return NextResponse.json({ error: "Enter a valid UPI ID and account name." }, { status: 400 })
  }

  const { error } = await supabase.from("profiles").update({
    upi_id: upiId || null,
    upi_name: upiName || null,
  }).eq("id", user.id)
  if (error) return NextResponse.json({ error: "Could not save payout details." }, { status: 500 })

  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    return NextResponse.redirect(new URL("/referrals?saved=1", request.url), 303)
  }
  return NextResponse.json({ ok: true })
}

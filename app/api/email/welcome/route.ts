import { NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"
import { buildWelcomeEmail, sendEmail } from "@/lib/email/resend"


export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  // 3 welcome emails per user per day.
  const { allowed } = await rateLimit(`welcome-email:${user.id}`, 3, 24 * 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 })
  }

  const body = await request.json().catch(() => ({}))
  const name = typeof body.name === "string" ? body.name : undefined
  const companies = Array.isArray(body.companies)
    ? body.companies.filter((item: unknown): item is string => typeof item === "string")
    : undefined

  const email = buildWelcomeEmail({ name, companies })
  const result = await sendEmail({
    to: user.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
  })

  if (!result.ok) {
    console.error("[email/welcome] Resend failed:", result.error)
    return NextResponse.json({ error: "Could not send welcome email." }, { status: 502 })
  }

  return NextResponse.json({ ok: true, skipped: result.skipped ?? false })
}

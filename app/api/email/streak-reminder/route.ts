import { NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"
import { buildStreakReminderEmail, sendEmail } from "@/lib/email/resend"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  // 2 streak reminder emails per user per day.
  const { allowed } = await rateLimit(`streak-reminder-email:${user.id}`, 2, 24 * 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 })
  }

  const body = await request.json().catch(() => ({}))
  const name = typeof body.name === "string" ? body.name : undefined
  const streakCount = typeof body.streakCount === "number" ? body.streakCount : 0

  const email = buildStreakReminderEmail({ name, streakCount })
  const result = await sendEmail({
    to: user.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
  })

  if (!result.ok) {
    console.error("[email/streak-reminder] Resend failed:", result.error)
    return NextResponse.json({ error: "Could not send streak reminder email." }, { status: 502 })
  }

  return NextResponse.json({ ok: true, skipped: result.skipped ?? false })
}

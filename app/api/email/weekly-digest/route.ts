import { NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"
import { createClient } from "@/lib/supabase/server"
import { buildWeeklyDigestEmail, sendEmail } from "@/lib/email/resend"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  // 1 weekly digest per user per day (prevents duplicate sends from cron retries).
  const { allowed } = await rateLimit(`weekly-digest-email:${user.id}`, 1, 24 * 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 })
  }

  const body = await request.json().catch(() => ({}))
  const name = typeof body.name === "string" ? body.name : undefined
  const priChange = typeof body.priChange === "number" ? body.priChange : 0
  const currentPri = typeof body.currentPri === "number" ? Math.min(100, Math.max(0, body.currentPri)) : 0
  const chaptersCompleted = typeof body.chaptersCompleted === "number" ? body.chaptersCompleted : 0
  const currentStreak = typeof body.currentStreak === "number" ? body.currentStreak : 0
  const companyName = typeof body.companyName === "string" && body.companyName.trim() ? body.companyName.trim() : "your target"

  const email = buildWeeklyDigestEmail({ name, priChange, currentPri, chaptersCompleted, currentStreak, companyName })
  const result = await sendEmail({
    to: user.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
  })

  if (!result.ok) {
    console.error("[email/weekly-digest] Resend failed:", result.error)
    return NextResponse.json({ error: "Could not send weekly digest email." }, { status: 502 })
  }

  return NextResponse.json({ ok: true, skipped: result.skipped ?? false })
}

import { SITE_NAME, SITE_URL } from "@/lib/content/blocks"

const RESEND_ENDPOINT = "https://api.resend.com/emails"

type SendEmailInput = {
  to: string
  subject: string
  html: string
  text: string
}

export type EmailSendResult =
  | { ok: true; id?: string; skipped?: false }
  | { ok: true; skipped: true; reason: string }
  | { ok: false; error: string }

function fromAddress() {
  return process.env.RESEND_FROM_EMAIL ?? `${SITE_NAME} <onboarding@resend.dev>`
}

export async function sendEmail(input: SendEmailInput): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { ok: true, skipped: true, reason: "RESEND_API_KEY is not configured." }
  }

  let response: Response
  try {
    response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    })
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not connect to Resend.",
    }
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    return {
      ok: false,
      error: data?.message ?? data?.error ?? `Resend returned HTTP ${response.status}.`,
    }
  }

  return { ok: true, id: data?.id }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function baseEmailHtml(title: string, body: string, ctaLabel: string, ctaHref: string) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#172033;background:#f8fafc;padding:24px">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:28px">
        <p style="margin:0 0 10px;color:#2563eb;font-weight:700">${SITE_NAME}</p>
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;color:#0f172a">${title}</h1>
        <div style="font-size:15px;color:#334155">${body}</div>
        <p style="margin:24px 0 0">
          <a href="${ctaHref}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:10px;padding:11px 16px;font-weight:700">
            ${ctaLabel}
          </a>
        </p>
        <p style="margin:24px 0 0;font-size:12px;color:#64748b">
          ${SITE_NAME} is a placement learning app. We do not guarantee interview calls, jobs, placement outcomes, scores or selection by any company.
        </p>
      </div>
    </div>
  `
}

export function buildWelcomeEmail(args: {
  name?: string
  companies?: string[]
}) {
  const firstName = args.name?.trim().split(/\s+/)[0] || "there"
  const companyText = args.companies?.length
    ? ` Your selected prep tracks: <strong>${escapeHtml(args.companies.join(", "))}</strong>.`
    : ""

  const html = baseEmailHtml(
    `Welcome to ${SITE_NAME}, ${escapeHtml(firstName)}`,
    `<p style="margin:0 0 12px">Your placement preparation workspace is ready.</p>
     <p style="margin:0 0 12px">Start with one chapter, one practice set and one mock habit.${companyText}</p>
     <p style="margin:0">Keep your focus simple: learn, practise, review mistakes, repeat.</p>`,
    "Open StudyBench",
    SITE_URL,
  )

  return {
    subject: `Welcome to ${SITE_NAME}`,
    html,
    text:
      `Welcome to ${SITE_NAME}, ${firstName}.\n\n` +
      `Your placement preparation workspace is ready. Start with one chapter, one practice set and one mock habit.\n\n` +
      `${SITE_NAME} is a placement learning app and does not guarantee interview calls, jobs, placement outcomes, scores or selection.`,
  }
}

export function buildStreakReminderEmail(args: { name?: string; streakCount: number }) {
  const firstName = args.name?.trim().split(/\s+/)[0] || "there"
  const streak = args.streakCount
  const subject =
    streak > 0
      ? `Your ${streak}-day streak is at risk 🔥`
      : `Come back and start your streak today`

  const bodyText =
    streak > 0
      ? `You haven't practised today, and your ${streak}-day streak is about to reset. Just 5 minutes keeps it alive.`
      : `You haven't practised recently. Start a new streak today — even one question counts.`

  const html = baseEmailHtml(
    escapeHtml(streak > 0 ? `${streak}-day streak at risk` : `Start practising again`),
    `<p style="margin:0 0 12px">Hi ${escapeHtml(firstName)},</p>
     <p style="margin:0 0 12px">${escapeHtml(bodyText)}</p>
     <p style="margin:0">Open your daily challenge and answer 5 questions to keep building your readiness score.</p>`,
    "Continue preparing",
    `${SITE_URL}/challenges`,
  )

  return { subject, html, text: `${subject}\n\n${bodyText}\n\nOpen ${SITE_NAME}: ${SITE_URL}/challenges` }
}

export function buildWeeklyDigestEmail(args: {
  name?: string
  priChange: number
  currentPri: number
  chaptersCompleted: number
  currentStreak: number
  companyName: string
}) {
  const firstName = args.name?.trim().split(/\s+/)[0] || "there"
  const priArrow = args.priChange > 0 ? `↑ +${args.priChange}` : args.priChange < 0 ? `↓ ${args.priChange}` : `→ No change`

  const html = baseEmailHtml(
    `Your weekly progress for ${escapeHtml(args.companyName)}`,
    `<p style="margin:0 0 16px">Hi ${escapeHtml(firstName)}, here's how your week went:</p>
     <table style="width:100%;border-collapse:collapse;font-size:14px">
       <tr>
         <td style="padding:8px;border-bottom:1px solid #e2e8f0">PRI this week</td>
         <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700">${escapeHtml(priArrow)} (now ${args.currentPri}/100)</td>
       </tr>
       <tr>
         <td style="padding:8px;border-bottom:1px solid #e2e8f0">Chapters completed</td>
         <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700">${args.chaptersCompleted}</td>
       </tr>
       <tr>
         <td style="padding:8px">Current streak</td>
         <td style="padding:8px;text-align:right;font-weight:700">${args.currentStreak} day${args.currentStreak === 1 ? "" : "s"}</td>
       </tr>
     </table>
     <p style="margin:16px 0 0">Keep the momentum going. One chapter a day moves your PRI by 2-3 points.</p>`,
    "Open StudyBench",
    `${SITE_URL}/dashboard`,
  )

  return {
    subject: `Your StudyBench week: PRI ${args.currentPri}/100 for ${args.companyName}`,
    html,
    text:
      `Your weekly progress for ${args.companyName}:\n` +
      `PRI: ${priArrow} (${args.currentPri}/100)\n` +
      `Chapters completed: ${args.chaptersCompleted}\n` +
      `Streak: ${args.currentStreak} days\n\n` +
      `Open ${SITE_NAME}: ${SITE_URL}/dashboard`,
  }
}




export function buildProductUpdateEmail(args: {
  title: string
  message: string
  ctaLabel?: string
  ctaHref?: string
}) {
  const title = args.title.trim() || `${SITE_NAME} update`
  const message = args.message.trim()
  const html = baseEmailHtml(
    escapeHtml(title),
    `<p style="margin:0">${escapeHtml(message)}</p>`,
    args.ctaLabel?.trim() || "Open StudyBench",
    args.ctaHref?.trim() || SITE_URL,
  )

  return {
    subject: title,
    html,
    text: `${title}\n\n${message}\n\nOpen StudyBench: ${args.ctaHref?.trim() || SITE_URL}`,
  }
}

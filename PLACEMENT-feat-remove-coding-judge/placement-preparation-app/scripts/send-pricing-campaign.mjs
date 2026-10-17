import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { createClient } from "@supabase/supabase-js"

const SITE_NAME = "StudyBench"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://studybench.in"
const PRICE_LABEL = "₹149/year"
const SUBJECT = "Let's get you placed (honestly) 🚀"
const BATCH_DELAY_MS = 700

loadDotEnv(".env.local")
loadDotEnv(".env")

const sendMode = process.argv.includes("--send")
const limitArg = readArg("--limit")
const onlyArg = readArg("--only")
const limit = limitArg ? Number(limitArg) : Number.POSITIVE_INFINITY

if (limitArg && (!Number.isFinite(limit) || limit <= 0)) {
  throw new Error("--limit must be a positive number.")
}

const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL")
const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY")
const resendApiKey = requiredEnv("RESEND_API_KEY")
const fromEmail = process.env.RESEND_FROM_EMAIL || `${SITE_NAME} <onboarding@resend.dev>`

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const recipients = onlyArg ? [{ email: onlyArg, name: "" }] : await listRecipients(limit)

console.log(`${sendMode ? "SEND" : "DRY RUN"} campaign: ${SUBJECT}`)
console.log(`Recipients: ${recipients.length}`)
console.log(`From: ${fromEmail}`)

if (!sendMode) {
  console.log("No email sent. Re-run with --send after checking the preview.")
  console.log("")
  console.log("Preview:")
  console.log(buildTextEmail({ name: recipients[0]?.name }))
} else {
  let sent = 0
  let failed = 0

  for (const recipient of recipients) {
    const result = await sendEmail(recipient)
    if (result.ok) {
      sent += 1
      console.log(`sent ${sent}/${recipients.length}: ${recipient.email}`)
    } else {
      failed += 1
      console.error(`failed: ${recipient.email} - ${result.error}`)
    }
    await sleep(BATCH_DELAY_MS)
  }

  console.log(`Done. Sent: ${sent}. Failed: ${failed}.`)
}

async function listRecipients(max) {
  const recipients = []
  let page = 1
  const perPage = 100

  while (recipients.length < max) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw new Error(`Could not list Supabase users: ${error.message}`)

    for (const user of data.users) {
      if (recipients.length >= max) break
      if (!user.email) continue
      if (user.email_confirmed_at === null) continue
      recipients.push({
        email: user.email,
        name: typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "",
      })
    }

    if (data.users.length < perPage) break
    page += 1
  }

  return dedupeByEmail(recipients)
}

async function sendEmail(recipient) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: recipient.email,
      subject: SUBJECT,
      html: buildHtmlEmail(recipient),
      text: buildTextEmail(recipient),
    }),
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    return { ok: false, error: data?.message ?? data?.error ?? `HTTP ${response.status}` }
  }
  return { ok: true, id: data?.id }
}

function buildHtmlEmail({ name }) {
  const firstName = firstNameOrThere(name)
  return `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1e293b;background:#f8fafc;padding:32px 16px">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px;box-shadow:0 4px 12px rgba(0,0,0,0.02)">
        <p style="margin:0 0 16px;color:#2563eb;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:0.05em">${SITE_NAME}</p>
        <h1 style="margin:0 0 20px;font-size:24px;line-height:1.3;color:#0f172a;font-weight:800">Let's get you placed (honestly)</h1>
        
        <p style="margin:0 0 16px;font-size:15px;color:#334155">Hi ${escapeHtml(firstName)},</p>
        
        <p style="margin:0 0 16px;font-size:15px;color:#334155">I know how crazy placement season is right now. You probably have 20 different YouTube tabs open, three Telegram groups for PYQs, and you're preparing blindly for TCS, Accenture, or Infosys without knowing if your speed is even passing.</p>
        
        <p style="margin:0 0 16px;font-size:15px;color:#334155;font-weight:600">Honestly? Random preparation feels busy, but it rarely gets you selected.</p>
        
        <p style="margin:0 0 16px;font-size:15px;color:#334155">We built StudyBench to give you one focused plan. Right now, your account is on the Free plan. It's great to sample Section 1, but if you're serious about clearing the actual company cutoffs, you should unlock <strong>StudyBench Premium</strong>.</p>
        
        <p style="margin:0 0 16px;font-size:15px;color:#334155">Here is what you unlock for <strong>${PRICE_LABEL}</strong> (which is less than ₹13 a month):</p>
        
        <div style="margin:0 0 24px;padding:16px;background:#f1f5f9;border-radius:12px">
          <ul style="margin:0;padding-left:20px;font-size:14px;color:#334155;line-height:1.7">
            <li style="margin-bottom:8px"><strong>All 7 Company Tracks Unlocked</strong>: Full depth for TCS, Infosys, Wipro, Accenture, Zoho, Cognizant and General Tracks.</li>
            <li style="margin-bottom:8px"><strong>Realistic Mock Tests</strong>: Full company-pattern mock series with detailed analysis so you know where you stand.</li>
            <li style="margin-bottom:8px"><strong>The Coding Ladder</strong>: Practice real placement problems with hidden edge cases and detailed editorials.</li>
            <li style="margin-bottom:0"><strong>Spaced-Repetition mistake notebook</strong>: Automatically saves your wrong answers and schedules them for review.</li>
          </ul>
        </div>
        
        <p style="margin:0 0 24px;font-size:15px;color:#334155">No fake guarantees. Just honest readiness scores to keep you prepared.</p>
        
        <p style="margin:0 0 28px;text-align:center">
          <a href="${SITE_URL}/settings" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:10px;padding:14px 24px;font-weight:700;font-size:15px;box-shadow:0 4px 6px rgba(37,99,235,0.2)">
            Upgrade to Premium for ${PRICE_LABEL}
          </a>
        </p>
        
        <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.5">${SITE_NAME} is a placement learning app. We do not guarantee interview calls, jobs, placement outcomes, scores or selection by any company.</p>
      </div>
    </div>
  `
}

function buildTextEmail({ name }) {
  const firstName = firstNameOrThere(name)
  return [
    `Hi ${firstName},`,
    "",
    "I know how crazy placement season is right now. You probably have 20 different YouTube tabs open, three Telegram groups for PYQs, and you're preparing blindly for TCS, Accenture, or Infosys without knowing if your speed is even passing.",
    "",
    "Honestly? Random preparation feels busy, but it rarely gets you selected.",
    "",
    `We built StudyBench to give you one focused plan. Right now, your account is on the Free plan. It's great to sample Section 1, but if you're serious about clearing the actual company cutoffs, you should unlock StudyBench Premium.`,
    "",
    `Here is what you unlock for ${PRICE_LABEL} (which is less than Rs 13 a month):`,
    "",
    `* All 7 Company Tracks Unlocked: Full depth for TCS, Infosys, Wipro, Accenture, Zoho, Cognizant and General Tracks.`,
    `* Realistic Mock Tests: Full company-pattern mock series with detailed analysis so you know where you stand.`,
    `* The Coding Ladder: Practice real placement problems with hidden edge cases and detailed editorials.`,
    `* Spaced-Repetition mistake notebook: Automatically saves your wrong answers and schedules them for review.`,
    "",
    "No fake guarantees. Just honest readiness scores to keep you prepared.",
    "",
    `Upgrade to Premium: ${SITE_URL}/settings`,
    "",
    `${SITE_NAME} is a placement learning app. We do not guarantee interview calls, jobs, placement outcomes, scores or selection by any company.`,
  ].join("\n")
}

function firstNameOrThere(name) {
  return name?.trim().split(/\s+/)[0] || "there"
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function dedupeByEmail(recipients) {
  const seen = new Set()
  return recipients.filter((recipient) => {
    const email = recipient.email.toLowerCase()
    if (seen.has(email)) return false
    seen.add(email)
    return true
  })
}

function loadDotEnv(fileName) {
  const envPath = path.resolve(process.cwd(), fileName)
  if (!fs.existsSync(envPath)) return

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const equalsAt = trimmed.indexOf("=")
    if (equalsAt === -1) continue
    const key = trimmed.slice(0, equalsAt).trim()
    const value = trimmed.slice(equalsAt + 1).trim().replace(/^["']|["']$/g, "")
    process.env[key] ??= value
  }
}

function requiredEnv(name) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required.`)
  return value
}

function readArg(name) {
  const exact = process.argv.find((arg) => arg.startsWith(`${name}=`))
  if (exact) return exact.slice(name.length + 1)
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

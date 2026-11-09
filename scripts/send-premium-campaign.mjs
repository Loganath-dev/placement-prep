/**
 * StudyBench — Premium Conversion Campaign
 *
 * Targets every free-plan user (premium = false in user_state).
 * Skips premium users, unconfirmed emails, and creator-access holders.
 *
 * Usage:
 *   node scripts/send-premium-campaign.mjs             # dry run — preview only
 *   node scripts/send-premium-campaign.mjs --send      # live send
 *   node scripts/send-premium-campaign.mjs --only=you@example.com --send   # test on yourself
 *   node scripts/send-premium-campaign.mjs --limit=10 --send               # first 10 only
 */

import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { createClient } from "@supabase/supabase-js"

// ─── Config ────────────────────────────────────────────────────────────────
const SITE_NAME  = "StudyBench"
const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL || "https://studybench.in"
const PRICE      = "₹149/year"
const PRICE_MONTHLY = "₹12/month"
const BATCH_DELAY_MS = 800   // stay well under Resend's rate limit
const SUBJECT    = "Your placement cutoff is closer than you think 🎯"

loadDotEnv(".env.local")
loadDotEnv(".env")

const sendMode = process.argv.includes("--send")
const limitArg = readArg("--limit")
const onlyArg  = readArg("--only")
const limit    = limitArg ? Number(limitArg) : Number.POSITIVE_INFINITY

if (limitArg && (!Number.isFinite(limit) || limit <= 0)) {
  throw new Error("--limit must be a positive number.")
}

const supabaseUrl     = requiredEnv("NEXT_PUBLIC_SUPABASE_URL")
const serviceRoleKey  = requiredEnv("SUPABASE_SERVICE_ROLE_KEY")
const resendApiKey    = requiredEnv("RESEND_API_KEY")
const fromEmail       = process.env.RESEND_FROM_EMAIL || `${SITE_NAME} <onboarding@resend.dev>`

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Recipient list (free users only) ─────────────────────────────────────
const recipients = onlyArg
  ? [{ email: onlyArg, name: "" }]
  : await listFreeUsers(limit)

console.log(`\n${sendMode ? "🚀 LIVE SEND" : "📋 DRY RUN"} — Premium Conversion Campaign`)
console.log(`Subject : ${SUBJECT}`)
console.log(`From    : ${fromEmail}`)
console.log(`Recipients (free users only): ${recipients.length}`)

if (!sendMode) {
  console.log("\n── Email preview (text) ─────────────────────────────────────────────")
  console.log(buildTextEmail(recipients[0] ?? { email: "", name: "Priya" }))
  console.log("\n── Run with --send to deliver. ──────────────────────────────────────")
} else {
  let sent = 0, failed = 0

  for (const recipient of recipients) {
    const result = await sendEmail(recipient)
    if (result.ok) {
      sent++
      console.log(`✓ ${sent}/${recipients.length}: ${recipient.email}`)
    } else {
      failed++
      console.error(`✗ failed: ${recipient.email} — ${result.error}`)
    }
    await sleep(BATCH_DELAY_MS)
  }

  console.log(`\nDone. ✓ Sent: ${sent}  ✗ Failed: ${failed}`)
}

// ─── Fetch only non-premium confirmed users ────────────────────────────────
async function listFreeUsers(max) {
  const recipients = []
  let page = 1
  const perPage = 100

  // Get all premium user IDs so we can exclude them
  const { data: premiumRows } = await supabase
    .from("user_state")
    .select("id")
    .eq("premium", true)

  const { data: creatorRows } = await supabase
    .from("creator_access")
    .select("user_id")

  const excludeIds = new Set([
    ...(premiumRows ?? []).map((r) => r.id),
    ...(creatorRows ?? []).map((r) => r.user_id),
  ])

  console.log(`Excluding ${excludeIds.size} premium/creator user(s).`)

  while (recipients.length < max) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw new Error(`Could not list users: ${error.message}`)

    for (const user of data.users) {
      if (recipients.length >= max) break
      if (!user.email) continue
      if (!user.email_confirmed_at) continue          // unverified — skip
      if (excludeIds.has(user.id)) continue           // already premium — skip

      recipients.push({
        email: user.email,
        name: typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name
          : (user.user_metadata?.full_name ?? ""),
      })
    }

    if (data.users.length < perPage) break
    page++
  }

  return dedupeByEmail(recipients)
}

// ─── Send via Resend ────────────────────────────────────────────────────────
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

// ─── Email copy (humanized, conversion-focused) ────────────────────────────
function buildHtmlEmail({ name }) {
  const first = firstName(name)
  return `
  <div style="font-family:Inter,Arial,sans-serif;background:#f1f5f9;padding:32px 16px;min-height:100vh">
    <div style="max-width:600px;margin:0 auto">

      <!-- Header -->
      <div style="text-align:center;margin-bottom:24px">
        <span style="display:inline-block;background:#2563eb;color:#fff;font-weight:800;font-size:13px;letter-spacing:0.08em;padding:6px 16px;border-radius:999px;text-transform:uppercase">StudyBench</span>
      </div>

      <!-- Card -->
      <div style="background:#ffffff;border-radius:20px;padding:36px 32px;box-shadow:0 8px 32px rgba(15,23,42,0.08)">

        <!-- Opener -->
        <p style="margin:0 0 6px;font-size:28px;font-weight:800;color:#0f172a;line-height:1.2">
          ${escapeHtml(first)}, your placement<br>window is shrinking.
        </p>
        <p style="margin:0 0 24px;font-size:13px;color:#64748b;font-weight:500;letter-spacing:0.03em;text-transform:uppercase">
          Free plan → Premium · ${PRICE}
        </p>

        <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7">
          Placement season moves fast. Companies open drives, shortlist in a week and close before most students even realise they were eligible.
        </p>

        <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.7">
          You signed up for StudyBench — which means you <em>want</em> to be ready. But the Free plan only shows you Section 1. The real cutoff questions — the ones that actually filter candidates — are in the chapters beyond that.
        </p>

        <!-- Callout box -->
        <div style="background:#eff6ff;border-left:4px solid #2563eb;border-radius:8px;padding:16px 20px;margin:0 0 24px">
          <p style="margin:0;font-size:15px;color:#1e40af;font-weight:600;line-height:1.6">
            Most students who get placed practise at least 4 full mocks before their drive.<br>
            StudyBench Premium gives you the full mock series, the PYQ bank and the mistake tracker — all in one place.
          </p>
        </div>

        <p style="margin:0 0 8px;font-size:15px;color:#0f172a;font-weight:700">What you unlock with Premium:</p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14px;color:#334155">
          ${featureRow("🎯", "Full company tracks", "All sections unlocked for TCS, Infosys, Wipro, Accenture, Zoho &amp; Cognizant — not just Section 1.")}
          ${featureRow("📝", "Complete PYQ bank", "Every previous-year question with explanations. Filter by company, topic and difficulty.")}
          ${featureRow("🧪", "Full mock series", "Company-pattern full-length mocks. See your exact score breakdown — section by section.")}
          ${featureRow("💻", "Coding practice", "Real placement problems with hidden edge cases. Write and run code right in your browser.")}
          ${featureRow("🔁", "Mistake notebook", "Wrong answers auto-saved and scheduled for review using spaced repetition.")}
          ${featureRow("📊", "Placement Readiness Index", "An honest 0–100 score that tells you where you actually stand — not just where you hope to be.")}
        </table>

        <!-- Price anchor -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin:0 0 28px;text-align:center">
          <p style="margin:0 0 4px;font-size:24px;font-weight:800;color:#0f172a">${PRICE}</p>
          <p style="margin:0;font-size:13px;color:#64748b">That is just ${PRICE_MONTHLY} — less than a cup of coffee.</p>
          <p style="margin:6px 0 0;font-size:13px;color:#64748b">One-time payment. No subscription. No renewal surprise.</p>
        </div>

        <!-- CTA -->
        <div style="text-align:center;margin-bottom:28px">
          <a href="${SITE_URL}/settings"
             style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#ffffff;text-decoration:none;border-radius:12px;padding:16px 36px;font-weight:800;font-size:16px;letter-spacing:0.02em;box-shadow:0 6px 20px rgba(37,99,235,0.35)">
            Upgrade to Premium →
          </a>
          <p style="margin:12px 0 0;font-size:13px;color:#94a3b8">Secure checkout via Razorpay. Takes under 2 minutes.</p>
        </div>

        <!-- Social proof / humanizing note -->
        <div style="border-top:1px solid #f1f5f9;padding-top:20px">
          <p style="margin:0 0 12px;font-size:14px;color:#475569;line-height:1.7">
            We built StudyBench because we know how disorganised placement prep gets. No single platform had company-specific PYQs, honest mock scores <em>and</em> a mistake tracker together. So we built it.
          </p>
          <p style="margin:0;font-size:14px;color:#475569;line-height:1.7">
            We are rooting for you. Go get placed. 🎓
          </p>
          <p style="margin:16px 0 0;font-size:13px;color:#64748b">— The StudyBench team</p>
        </div>

      </div>

      <!-- Footer -->
      <p style="margin:20px 0 0;text-align:center;font-size:11px;color:#94a3b8;line-height:1.6">
        ${SITE_NAME} is a placement learning app. We do not guarantee interview calls, jobs, placement outcomes or selection by any company.<br>
        You received this because you have an account at studybench.in.
      </p>

    </div>
  </div>
  `
}

function buildTextEmail({ name }) {
  const first = firstName(name)
  return [
    `Hi ${first},`,
    "",
    "Your placement window is shrinking.",
    "",
    "Placement season moves fast. Companies open drives, shortlist in a week and close before most students even realise they were eligible.",
    "",
    "You signed up for StudyBench — which means you want to be ready. But the Free plan only shows you Section 1. The real cutoff questions are in the chapters beyond that.",
    "",
    `StudyBench Premium unlocks everything for just ${PRICE} (${PRICE_MONTHLY}):`,
    "",
    "✓ Full company tracks — all sections for TCS, Infosys, Wipro, Accenture, Zoho & Cognizant",
    "✓ Complete PYQ bank with explanations",
    "✓ Full mock series — company-pattern, with score breakdown",
    "✓ Coding practice with real placement problems",
    "✓ Mistake notebook — spaced repetition for wrong answers",
    "✓ Placement Readiness Index — honest 0-100 score",
    "",
    "One-time payment. No subscription. No renewal surprise.",
    "",
    `Upgrade now → ${SITE_URL}/settings`,
    "",
    "We are rooting for you. Go get placed. 🎓",
    "— The StudyBench team",
    "",
    `${SITE_NAME} is a placement learning app. We do not guarantee interview calls, jobs, placement outcomes or selection by any company.`,
  ].join("\n")
}

function featureRow(emoji, label, detail) {
  return `
    <tr>
      <td style="padding:10px 8px 10px 0;border-bottom:1px solid #f1f5f9;width:28px;font-size:18px;vertical-align:top">${emoji}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;vertical-align:top">
        <strong style="color:#0f172a">${label}</strong><br>
        <span style="color:#64748b;font-size:13px">${detail}</span>
      </td>
    </tr>
  `
}

function firstName(name) {
  return name?.trim().split(/\s+/)[0] || "there"
}

function escapeHtml(v) {
  return String(v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}

function dedupeByEmail(list) {
  const seen = new Set()
  return list.filter(({ email }) => {
    const key = email.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function loadDotEnv(fileName) {
  const envPath = path.resolve(process.cwd(), fileName)
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "")
    process.env[key] ??= val
  }
}

function requiredEnv(name) {
  const val = process.env[name]
  if (!val) throw new Error(`Missing required env var: ${name}`)
  return val
}

function readArg(name) {
  const exact = process.argv.find((a) => a.startsWith(`${name}=`))
  if (exact) return exact.slice(name.length + 1)
  const idx = process.argv.indexOf(name)
  return idx === -1 ? undefined : process.argv[idx + 1]
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

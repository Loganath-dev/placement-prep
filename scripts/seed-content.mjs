// Validate and seed reviewed question content into content_questions.
// Dry-run is the default. Pass --apply to write using the service-role key.
// Idempotent by question ID; this script never deletes existing content.

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"

const here = dirname(fileURLToPath(import.meta.url))
const seed = JSON.parse(readFileSync(join(here, "../lib/data/content-seed.json"), "utf8"))
const validSections = new Set(["quant", "reasoning", "verbal", "coding", "cs-core", "comm-interview"])
const errors = []
const ids = new Set()

for (const [index, q] of seed.entries()) {
  const label = q.id || `row ${index + 1}`
  if (!q.id || ids.has(q.id)) errors.push(`${label}: missing or duplicate id`)
  ids.add(q.id)
  if (!validSections.has(q.section)) errors.push(`${label}: unsupported section`)
  if (!["free", "premium"].includes(q.tier)) errors.push(`${label}: unsupported tier`)
  if (!["easy", "medium", "hard"].includes(q.difficulty)) errors.push(`${label}: unsupported difficulty`)
  if (typeof q.prompt !== "string" || !q.prompt.trim()) errors.push(`${label}: prompt is empty`)
  if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`${label}: at least two options are required`)
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.options?.length ?? 0)) errors.push(`${label}: answer index is invalid`)
  if (typeof q.explanation !== "string" || !q.explanation.trim()) errors.push(`${label}: explanation is empty`)
  if (q.optionNotes && (!Array.isArray(q.optionNotes) || q.optionNotes.length !== q.options.length || q.optionNotes.some((note) => typeof note !== "string" || !note.trim()))) {
    errors.push(`${label}: optionNotes must be non-empty and match the option count`)
  }
}

if (errors.length) {
  console.error("Seed validation failed:")
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

const rows = seed.map((q) => ({
  id: q.id, section: q.section, company_id: q.companyId ?? null, topic: q.topic,
  difficulty: q.difficulty, prompt: q.prompt, options: q.options, answer: q.answer,
  explanation: q.explanation, option_notes: q.optionNotes ?? null,
  curated: true, tier: q.tier, status: "live",
}))

console.log(`Validated ${rows.length} questions.`)
console.log(`Free: ${rows.filter((row) => row.tier === "free").length}; Premium: ${rows.filter((row) => row.tier === "premium").length}`)

if (!process.argv.includes("--apply")) {
  console.log("Dry run only. No database rows were changed. Re-run with --apply to seed.")
  process.exit(0)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding.")
  process.exit(1)
}

const admin = createClient(url, key, { auth: { persistSession: false } })
for (let start = 0; start < rows.length; start += 100) {
  const { error } = await admin.from("content_questions")
    .upsert(rows.slice(start, start + 100), { onConflict: "id" })
  if (error) {
    console.error(`Seed failed in batch ${start / 100 + 1}:`, error.message)
    process.exit(1)
  }
}

const { count, error: countError } = await admin.from("content_questions")
  .select("id", { count: "exact", head: true }).eq("status", "live")
if (countError) {
  console.error("Seed succeeded but verification count failed:", countError.message)
  process.exit(1)
}
console.log(`Seeded ${rows.length} reviewed rows. Live question rows now total: ${count ?? "unknown"}.`)

// Seed the content_questions datastore from lib/data/content-seed.json.
//
// Idempotent: upserts on id, so re-running updates rows in place. Requires the
// service role (premium rows must only be writable server-side). Run with:
//
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-content.mjs
//
// Apply migration 0010_content_questions.sql first.

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"

const here = dirname(fileURLToPath(import.meta.url))
const seed = JSON.parse(readFileSync(join(here, "../lib/data/content-seed.json"), "utf8"))

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding.")
  process.exit(1)
}

const admin = createClient(url, key, { auth: { persistSession: false } })

const rows = seed.map((q) => ({
  id: q.id,
  section: q.section,
  company_id: q.companyId ?? null,
  topic: q.topic,
  difficulty: q.difficulty,
  prompt: q.prompt,
  options: q.options,
  answer: q.answer,
  explanation: q.explanation,
  option_notes: q.optionNotes,
  curated: true,
  tier: q.tier,
  status: "live",
}))

const { error } = await admin.from("content_questions").upsert(rows, { onConflict: "id" })
if (error) {
  console.error("Seed failed:", error.message)
  process.exit(1)
}
console.log(`Seeded ${rows.length} questions into content_questions.`)

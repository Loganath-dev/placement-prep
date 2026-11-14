// Seed the content_questions datastore from lib/data/content-seed.json.
//
// Safe, additive seed: inserts missing IDs as drafts and never overwrites an
// existing question's review/publication state. Requires the service role.
// Run with:
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

const ids = seed.map((q) => q.id)
const { data: existingRows, error: lookupError } = await admin
  .from("content_questions")
  .select("id")
  .in("id", ids)

if (lookupError) {
  console.error("Could not inspect existing content before seeding:", lookupError.message)
  process.exit(1)
}

const existingIds = new Set((existingRows ?? []).map((row) => row.id))
const missing = seed.filter((q) => !existingIds.has(q.id))
const rows = missing.map((q) => ({
  id: q.id,
  section: q.section,
  company_id: q.companyId ?? null,
  topic: q.topic,
  difficulty: q.difficulty,
  prompt: q.prompt,
  options: q.options,
  answer: q.answer,
  explanation: q.explanation,
  source_id: q.sourceId,
  option_notes: q.optionNotes,
  curated: true,
  tier: q.tier,
  // New material is never student-visible merely because it was seeded.
  status: "draft",
}))

if (rows.length) {
  const { error } = await admin.from("content_questions").insert(rows)
  if (error) {
    console.error("Seed failed:", error.message)
    process.exit(1)
  }
}

console.log(`Inserted ${rows.length} new draft questions; left ${existingIds.size} existing records and their review states untouched.`)

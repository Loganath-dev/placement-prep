import fs from "node:fs"
const read = (path) => fs.readFileSync(path, "utf8")
const progress = read("app/api/learning/progress/route.ts")
const submission = read("app/api/learning/reward-submission/route.ts")
const verified = read("lib/server/verified-progress.ts")
const db = read("lib/supabase/db.ts")
const rewards = read("lib/server/learning-rewards.ts")
const migration = read("supabase/migrations/20261114120000_incremental_learning_reward_metrics.sql")
const practice = read("app/api/content/chapter-practice/route.ts")
const page = read("app/(app)/learn/[company]/[section]/[chapter]/page.tsx")
const checks = [
  ["server verified progress paginates with stable order", /\.order\("created_at", \{ ascending: true \}\)[\s\S]*?\.order\("id", \{ ascending: true \}\)[\s\S]*?\.range\(from, from \+ PAGE_SIZE - 1\)/.test(verified)],
  ["browser learning history and XP ledger paginate", /loadAllLearningEvents[\s\S]*?\.range\(from, from \+ pageSize - 1\)/.test(db) && /loadAllLearningRewards[\s\S]*?\.range\(from, from \+ pageSize - 1\)/.test(db)],
  ["reward issuance processes only one event", /\.eq\("id", sourceEventId\)[\s\S]*?\.eq\("user_id", userId\)/.test(rewards) && !/\.from\("learning_progress_events"\)\s*\.select\([^)]*\)\s*\.eq\("user_id", userId\)\s*;?\s*for \(const event of events/.test(rewards)],
  ["reward metrics are incrementally maintained by triggers", /track_learning_reward_event/.test(migration) && /track_learning_reward_xp/.test(migration) && /learning_reward_metrics/.test(migration)],
  ["learning progress endpoint enforces origin, rate and byte limit", /hasTrustedRequestOrigin/.test(progress) && /rateLimit\(`learning-progress:/.test(progress) && /readJsonBody<.*32 \* 1024/.test(progress)],
  ["reward submission endpoint enforces origin, rate and byte limit", /hasTrustedRequestOrigin/.test(submission) && /rateLimit\(`learning-reward:/.test(submission) && /readJsonBody<.*64 \* 1024/.test(submission)],
  ["all progress idempotency conflicts are resolved by saved event", /if \(error\?\.code === "23505"\)[\s\S]*?\.eq\("idempotency_key", idempotencyKey\)[\s\S]*?ensureLearningRewards\(entitlement\.userId, duplicateEvent\.id\)/.test(progress)],
  ["reward retries resolve the exact saved idempotent event", /\.eq\("idempotency_key", idempotencyKey\)[\s\S]*?ensureLearningRewards\(entitlement\.userId, savedEvent\.id\)/.test(submission)],
  ["chapter recall is not used as an assessment authorization gate", !/recalledChapterIds\.has\(chapterId\)/.test(practice) && !/!recallComplete/.test(page)],
  ["chapter recall is explicitly described as optional self-check", /optional reflection/.test(page) && /optional self-check/.test(page)],
]
let failed = false
for (const [label, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${label}`); if (!ok) failed = true }
if (failed) process.exit(1)
console.log(`Learning quality remediation checks passed (${checks.length}).`)

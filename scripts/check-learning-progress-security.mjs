import fs from "node:fs"

const read = (path) => fs.readFileSync(path, "utf8")
const migration = read("supabase/migrations/20261113144800_server_authoritative_learning_progress.sql")
const lockMigration = read("supabase/migrations/20261113144900_lock_legacy_progress_writes.sql")
const sync = read("lib/supabase/db.ts")
const attempt = read("app/api/learning/progress/route.ts")
const verified = read("lib/server/verified-progress.ts")
const flashcardSession = read("app/flashcard-study-session.tsx")
const chapterPage = read("app/(app)/learn/[company]/[section]/[chapter]/page.tsx")
const rewards = read("lib/server/learning-rewards.ts")
const rewardMigration = read("supabase/migrations/20261113150500_learning_rewards_and_legacy_history.sql")
const historyPage = read("app/(app)/history/page.tsx")
const rewardSubmission = read("app/api/learning/reward-submission/route.ts")
const rewardToken = read("lib/server/reward-submission-token.ts")
const challengeRoute = read("app/api/content/daily-challenge/route.ts")
const mockRoute = read("app/api/content/mock/route.ts")
const challengePage = read("app/(app)/challenges/page.tsx")
const mockPage = read("app/(app)/mock/page.tsx")
const rewardSubmissionMigration = read("supabase/migrations/20261114100000_verified_challenge_and_mock_rewards.sql")
const badges = read("lib/data/badges.ts")
const protectedRoutes = [
  "app/api/content/chapter/route.ts",
  "app/api/content/lesson-practice/route.ts",
  "app/api/content/chapter-practice/route.ts",
  "app/api/content/daily-challenge/route.ts",
].map(read)

const checks = [
  ["legacy chapters snapshot archived", /company_progress_legacy_archive/.test(migration)],
  ["legacy provenance explicitly unverified", /browser_writable_snapshot_unverified/.test(migration)],
  ["browser cannot write chapter snapshot", /revoke all on table public\.company_progress from anon, authenticated/i.test(lockMigration) && /grant insert \(user_id, company_id, mock_scores\)/i.test(lockMigration) && /grant update \(mock_scores\)/i.test(lockMigration)],
  ["verified event table has RLS and no authenticated write policy", /learning_progress_events enable row level security/i.test(migration) && !/create policy[^;]+learning_progress_events[^;]+for (insert|update|all)/is.test(migration)],
  ["browser sync no longer sends chapters JSON", !/chapters:\s*prog\.chapters/.test(sync)],
  ["legacy mock history uses column-scoped update rather than upsert", /\.update\(\{ mock_scores: prog\.mockScores \}\)/.test(sync) && !/from\("company_progress"\)\s*\.upsert/.test(sync)],
  ["next flashcard waits for server acknowledgement", /await onComplete\(card\.id\)/.test(flashcardSession) && /completeAndContinue\(index \+ 1\)/.test(flashcardSession) && /onComplete=\{async/.test(chapterPage)],
  ["server computes score from canonical answer key", /question\.answer/.test(attempt) && /question\.acceptedAnswers/.test(attempt) && !/answer\.correct/.test(attempt)],
  ["server writes with service client only", /createAdminClient\(\)/.test(attempt)],
  ["verified progress derives from server-authored events", /learning_progress_events/.test(verified)],
  ["content unlock routes no longer trust company_progress", protectedRoutes.every((source) => !/from\("company_progress"\)/.test(source) && /readVerifiedProgress/.test(source))],
  ["XP is written to an idempotent server reward ledger", /learning_reward_ledger/.test(rewardMigration) && /source_event_id,reward_key/.test(rewards) && /ensureLearningRewards/.test(attempt)],
  ["badge awards are persisted server-side", /learning_badge_awards/.test(rewardMigration) && /learning_badge_awards/.test(rewards) && /s\.badges\?\.includes/.test(badges)],
  ["legacy XP and badges are preserved separately", /user_gamification_legacy_archive/.test(rewardMigration) && /legacy_xp/.test(historyPage) && /legacy_badges/.test(historyPage)],
  ["historical progress is explicitly labelled unverified", /Historical \/ unverified/.test(historyPage) && /do not unlock lessons, award XP, or grant badges/.test(historyPage)],
  ["browser sync cannot overwrite XP or badges", !/xp:\s*s\.xp/.test(sync) && !/badges:\s*s\.badges/.test(sync) && /reject_client_gamification_write/.test(rewardMigration)],
  ["client does not mint XP outside server response", !/d\.xp\s*\+=/.test(read("lib/store.tsx")) && /applyServerRewards/.test(read("lib/store.tsx"))],
  ["historical archive has owner-only read policy", /user_gamification_legacy_archive enable row level security/i.test(rewardMigration) && /legacy gamification owner read/i.test(rewardMigration)],
  ["challenge and mock submissions are graded from encrypted server claims", /createDecipheriv/.test(rewardToken) && /canonical\.answer/.test(rewardSubmission) && /canonical\.acceptedAnswers/.test(rewardSubmission)],
  ["challenge and mock answer keys are not returned to the browser", /answer: _answer/.test(challengeRoute) && /acceptedAnswers: _acceptedAnswers/.test(challengeRoute) && /answer: _answer/.test(mockRoute)],
  ["daily and weekly challenges use server submission endpoint", /api\/learning\/reward-submission/.test(challengePage) && /deferGrading/.test(challengePage)],
  ["mock tests use server submission endpoint", /api\/learning\/reward-submission/.test(mockPage) && /deferGrading/.test(mockPage)],
  ["daily weekly and mock reward event types are enabled", /daily_challenge_submitted/.test(rewardSubmissionMigration) && /weekly_challenge_submitted/.test(rewardSubmissionMigration) && /mock_test_submitted/.test(rewardSubmissionMigration)],
  ["challenge period rewards are idempotent in the database", /learning_daily_challenge_once_idx/.test(rewardSubmissionMigration) && /learning_weekly_challenge_once_idx/.test(rewardSubmissionMigration)],
  ["mock first-completion XP is unique per user and company", /learning_reward_one_first_mock_per_company_idx/.test(rewardSubmissionMigration) && /mock-first-/.test(rewards)],
  ["Mock Master badge is awarded from verified mock events", /id: "mock-master"/.test(rewards) && /event_type === "mock_test_submitted"/.test(rewards)],
]

let failed = false
for (const [label, passed] of checks) {
  console.log(`${passed ? "PASS" : "FAIL"} ${label}`)
  if (!passed) failed = true
}
if (failed) process.exit(1)
console.log(`Learning progress security checks passed (${checks.length}).`)

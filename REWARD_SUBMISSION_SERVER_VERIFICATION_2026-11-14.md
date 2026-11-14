# Server-verified challenge and mock rewards — 14 November 2026

## What changed

Daily Challenges, Weekly Challenges, and Mock Tests now submit answer selections to `POST /api/learning/reward-submission`. The endpoint authenticates the user, decrypts a short-lived server-issued attempt token, validates the exact question set, grades the selected answers against the server-held canonical answer key, and writes a server-authored `learning_progress_events` record. Browser-provided correctness, score, pass flags, and XP are ignored.

The GET endpoints no longer return `answer` or `acceptedAnswers`. The attempt answer key is encrypted with AES-256-GCM using a key derived from `SUPABASE_SERVICE_ROLE_KEY`; it is bound to the authenticated user and expires after four hours. The daily/weekly token is also bound to the original IANA time zone and local period key.

## Reward policy

- Daily challenge: 30 XP for first verified completion in the user's local day, plus 10 XP per correct answer.
- Weekly challenge: 100 XP for first verified completion in the user's local week, plus 10 XP per correct answer.
- Mock test: 100 XP for the first verified mock submission per user/company. Later mock attempts are recorded, but do not repeat this first-mock XP.
- `Mock Master` is now awarded from a verified mock event.
- Rewards are written to `learning_reward_ledger`; the API returns the authoritative total XP and server-awarded badges.

The browser still keeps a local display cache for challenge completion and mock score history, but that cache is not an XP source. The mock score is only added to the local history after the server response succeeds.

## Idempotency and integrity

- Daily and weekly completions have database unique indexes by user and period.
- Attempt tokens derive stable idempotency keys, preventing a repeated POST from creating another event.
- Mock first-completion reward keys are unique by user and company, including concurrent submissions.
- Timeout-generated unanswered questions are accepted as incorrect answers rather than causing the whole submission to fail.
- Duplicate submissions return the saved result, not a newly calculated browser result.

## Files changed

- `lib/server/reward-submission-token.ts`
- `app/api/learning/reward-submission/route.ts`
- `app/api/content/daily-challenge/route.ts`
- `app/api/content/mock/route.ts`
- `lib/server/learning-rewards.ts`
- `app/quiz-runner.tsx`
- `app/(app)/challenges/page.tsx`
- `app/(app)/mock/page.tsx`
- `scripts/check-learning-progress-security.mjs`
- `supabase/migrations/20261114100000_verified_challenge_and_mock_rewards.sql`

## Deployment sequence

Deploy the application code first, then apply the pending learning-progress/reward migrations in order:

1. `20261113144800_server_authoritative_learning_progress.sql`
2. `20261113144900_lock_legacy_progress_writes.sql`
3. `20261113150500_learning_rewards_and_legacy_history.sql`
4. `20261114100000_verified_challenge_and_mock_rewards.sql`

Do not use the new submission endpoint against a database that has not had the migrations applied. Do not apply these migrations out of order.

## Validation performed

- `node scripts/check-learning-progress-security.mjs`: 24/24 checks passed.
- `node scripts/check-client-content-boundary.mjs`: passed (59 client entry points scanned).
- `node scripts/check-release-dependencies.mjs`: passed.
- `node scripts/check-next-app-directory.mjs`: passed.
- TypeScript/TSX syntax transpilation for all changed source files: passed.

## Not yet verified

This environment has no installed project `node_modules` / pnpm executable, so a full `tsc --noEmit`, Vitest run, and Next.js production build were not completed. No Supabase migration was applied, no Vercel deployment was made, and no live browser test was performed. Treat this as an implementation ZIP awaiting the deployment sequence and preview verification, not as production-certified.

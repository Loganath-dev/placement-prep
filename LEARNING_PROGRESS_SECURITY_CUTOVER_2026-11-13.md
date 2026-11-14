# StudyBench — server-authoritative learning progress cutover

Date: 13 November 2026

## What changed in this source package

1. Added `POST /api/learning/progress`.
   - Authenticates the signed-in user.
   - Resolves the chapter, lesson, free/premium visibility and canonical question/card sets on the server.
   - Accepts question IDs and selected option / typed response only; it does not accept a client `correct`, `score`, `passed`, XP or badge value.
   - Computes lesson checkpoint scores on the server (60% threshold) and chapter assessment scores on the server (70% threshold).
   - Validates lesson-card IDs, ordered card completion, complete Recall IDs, prior lesson passes and prior chapter passes.
   - Persists through the server-only Supabase service client. Browser roles have no write policy on `learning_progress_events`.
   - Uses a per-user idempotency key and database uniqueness constraints for retries, card events and Recall.

2. Added `lib/server/verified-progress.ts` and `lib/learning-progress-events.ts`.
   - Progress is derived from server-authored events only.
   - Failed lesson/assessment attempts do not unlock a stage.

3. Changed the chapter, lesson-practice, chapter-practice and daily-challenge APIs.
   - They no longer read `company_progress.chapters` to decide which learning stage is unlocked.
   - They use verified events instead.

4. Changed browser persistence.
   - `syncCompanyProgress` no longer sends `chapters` JSON.
   - `loadUserState` no longer loads the old `chapters` snapshot as mastery; it rebuilds completion from `learning_progress_events`.

5. Added two staged database migrations.
   - `20261113144800_server_authoritative_learning_progress.sql` creates the immutable legacy archive, server-authored event table, indexes and read-only owner policies. It copies existing `company_progress` snapshots verbatim with provenance `browser_writable_snapshot_unverified`.
   - `20261113144900_lock_legacy_progress_writes.sql` removes authenticated table-level write grants on `company_progress`, then permits only mock-score writes. It must be applied after the new application is deployed and healthy.

6. Added tests for verified-event aggregation and a static security gate at `scripts/check-learning-progress-security.mjs`.

## Deployment sequence — do not reverse this order

1. Confirm Vercel has `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the server-only `SUPABASE_SERVICE_ROLE_KEY`. Never expose the service-role key with a `NEXT_PUBLIC_` prefix.
2. Apply migration `20261113144800_server_authoritative_learning_progress.sql` to the production Supabase project. This is additive and archives the existing snapshots before the new code reads verified events.
3. Deploy this application source. The event table must exist before this build receives traffic.
4. Smoke-test one Free account and one Premium account: complete cards in order, submit a lesson attempt, fail then pass a checkpoint, complete Recall, fail then pass chapter assessment, and verify the next chapter is unavailable until the verified pass exists.
5. Confirm new events are visible only to their owner and authenticated direct INSERT/UPDATE/DELETE attempts against `learning_progress_events` fail.
6. Once the new deployment is healthy, apply `20261113144900_lock_legacy_progress_writes.sql`. This is the final permission cutover; older cached clients that still try to write `chapters` will receive a permission error until refreshed.
7. Re-run the smoke tests after the lock migration.

## Historical progress policy

Existing `company_progress.chapters` is copied into `company_progress_legacy_archive` with an explicit unverified provenance marker. It is preserved for historical reference, but it is not converted into trusted mastery and cannot unlock lessons or chapters. Learners may need to repeat checkpoints to establish verified progress. Do not backfill legacy `passed` flags into the event table.

## Verification performed in this environment

Passed:
- `node scripts/check-client-content-boundary.mjs`
- `node scripts/check-release-dependencies.mjs`
- `node scripts/check-next-app-directory.mjs`
- `node scripts/check-learning-progress-security.mjs` (9 static checks)
- ZIP integrity test

Not run / not verified:
- Vitest suite, including the new `lib/server/verified-progress.test.ts`
- TypeScript typecheck with project dependencies installed
- ESLint
- Next.js production build
- Browser E2E with real Free/Premium accounts
- Production Supabase migration execution and post-migration RLS verification
- Razorpay live payment test

The TypeScript command was attempted, but project dependencies (`next`, `react`, Supabase packages, Vitest and type packages) are not installed and the package registry was unreachable (`EAI_AGAIN registry.npmjs.org`). Errors from missing dependencies prevent a meaningful typecheck/build result.

## Explicit remaining work — do not describe this package as fully launch-ready

- XP, streaks and badges are still updated through the existing client-side `user_state` flow. They are not yet backed by a server-owned reward ledger. Verified lesson/chapter scores cannot be forged through the new progress endpoint, but reward balances are not fully secured by this cutover.
- Existing history is safely archived, but the learner UI does not yet present a dedicated “historical / unverified” view of that archive.
- The curriculum audit still has lessons with fewer than 20 unique, reviewed lesson-specific questions. This cutover does not manufacture or pad content.
- Full regression and production deployment verification are still required.

## Rollback

- Before migration 2, the old `company_progress` write permissions remain intact. If the new app must be rolled back, restore the previous deployment; its old progress snapshot writes continue to work.
- After migration 2, rollback requires restoring the old table-level privileges only after confirming the prior application version is being restored. Do not delete the archive or verified event rows.
- Never use archived legacy flags as trusted unlocks during rollback or forward migration.

## Add-on: server-owned rewards and historical record (2026-11-13)

The follow-up migration `20261113150500_learning_rewards_and_legacy_history.sql` adds:

- `learning_reward_ledger`: idempotent XP grants linked to a verified `learning_progress_events.id`.
- `learning_badge_awards`: server-issued badge IDs with evidence metadata and owner-read-only RLS.
- `user_gamification_legacy_archive`: one-time preservation of the previous client-writable XP and badge snapshot, labelled unverified.
- A `user_state` trigger rejecting authenticated client attempts to insert/update XP or badge values.

`lib/server/learning-rewards.ts` reconciles XP and badge awards from verified learning events. The progress API returns the authoritative totals; the client applies those totals rather than minting XP itself. `lib/supabase/db.ts` hydrates XP/badges from the ledgers and no longer sends XP/badges in browser upserts. `app/(app)/history/page.tsx` exposes historical chapter and gamification snapshots as unverified reference data.

### Reward policy in this release

- Lesson card completed: 2 XP, once per unique verified card event.
- Passed lesson checkpoint: 25 XP, once per verified attempt event.
- Chapter Recall completed: 10 XP, once per chapter.
- Passed chapter assessment: 50 XP, once per verified attempt event.
- Daily/weekly/mock XP is deliberately paused until those submission paths are server-graded and can be entered in the same ledger. Client-only XP would recreate the vulnerability.
- Mock Master and Code Crafter are not newly awarded by this learning-event ledger until mock/coding submissions have their own verified server events. Existing displayed awards are preserved in the unverified historical archive.

### Deployment order

1. Deploy the source code first (including the reward ledger reads/writes and history page).
2. Apply migrations `20261113144800`, `20261113144900` only in their documented staged order, then `20261113150500`.
3. Verify XP increments exactly once after each learning event, duplicate retries do not duplicate XP, and authenticated direct writes to `user_state.xp` / `user_state.badges` fail.
4. Verify `/history` only exposes the signed-in user's own archive and that legacy values never affect current XP/badges/unlocks.

Do not apply this migration before deploying code that has stopped writing `xp` and `badges` from the browser. Full production approval still requires dependency installation, TypeScript/Vitest/build, and authenticated Free/Premium E2E checks.

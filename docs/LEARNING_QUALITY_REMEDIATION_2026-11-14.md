# Learning quality remediation — 2026-11-14

## Scope

This change set addresses the five learning-system findings from the independent code review. It changes application code and adds one additive Supabase migration. It does not apply the migration to the live database, deploy the app, or change existing user rows directly.

## Implemented changes

### P1 — Learning history pagination

- `lib/server/verified-progress.ts` now fetches 500 rows per request with deterministic `created_at, id` ordering and continues until the final short page.
- `lib/supabase/db.ts` now paginates both learning events and the XP ledger instead of relying on a single PostgREST response.
- Query errors are surfaced; a failed page does not silently produce partial progress or XP.

### P1 — Incremental reward processing

- `lib/server/learning-rewards.ts` now processes only the specific event just committed. It no longer loops over all historical events or inserts/upserts one ledger row per old event on every submission.
- New migration `supabase/migrations/20261114120000_incremental_learning_reward_metrics.sql` creates private per-user counters, backfills historical event/XP totals, and maintains counters with database triggers.
- `get_learning_reward_metrics(uuid)` returns the bounded metrics needed for badge decisions and is executable only by `service_role`.
- The reward ledger remains the source of truth for XP. The metrics table is an aggregate cache maintained transactionally by triggers.
- Chapter Recall no longer issues XP or new recall badges because the current flow is a learner self-check, not an independently graded assessment. Existing ledger entries and previously awarded badges are preserved.

### P1 — Abuse controls and request limits

- Both learning POST routes now require the shared trusted-origin check.
- `/api/learning/progress` uses the distributed limiter at 30 requests per user per 10 minutes and a 32 KiB JSON body cap.
- `/api/learning/reward-submission` uses the distributed limiter at 12 requests per user per 10 minutes and a 64 KiB JSON body cap.
- Production rate-limit failures return 503 (fail closed); throttled requests return 429 with `Retry-After`.
- `lib/security/read-json-body.ts` reads the request stream with a hard byte ceiling before parsing JSON.

### P2 — Idempotent retries

- Progress submissions now check and surface errors from the idempotency lookup.
- Duplicate `23505` conflicts resolve the saved event and return the original score/pass state for lesson-practice and chapter-assessment submissions.
- Concurrent retries using the same idempotency key return the already-saved event rather than a false HTTP 500.
- Existing card/recall uniqueness behavior remains supported by looking up the canonical card or chapter event when a unique index is hit with a different idempotency key.
- Daily/weekly challenge duplicate-period handling remains supported when a refreshed token collides with the one-per-period unique index.

### P2 — Chapter Recall semantics

- Chapter Recall is now explicitly an optional self-check/reflection step.
- It no longer grants XP or recall badges, and it no longer gates access to the chapter assessment.
- The chapter assessment remains the server-graded mastery gate (70% pass threshold); lesson checkpoints and required learning cards remain enforced.
- This avoids treating a client-submitted list of known card IDs as proof of recall. A genuinely verified recall assessment would require authored questions/answer keys and server-side grading, which the current recall deck does not contain.

## Required deployment order

1. Review the additive migration `20261114120000_incremental_learning_reward_metrics.sql` against the target Supabase schema.
2. Apply that migration to the intended Supabase project. It performs a one-time aggregate backfill and installs triggers; it does not delete learning events or reward ledger rows.
3. Deploy the application code from this change set.
4. Verify a newly submitted lesson practice, chapter assessment, daily challenge, weekly challenge, and mock test. Confirm one ledger row per eligible event/reward key, metrics counters change once, and retries return the original result.
5. Test a user with more than 1,000 learning events and reward rows to confirm the final pages are included.
6. Confirm Upstash Redis environment variables are present in production before enabling these endpoints.

Do not deploy the application before the migration: the new reward handler requires the `get_learning_reward_metrics` RPC.

## Verification performed in this workspace

- `node scripts/check-learning-quality-fixes.mjs` — PASS (10 checks).
- `node --experimental-strip-types` direct runtime check for `readJsonBody` — PASS (valid, malformed, oversized input).
- TypeScript `transpileModule` syntax checks — PASS for all 9 modified TypeScript/TSX/test files.
- `node scripts/check-learning-progress-security.mjs` — PASS (26 checks).
- `node scripts/check-client-content-boundary.mjs` — PASS (59 client entry points scanned transitively).
- `node scripts/check-release-dependencies.mjs` — PASS (manifest/lockfile release gate only).
- `node scripts/check-next-app-directory.mjs` — PASS.
- `node scripts/check-batch5-security-migrations.mjs` — PASS (6 checks).
- Direct Node runtime checks for `readJsonBody` — PASS (valid JSON, malformed JSON, oversized body).

The full Vitest suite, ESLint, Next.js production build, browser E2E, authenticated Supabase integration, SQL migration execution, and load testing were not run. The extracted project has no `node_modules`; package installation was previously blocked by registry DNS failure. A global `tsc --noEmit` attempt was not a valid project typecheck because dependencies and their type declarations were absent; it reported widespread missing-module/JSX type errors. No production migration or deployment was performed.

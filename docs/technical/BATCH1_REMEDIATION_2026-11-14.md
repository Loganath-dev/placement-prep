# StudyBench Batch 1 remediation — 14 November 2026

Scope: client consistency and progress-sync retry behavior only. No database migrations, production data changes, credentials, deployment configuration, or production deployment were changed.

## Changes

1. `lib/store.tsx`
   - Captures the last locally known entitlement during hydration.
   - When `/api/premium/status` is unavailable, merges general profile/progress data while preserving the cached entitlement fields.
   - General `user_state` data is not used to downgrade a known creator/purchased entitlement.
   - Hydration's background progress drain no longer overrides a permanent-error pause.

2. `lib/entitlement-state.ts` and `lib/entitlement-state.test.ts`
   - Adds a small pure merge helper and regression tests for creator, purchased, and known-Free entitlement fallback.

3. `app/(app)/learn/[company]/[section]/[chapter]/page.tsx`
   - Clamps a requested or saved resume index to the first card not yet verified by the server.
   - Updates the in-memory verified-card list only after `POST /api/learning/progress` succeeds, so the next-card clamp advances after server acknowledgement.

4. `lib/learning-progress.ts` and `lib/learning-progress.test.ts`
   - Adds safe card-index calculation and tests for stale resume pointers, review navigation, completed lessons, empty lists, and invalid indexes.

5. `lib/supabase/progress-sync-queue.ts`
   - Classifies known permanent database permission/schema/data errors (including PostgreSQL `42501`) separately from transient failures.
   - Keeps the latest snapshot in local storage but pauses automatic retry for permanent failures.
   - Allows an explicit user retry after the underlying permission/configuration issue is corrected.
   - Online/focus recovery only retries transient failures.

6. `lib/supabase/progress-sync-queue.test.ts`
   - Adds regression coverage for preserving a pending snapshot, stopping automatic retries on `42501`, and allowing a later explicit retry.

7. `app/sync-error-banner.tsx`
   - Explains when automatic retries are paused for a permanent permission/data error rather than claiming the snapshot will be retried automatically.

## Validation

Passed:
- `node scripts/check-client-content-boundary.mjs`
- `node scripts/check-release-dependencies.mjs`
- `node scripts/check-next-app-directory.mjs`
- `node scripts/check-learning-progress-security.mjs` — 26 checks
- TypeScript syntax transpilation for all changed TS/TSX files
- Direct Node checks for safe resume-index behavior and entitlement-preserving merge behavior

Blocked / not run:
- Full Vitest suite: Vitest is not installed.
- Full TypeScript type-check: project dependencies and React/Next.js type packages are unavailable.
- ESLint and production build: dependencies are unavailable.
- Browser E2E with real Free/Creator/Premium accounts: not run.

## Important remaining verification

The previously reported `42501 permission denied for table company_progress` cannot be declared resolved from a source patch alone. The live database inspection showed authenticated column privileges for `user_id`, `company_id`, and `mock_scores`, and SELECT access; the deployed Vercel commit and exact request path still need to be checked against the current ZIP. This patch prevents repeated automatic retries of a permanent permission error and preserves the local snapshot; it does not silently bypass database permissions.

No Supabase migration or production deployment was performed as part of Batch 1.

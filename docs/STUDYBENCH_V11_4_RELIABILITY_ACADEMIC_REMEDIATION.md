# StudyBench V11.4 — Reliability & Academic Remediation

Date: 10 November 2026
Baseline: `studybench-v11-3-academic-verification(1).zip`

## Scope

This pass applies the actionable findings from the independent StudyBench product audit to the supplied V11 baseline. It is a local source-code change only. No live Supabase database, Razorpay account, GitHub repository, or production deployment was accessed.

## Changes in this pass

### 1. Progress queue account isolation

- Replaced the shared V1 queue write path with per-account V2 localStorage keys.
- Kept lazy read migration from the V1 shared queue.
- The legacy V1 record is intentionally retained during migration so a failed V2 write cannot destroy the only recovery copy.
- Retained the existing acknowledgement rule: a pending snapshot is removed only after `syncAll` succeeds and the queued version has not changed.
- Retained retry/backoff, online/focus recovery, and explicit retry behaviour.
- Added regression tests for separate account keys, V1 migration, successful acknowledgement and failed-sync retention.

Limitation: localStorage is not a transactional multi-writer database. Per-account keys remove cross-account whole-object read/modify/write collisions, but concurrent tabs for the same account can still race. A future server-backed operation log or IndexedDB transaction layer is appropriate if same-account multi-tab editing becomes a supported workflow.

### 2. PYQ duplication

- Fixed five exact repeated prompts across company-specific banks by replacing duplicate records with distinct, answerable questions.
- Added a global duplicate-prompt assertion across all company tracks, not merely per-company duplicate checks.
- `scripts/check-pyq-dups.mjs` now reports 457 hand-authored questions and zero exact duplicate prompts.

This check proves exact-text uniqueness, not semantic uniqueness or correctness of every answer. Academic answer verification remains a separate review requirement.

### 3. Existing V11 safeguards confirmed

The supplied V11 baseline already contains these safeguards; they were preserved rather than duplicated:

- Supabase helper errors are rethrown after diagnostics are logged.
- `syncAll` covers profile, user state, daily goals, company progress, mistakes and drive outcomes.
- Remote deletion reconciliation reads remote IDs first and does not delete if either read fails.
- Mock student delivery goes through `publishedMocksForCompany`, which accepts only `publicationStatus === "published"`.
- Base mocks remain drafts, so the student API currently returns no mock simulations until an explicit publication is made.
- PYQ records distinguish `verified_previous_year`, `company_pattern_practice`, `topic_revision` and `mock_question`; legacy guessed years/frequency are not exposed as verified historical metadata.
- `lib/data/coding-problems.ts` is absent from this baseline.

## Local verification completed

- `node scripts/check-client-content-boundary.mjs` — passed.
- `node scripts/check-pyq-dups.mjs` — passed; 457 hand-authored PYQs, zero exact duplicate prompts.
- `node --check scripts/seed-content.mjs` — passed.
- ZIP extraction and package JSON parsing — passed.

## Not verified in this environment

- Vitest suite, including the newly added queue regression tests.
- ESLint, full TypeScript typecheck and Next.js production build.
- Live Supabase schema compatibility, RLS policies, migration execution or backup restoration.
- Razorpay end-to-end transactions and webhook replay.
- Browser E2E, offline browser testing, screen-reader testing or load testing.

Dependencies are not installed in the archive environment and pnpm is not available, so those checks must be run after installing the locked dependencies.

## Release status

Development candidate only. Do not treat this ZIP as production approved until the unrun test/build checks, database integration checks, academic answer review and browser workflows have passed.

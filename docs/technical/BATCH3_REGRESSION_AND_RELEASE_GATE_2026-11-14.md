# StudyBench — Batch 3 regression and release gate

Date: 14 November 2026  
Target source: `studybench-batch1-remediated-2026-11-14.zip` (working copy)  
Production target: Supabase project `PLACEMENT` (`rvekcdsczorpxwqdwpbp`)  
Mode: Source inspection and read-only production checks. No production writes, migrations, or deployments.

## Executive result

**Batch 3 is not release-cleared.** The payment and reward source contains meaningful server-side protections and regression tests, but the test suite, TypeScript check, and production build could not be completed because project dependencies are absent and package-manager installation could not reach the npm registry in this environment.

No confirmed critical/high source defect was established during this inspection. No source code behavior was changed. The only source-tree edit in this pass is correction of the Batch 2 reconciliation report's migration inventory.

## 1. Source-level checks

Inspected Razorpay order, verify and webhook routes; premium status; learning progress and reward submission; daily challenge and mock routes; admin referral approve/payout routes; learning reward ledger implementation and migrations.

Positive controls found:
- Order creation requires an authenticated user, server-owned plan/price, trusted request origin, and rate limiting.
- The historical ₹249 annual plan is rejected for new orders in the route tests.
- Checkout verification validates HMAC, retrieves the canonical Razorpay order/payment, checks ownership, captured status, amount and currency, then records/grants by payment identity.
- The webhook validates raw-body HMAC, caps payload size, retrieves canonical order and payment from Razorpay, validates owner/plan/amount/currency/status, and returns retryable errors on transient activation failures.
- Payment ledger and entitlement grant are designed to be idempotent; tests cover duplicate delivery and payment replay by a different user.
- Daily/weekly challenge periods have unique event indexes; first-mock XP has a unique user/reward-key index. Reward computation uses server-side verified event records.
- Admin referral approval and payout routes require trusted origin and MFA, validate identifiers/input, and call privileged database RPCs.

## 2. Regression coverage found in source

Relevant tests exist in:
- `tests/razorpay-routes.test.ts`
- `tests/payment-reliability.test.ts`
- `tests/admin-payout-route.test.ts`
- `tests/admin-referral-approval.test.ts`
- `lib/server/verified-progress.test.ts`
- `lib/learning-progress.test.ts`

The Razorpay route suite includes unauthenticated requests, rate limiting, legacy plan rejection, server-owned plan amount, invalid signature, wrong owner, amount mismatch, uncaptured payment, duplicate delivery, payment replay, trusted order/payment lookups, and transient activation failure. Admin tests cover origin, MFA, malformed IDs, RPC error mapping, and payout transaction reference validation.

These are source-inspection findings only; the tests were not executed.

## 3. Static project gates executed

| Check | Result |
|---|---|
| `node scripts/check-client-content-boundary.mjs` | PASS — 59 client entry points scanned transitively |
| `node scripts/check-release-dependencies.mjs` | PASS |
| `node scripts/check-next-app-directory.mjs` | PASS |
| `node scripts/check-learning-progress-security.mjs` | PASS — 26 checks |

## 4. Blocked checks

- `corepack pnpm --version` could not download pinned `pnpm@10.28.0`; npm registry DNS/network request failed (`EAI_AGAIN`).
- `node_modules` is absent in the working tree and no cached `node_modules` directory was found under `/mnt/data`.
- `tsc --noEmit` was attempted using the globally available TypeScript binary but failed because required dependencies/types are missing (`next`, `react`, `@supabase/*`, Node types, Vitest config, and others). This is an environment/dependency failure, not a clean TypeScript result.
- Vitest could not be run because Vitest is not installed locally and package installation was blocked.
- Next.js production build could not be run because Next.js dependencies are not installed.

Required to complete: restore network/package registry access or provide a dependency cache, then run `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, and `pnpm build` from this exact source tree.

## 5. Live Supabase advisor snapshot

Project status: `ACTIVE_HEALTHY`, PostgreSQL 17.6.1, region `ap-south-1`.

Security advisor findings:
- INFO: RLS enabled with no policies on `affiliate_commissions`, `content_question_reviews`, and `creator_invite_codes`.
- WARN: leaked-password protection disabled in Supabase Auth.

Performance advisor findings:
- INFO: five unindexed foreign keys: `affiliate_commissions.reviewed_by`, `content_question_reviews.reviewer_id`, `content_questions.author_id`, `content_questions.published_by`, and `content_questions.reviewer_id`.
- INFO: ten unused-index notices. These are not grounds to drop indexes without workload review.

The no-policy findings appear consistent with intentional server-only access for `affiliate_commissions` and `content_question_reviews`; `creator_invite_codes` also has no client-facing policy. A read-only privilege query showed `service_role` grants on `affiliate_commissions`; `creator_invite_codes` has broad role grants but RLS has no policies, so client roles remain blocked by RLS. This deserves a deliberate least-privilege review; no grant or policy changes were made.

## 6. Production test and release decision

Not performed:
- No live Razorpay payment or webhook replay was triggered.
- No live challenge/mock submissions were created.
- No production data or schema was modified.
- No Vercel deployment or production smoke test was run.

**Release gate: BLOCKED** until dependency installation succeeds and the full TypeScript, Vitest, and production build checks pass. Only then proceed to controlled production smoke tests. Backup/PITR verification and exact provenance for `20261114035209_fix_company_progress_snapshot_insert_grants` remain Batch 2 blockers.

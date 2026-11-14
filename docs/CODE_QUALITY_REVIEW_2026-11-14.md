# StudyBench — Independent Code Quality Review

**Review date:** 2026-11-14  
**Reviewed artifact:** `studybench-final-blocker-status-2026-11-14.zip`  
**Scope:** Static source review of the supplied archive, focused on architecture, correctness, security, reliability, maintainability, tests, CI and operational readiness. No source-code changes were made as part of this review.

## Executive verdict

**NOT PRODUCTION READY — substantial strengths, but several correctness and operational risks remain.**

The codebase is materially stronger than a typical early-stage learning app: it has strict TypeScript mode, server-side entitlement checks, payment reconciliation, RLS-backed data access, an event-based learning-progress model, server-owned reward records, CI workflows, and a meaningful unit-test suite. The security-boundary scripts pass.

However, the review found a critical data-volume boundary in learning progress/rewards, an expensive full-history reward-reconciliation path, incomplete idempotent handling for learning submissions, missing abuse controls on the learning write endpoints, and an incomplete migration provenance gate. The current load test is a low-volume public smoke test, not evidence for the stated 1,500-concurrent-user target.

This is a static code review, not a runtime or penetration test. Dependencies are not installed in the archive environment, and registry access failed; therefore TypeScript, ESLint, Vitest and the Next.js production build were not run.

## Project inventory

- 425 files in the extracted project tree.
- 38,358 lines across application/library/component TypeScript and TSX files.
- 3,200 lines of SQL migration source.
- 28 API route files.
- 48 SQL migration files.
- 42 test files (`*.test.ts` / `*.test.tsx`), with 4,445 test-source lines.
- No Playwright/Cypress/E2E configuration found.
- No root `.env.example` file found, although `docs/OPERATIONS.md` and README refer to one.
- No `node_modules` directory in the archive.

## Positive findings

1. **Entitlement availability semantics:** `lib/premium-guard.ts` distinguishes an unauthenticated user from an entitlement lookup failure and returns an availability error rather than silently downgrading a paid user to Free. It also scopes service-role fallback reads to the authenticated user ID.
2. **Payment verification:** Razorpay verify checks the checkout HMAC, canonical Razorpay order, order ownership, amount/currency, and captured payment status. The webhook verifies its signature against the raw body and re-fetches canonical order/payment details before activation.
3. **Payment idempotency:** payment ledger uniqueness and `grant_premium_for_payment` are used to make verify/webhook retries safe against duplicate entitlement extension.
4. **Learning authority:** browser writes to the legacy chapter snapshot are constrained; progress events are server-authored and the client content-boundary checker scans transitive client entry points.
5. **Rewards:** XP and badge awards are represented in server-owned ledgers rather than trusting client XP totals. Challenge/mock answers are checked against encrypted server-authored claims.
6. **Admin controls:** sensitive referral payout/approval and content publication paths require MFA assurance level `aal2` and use service-role RPCs.
7. **Operational security:** security headers, a production-required distributed rate limiter, secret scanning, dependency audit in CI, and fail-fast runtime environment checks are present.

## Findings — prioritized

### P1 — Learning history reads silently truncate at the API row cap

**Files:**
- `lib/server/verified-progress.ts:6-13`
- `lib/server/learning-rewards.ts:23-29, 57-61`
- `lib/supabase/db.ts:175-184, 275-340`

Several queries read a user's complete learning event or reward history without pagination or a bounded server-side aggregation:

- `readVerifiedProgress()` selects all learning events and orders oldest first.
- `ensureLearningRewards()` selects all learning events, then separately reads all reward rows and event rows again to recompute XP/badges.
- `loadUserState()` selects all learning events and all reward ledger rows in the browser client.

Supabase/PostgREST applies a configured maximum response-row limit (commonly 1,000 unless changed). There is no project config in this archive demonstrating a higher safe cap, and these queries do not paginate. Once a user crosses the response limit, the oldest-first progress query can omit newer learning events. That can make completed lessons/chapters appear incomplete or prevent later unlocks. XP aggregation can also undercount because only the returned reward rows are summed. This is a correctness issue, not just a performance concern.

**Remediation:** implement deterministic cursor pagination (stable `created_at,id` ordering) or database RPCs that aggregate/derive state server-side. For the browser state loader, fetch bounded summaries rather than raw event history. Add tests with more than 1,000 events and verify newest progress and full XP totals.

### P1 — Reward reconciliation performs repeated full-history scans and per-event writes

**File:** `lib/server/learning-rewards.ts:23-81`  
**Call sites:** `app/api/learning/progress/route.ts:145-165`, `app/api/learning/reward-submission/route.ts:95-97`

Every accepted learning submission calls `ensureLearningRewards()`. That function reads the user's entire event history, loops through every event, and issues an upsert/insert for each rewardable event; it then reads event/reward histories again and recomputes badges. Work therefore grows with the user's lifetime activity and creates many serial database round trips per submission. A user with hundreds of events can trigger hundreds of writes on each new action; concurrent actions multiply the work.

**Remediation:** award only the newly inserted event in the same database transaction/RPC as event creation, using unique constraints as the idempotency guard. Reconcile old events in a bounded background/admin job. Use SQL aggregates for XP and badge metrics. Do not run a full-history repair loop on the interactive request path.

### P1 — Learning write routes lack rate limiting and request-size limits

**Files:**
- `app/api/learning/progress/route.ts:20-39`
- `app/api/learning/reward-submission/route.ts:12-34`

Unlike the question grading, payment, affiliate and creator endpoints, the two learning mutation routes do not call `rateLimit()`. They parse request JSON without a content-length/stream-size cap. The progress endpoint performs entitlement reads, full progress-history reads, and reward reconciliation for each accepted submission. This exposes an avoidable database/cost amplification path for an authenticated account and is particularly concerning in combination with the full-history behavior above.

**Remediation:** add per-user distributed limits (with stricter limits by event type), enforce a small request-body byte cap before JSON parsing, cap array/string lengths, and return `429` with `Retry-After`. Ensure Redis failure behavior remains fail-closed in production.

### P2 — Duplicate learning submissions are not idempotent for practice/assessment events

**File:** `app/api/learning/progress/route.ts:142-160`

The route first looks up an existing event by `idempotency_key`, but ignores errors from that lookup. It then inserts. A unique-constraint violation is treated as a successful duplicate only for `lesson_card_completed` and `chapter_recall_completed`. For `lesson_practice_submitted` and `chapter_assessment_submitted`, a retry using the same idempotency key (including a normal network retry after the first insert succeeded) falls through to a generic 500. Concurrent duplicate submissions have the same problem.

**Remediation:** handle unique violations for every event type by fetching the canonical saved event and returning its original score/pass/reward response. Do not ignore lookup errors; distinguish an actual not-found from a database failure. Add route tests for sequential retry, concurrent duplicate, and lost-response retry.

### P2 — Chapter Recall completion is validated only by submitted card IDs

**File:** `app/api/learning/progress/route.ts:77-82`

The server checks that the submitted `cardIds` exactly equal the expected recall-card IDs and that lesson checkpoints were passed. It does not receive or validate any recall response, answer, or learner self-assessment. A caller who knows the card IDs can directly POST the complete list and mark recall as passed, which then unlocks the chapter assessment and grants the recall event reward.

**Remediation:** decide explicitly whether recall is intended to be a self-attested completion step. If yes, label it as such and do not treat it as a verified mastery assessment. If it is intended to verify recall, require structured answers and grade them server-side against canonical answer data. Add a test demonstrating the chosen contract.

### P2 — CSRF origin checks are inconsistent across cookie-authenticated mutation endpoints

**Files:**
- `app/api/learning/progress/route.ts:20-33`
- `app/api/learning/reward-submission/route.ts:12-24`
- Compare guarded mutation routes such as `app/api/questions/route.ts:83-85` and `app/api/razorpay/verify/route.ts`.

The learning write routes authenticate via the user's Supabase cookie but do not call `hasTrustedRequestOrigin()`, unlike most other mutation routes. Supabase's cookie SameSite behavior may reduce exploitability in common browser configurations, but the app's own CSRF defense is inconsistent and these routes are explicitly cookie-authenticated.

**Remediation:** apply the shared origin check to both POST handlers. Preserve the helper's documented support for non-browser clients without an Origin header only where such clients are intentionally supported; otherwise require a trusted Origin/Fetch Metadata combination.

### P2 — Migration CI does not validate the timestamped migration stream

**File:** `.github/workflows/ci.yml` migration job

The migration CI job verifies only that `0001` through `0036` each exist once. It does not validate the timestamped migrations that follow them, their uniqueness, their source-to-live mapping, or missing source files for applied live versions. This means it cannot detect the known live migration `20261114035209` whose original SQL source is missing from the reviewed archive. The challenge/reward source migration names also differ from the timestamped live migration names documented in the prior review, so provenance needs an explicit mapping rather than inference.

**Remediation:** maintain a checked-in migration provenance manifest mapping each live version to its exact source filename and checksum. CI should verify every timestamped source file, no duplicate versions, and a one-to-one expected manifest. Never synthesize the missing migration body from current grants.

### P2 — Load-test artifact does not test the target workload

**File:** `tests/load/public-smoke.k6.js`

The only load test ramps to 15 virtual users and tests the public homepage, FAQ and question API. It does not exercise authenticated dashboards, learning progress writes, reward reconciliation, entitlement reads, payment paths, or the database-heavy user workflows. It provides no evidence for 1,500 concurrent users.

**Remediation:** create a controlled staging-only test with seeded accounts and representative authenticated journeys. Ramp gradually (for example 25/100/250/500/1,000/1,500 VUs only after capacity review), measure p50/p95/p99, errors, DB CPU/connection saturation, Redis latency, and Vercel function duration. Never point this test at production without explicit approval.

### P2 — Runtime TypeScript safety is weakened by untyped Supabase admin access

**Files:** `lib/supabase/admin.ts:4-12`, `lib/entitlement.ts:5-7`, and manually maintained row interfaces in `lib/supabase/db.ts`.

The admin client is declared as `SupabaseClient<any, any, any>`, and entitlement helpers use the same broad `any` client. The DB client also hand-maintains row interfaces. This makes schema drift, incorrect column names, and RPC parameter mismatches harder for TypeScript to catch. Strict mode is enabled, which is good, but these boundaries bypass much of its value.

**Remediation:** generate Supabase database types from the live schema, use typed clients for normal and service-role access, and isolate unavoidable untyped operations behind small, validated adapters.

### P3 — Admin email allowlist is hard-coded in a client-importable module

**File:** `lib/admin-config.ts:5`; imported by `app/nav.tsx` and `app/(app)/settings/page.tsx`.

The configured administrator email is included in a module consumed by client components, so it can be present in the browser bundle. This does not by itself grant admin access (server-side checks still exist), but it unnecessarily exposes an administrator identifier and couples role configuration to a source-code release.

**Remediation:** store the allowlist in server-only environment configuration or a server-owned role table. Pass only a boolean capability flag to the client for navigation visibility.

### P3 — CSP still permits inline scripts

**File:** `next.config.ts`

The production CSP includes `script-src 'unsafe-inline'`. The source comment acknowledges this is temporary until a nonce-based CSP is implemented. This reduces CSP's ability to mitigate script injection.

**Remediation:** implement a nonce-based CSP compatible with the Next.js rendering model and validate Razorpay/analytics script behavior before tightening production policy.

### P3 — Operational docs refer to a missing `.env.example`

**Files:** `docs/OPERATIONS.md`, `README.md`; `.env.example` absent from the archive.

The documentation says the complete environment-variable inventory is in `.env.example`, but that file is not present. This creates deployment/setup ambiguity.

**Remediation:** add a sanitized `.env.example` containing variable names and safe placeholders only; never put actual keys or production URLs with credentials in it.

## Test and verification evidence

### Checks actually run during this review

The following Node static checks passed:

- `node scripts/check-client-content-boundary.mjs` — PASS; 59 client entry points scanned transitively.
- `node scripts/check-release-dependencies.mjs` — PASS; checks selected package and lockfile version strings only.
- `node scripts/check-next-app-directory.mjs` — PASS.
- `node scripts/check-learning-progress-security.mjs` — PASS; 26 source-pattern assertions.
- `node scripts/check-batch5-security-migrations.mjs` — PASS; 6 source-pattern assertions.

### Checks not run

- `pnpm install --frozen-lockfile` — not run; `pnpm` is not installed and Corepack could not reach `registry.npmjs.org` (`EAI_AGAIN`).
- Vitest suite — not run.
- TypeScript `tsc --noEmit` — not run.
- ESLint — not run.
- Next.js production build — not run.
- Browser/mobile E2E — no Playwright/Cypress harness found and not run.
- Authenticated integration tests against Supabase — not run.
- Razorpay sandbox end-to-end payment — not run.
- Load test — not run; the included k6 script is only a 15-VU public smoke test.

Static source checks are not substitutes for runtime verification.

## Recommended remediation order

1. Fix event/reward pagination and replace interactive full-history reward reconciliation with incremental atomic award logic.
2. Make every learning event retry idempotent and add route-level concurrency tests.
3. Add rate limiting, request-size caps and origin checks to learning mutation routes.
4. Decide and enforce the Chapter Recall completion contract.
5. Add a timestamped migration provenance manifest and reconcile the missing `20261114035209` source with its original authoring commit.
6. Generate typed Supabase clients and remove hard-coded admin identity from client-importable code.
7. Add `.env.example`, nonce CSP, authenticated E2E coverage and a staging load test.
8. Install dependencies in a network-enabled CI runner and execute lint, typecheck, full tests and production build before considering release.

## Final quality assessment

| Area | Assessment |
|---|---|
| Architecture and separation | Good foundation; some large interactive modules need incremental service extraction |
| Authentication and entitlement | Strong server-side direction; runtime integration still needs testing |
| Payments | Strong verification pattern; end-to-end sandbox evidence outstanding |
| Learning progress correctness | At risk due to unpaginated history reads and duplicate retry behavior |
| XP/rewards | Server-authoritative model is good; reconciliation algorithm does not scale well |
| API abuse controls | Inconsistent on learning write endpoints |
| Database and migrations | Strong RLS/ledger direction; migration provenance gate incomplete |
| Type safety | Strict TS enabled, but admin client `any` weakens schema guarantees |
| Test coverage | Useful unit/route tests; no browser E2E and no learning route integration tests |
| Performance evidence | Insufficient for the stated 1,500-user target |
| Operational docs | Good runbooks; `.env.example` missing and backups not evidenced |

**Final verdict: NOT PRODUCTION READY.** The strongest immediate blockers are the unbounded learning-history architecture, full-history reward reconciliation, learning submission retry handling, missing write-route abuse controls, and lack of representative end-to-end/load-test evidence.

## Follow-up: company_progress grant reconciliation migration

A new additive migration was prepared at
`supabase/migrations/20261114110000_reconcile_company_progress_snapshot_grants.sql`.
It reapplies the already-reviewed permission model: authenticated SELECT,
column-scoped INSERT on `user_id`, `company_id`, and `mock_scores`, column-scoped
UPDATE on `mock_scores`, and no anonymous table access. It also documents the
legacy `chapters` snapshot as non-client-writable.

This is a new reconciliation migration, **not** recovered original source for
live migration `20261114035209`. It has not been applied to production. Review
and apply it through the normal migration process only after confirming the
current live grants and migration history.

## Follow-up remediation status (same day)

A follow-up implementation for the five learning findings is documented in `docs/LEARNING_QUALITY_REMEDIATION_2026-11-14.md`. It adds paginated reads, incremental reward counters and event-specific ledger processing, origin/rate/body-size controls, duplicate retry recovery, and makes Chapter Recall an optional self-check rather than an authorization gate. The additive migration `20261114120000_incremental_learning_reward_metrics.sql` is required before deploying the matching application code. It has not been applied to production. Static checks passed; full dependency-backed tests/build and live SQL verification remain outstanding.

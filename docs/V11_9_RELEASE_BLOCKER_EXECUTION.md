# StudyBench V11.9 — release blocker execution record

**Decision: HOLD — do not deploy this candidate to production.**

This record combines source inspection with a read-only inspection of the connected Supabase project on 2026-11-10. It deliberately distinguishes source changes from operations that require staging, production credentials, provider configuration, or a real device/browser.

## Live Supabase snapshot (read-only)

Project: `PLACEMENT` (`rvekcdsczorpxwqdwpbp`), `ap-south-1`, PostgreSQL 17.6, `ACTIVE_HEALTHY`.

Migration history observed:

- 0030 `lock_affiliate_payout_destination`: applied
- 0031 `preserve_affiliate_financial_records`: applied
- 0032 `revoke_exposed_creator_invites`: applied
- 0033 `ensure_typed_mistake_answers`: applied
- 0034 `content_quality_workflow`: not present
- 0035 `content_review_workflow`: not present
- 0036 `payment_reliability_and_plan_identity`: not present

No separate active staging Supabase project was available. The `NEET` project is unrelated and inactive. No database writes, DDL, migration application, Auth configuration changes, or payments were performed.

### Live Supabase Security Advisor

- `public.set_updated_at` mutable search path: WARN. Migration 0036 contains the intended fixed-search-path replacement.
- Leaked-password protection disabled: WARN. This is a Supabase Auth Dashboard setting and is not changed by SQL migration.
- `creator_invite_codes` RLS enabled with no policy: INFO. This is intended deny-by-default; verify service-role-only access remains intact.

### Live Supabase Performance Advisor

- Five unindexed foreign keys: affiliate_commissions.buyer_id, affiliate_payouts.paid_by, content_questions.created_by, creator_invite_codes.redeemed_by, question_reports.user_id. Migration 0036 adds indexes for these.
- Eighteen RLS policies have per-row auth function evaluation. Migration 0036 rewrites the audited owner policies using `(select auth.uid())`.
- Seven indexes are reported unused. Do not drop them solely on this advisory; usage can be low on a small/new application. Reassess after representative traffic.

### Known live schema gaps

- `content_questions` currently has legacy provenance/review fields but not all columns added by migrations 0034/0035.
- `affiliate_commissions.plan_key` and `assert_financial_erasure_schema_ready()` from migration 0036 are not present yet.
- Legacy `profiles.upi_id` and `profiles.upi_name` remain updatable until migration 0036 revokes those column grants.
- The account-deletion route must remain fail-closed until the financial-erasure schema preflight exists and returns true.

## Blocker status

| Priority | Work | Status | Evidence / next action |
|---|---|---|---|
| P0 | Upgrade Next.js and React | **PARTIAL — lockfile pending** | The local archive manifest is now pinned to Next.js/eslint-config-next 16.4.5, React/React DOM 19.2.9, Vitest 4.1.12 and Vite 8.1.6. The lockfile still contains the previous resolutions because the package registry was unavailable in this session. Do not use a frozen install until `pnpm install --no-frozen-lockfile` has regenerated `pnpm-lock.yaml`; the release dependency gate intentionally fails until the manifest and lockfile agree. |
| P0 | Reconcile Supabase migrations 0030–0036 | **PARTIAL** | Live history confirms 0030–0033 applied; 0034–0036 missing. No staging project is available. Do not apply 0034–0036 directly to production. Create/identify staging, restore a backup there, review SQL and apply in order. |
| P0 | Verify Razorpay payments and webhooks | **SOURCE ONLY** | Signature, order ownership, amount/currency and captured-status checks exist in source; no live Razorpay test credentials or signed webhook delivery test was run. Run sandbox payment, duplicate delivery, timeout, DB failure/retry and reconciliation tests. |
| P0 | Verify affiliate payout security | **PARTIAL** | Live history includes 0030/0031; live payout and commission tables are empty. Migration 0036's stronger settlement routine, unique transaction index and current-consent check are not yet live. Do not process payouts until 0036 is applied and tested in staging. |
| P1 | Configure CAPTCHA | **NOT CONFIGURED** | No CAPTCHA provider integration/configuration was evidenced. Select Cloudflare Turnstile or Supabase Auth CAPTCHA, provision site/secret keys outside source control, wire signup/reset/public form flows, and test both valid and rejected tokens. |
| P1 | Complete backup restoration | **NOT PERFORMED** | Runbook exists, but no backup was created or restored. Take a managed backup/PITR point or verified `pg_dump`, restore to isolated staging, compare critical row counts and verify Storage objects separately. |
| P1 | Test multi-device progress synchronization | **UNIT COVERAGE ONLY** | Durable queue/retry tests exist. Real two-device and cross-tab conflict behavior is unverified; whole-snapshot writes may be last-writer-wins. Run concurrent edits on two accounts/devices and define conflict/merge acceptance before launch. |
| P1 | Production build, full tests and load tests | **NOT EXECUTED** | No package manager/network dependency install available in this environment. Run frozen install, dependency audit, release dependency gate, lint, typecheck, Vitest, production build, then k6 against staging. |
| P1 | Browser accessibility testing | **NOT EXECUTED** | Keyboard shortcut and responsive code exist; no real browser, screen-reader, mobile touch or WCAG audit was performed. Run keyboard-only, focus visibility, labels/errors, contrast, zoom/reflow and screen-reader flows. |

## Dependency security target

The local package manifest now declares the patched release targets identified in the November 2026 audit. The lockfile must be regenerated from that manifest and the workspace overrides before a frozen install is safe:

```bash
pnpm add next@16.4.5 react@19.2.9 react-dom@19.2.9
pnpm add -D eslint-config-next@16.4.5 vitest@4.1.12 vite@8.1.6
pnpm install --no-frozen-lockfile
pnpm audit --audit-level high
pnpm check:release-deps
```

Do not hand-edit `pnpm-lock.yaml`. Commit the manifest and regenerated lockfile together. Re-run CI and build before deployment.

## Required staging sequence

1. Provision/identify a dedicated staging Supabase project and staging Razorpay credentials.
2. Take a recoverable backup and restore it to staging; record checksum, restore timestamp, migration head and restore duration.
3. Reconcile live history and repository migration names; apply missing 0034, 0035, 0036 in order on staging only.
4. Verify RLS policies, grants, `set_updated_at` search path, five FK indexes, payout transaction uniqueness, affiliate destination locking, terms acceptance, and financial-erasure preflight.
5. Enable Supabase leaked-password protection in Auth settings; configure CAPTCHA with provider secrets in the correct environment.
6. Run payment/webhook replay and failure tests using Razorpay test mode; reconcile every test order against exactly one ledger row and one entitlement grant.
7. Run multi-device progress conflict scenarios and browser accessibility checks.
8. Run full CI and the 15-VU k6 smoke profile against staging; review latency/error thresholds and Supabase/Vercel logs.
9. Obtain explicit release approval, schedule a migration window, take a fresh production backup, then deploy application and migrations in the approved order.

## Read-only post-migration SQL checks

Use `supabase/audits/v11_9_release_acceptance.sql` after applying migrations in staging. It reports migration-specific columns/functions, FK indexes, relevant policies and payout transaction duplicate state. It does not modify data.

## Evidence policy

A code path, test file, or runbook is not proof of a successful live operation. Mark an item complete only when the staging run, command output, provider event, or browser/device evidence is attached to the release record.


## Local ZIP remediation addendum — 2026-11-11

The V11.9 archive has since received a local-only hardening pass. The shared Upstash rate limiter now uses a single atomic Redis `EVAL` operation for expiry pruning, counting and insertion, with a 5-second timeout and fail-closed production behavior. Unit tests cover atomic command shape, the denied-limit path, Redis failure and malformed responses. Admin MFA assurance access now safely handles a missing assurance response. The Vercel-only project configuration also drops unused Cloudflare OpenNext and Wrangler dependencies. CI is scoped to the canonical working branch and uses Node 22 / pnpm 10.28.0 with a frozen-lockfile release gate.

The ZIP was not pushed, deployed, or applied to Supabase. The `pnpm-lock.yaml` in this archive is still stale relative to the updated manifest. Registry access was unavailable here, so no generated lockfile is claimed. Run the dependency refresh command above on a network-enabled workstation; then require `pnpm check:release-deps`, `pnpm audit --audit-level high`, lint, typecheck, unit tests and the production build to pass.

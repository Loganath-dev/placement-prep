# StudyBench V11.9 — release blocker execution record

**Release decision: HOLD. Do not deploy this candidate to production.**

This report distinguishes source-level review from live database observations and operations that require staging or provider credentials.

## Repository branch reconciliation

Target branch: `chore/root-cleanup-canonical-app`  
Base commit inspected: `3ca94b4e994380c7683075a14f0f2732491f2ce6`

Important: the selected GitHub branch currently contains migrations only through `0020_remove_referral_system.sql`. The V11.9 archive contains migrations 0021–0036. The live Supabase project has a separately observed migration history through 0033, but that does **not** mean this branch contains those migrations. Before applying any new migration, reconcile the full ordered migration chain 0021–0036 against both the branch and the live database. Do not cherry-pick only 0034–0036 into this branch: they depend on schema changes introduced earlier in 0021–0033.

The branch also has an OpenNext/Cloudflare build configuration. Do not replace its package manifest, lockfile, build scripts, or CI workflow with the V11.9 archive versions without a deliberate platform-compatible reconciliation.

## Live Supabase snapshot (read-only)

Project: `PLACEMENT` (`rvekcdsczorpxwqdwpbp`), region `ap-south-1`, PostgreSQL 17.6, status `ACTIVE_HEALTHY`.

Observed live history:
- 0030 `lock_affiliate_payout_destination`: applied
- 0031 `preserve_affiliate_financial_records`: applied
- 0032 `revoke_exposed_creator_invites`: applied
- 0033 `ensure_typed_mistake_answers`: applied
- 0034 `content_quality_workflow`: missing
- 0035 `content_review_workflow`: missing
- 0036 `payment_reliability_and_plan_identity`: missing

No separate active staging project was available. No database writes, DDL, migration application, Auth configuration changes, payments, or deployment were performed.

### Live Supabase Security Advisor
- `public.set_updated_at` mutable search path: WARN.
- Leaked-password protection disabled: WARN; this requires Supabase Auth configuration.
- `creator_invite_codes` has RLS enabled with no policy: INFO; intended deny-by-default, but verify service-role-only access.

### Live Supabase Performance Advisor
- Five unindexed foreign keys: `affiliate_commissions.buyer_id`, `affiliate_payouts.paid_by`, `content_questions.created_by`, `creator_invite_codes.redeemed_by`, `question_reports.user_id`.
- Eighteen RLS policies use per-row auth function evaluation.
- Seven indexes are reported unused. Do not drop them solely based on this advisory.

### Known live schema gaps
- `content_questions` lacks all columns added by the content-governance migrations.
- `affiliate_commissions.plan_key` and `assert_financial_erasure_schema_ready()` are missing.
- Legacy `profiles.upi_id` and `profiles.upi_name` remain updatable until the relevant migration is applied.
- Account deletion must remain fail-closed until its financial-retention schema preflight succeeds.

## Production blockers

| Priority | Work | Status | Required evidence / next action |
|---|---|---|---|
| P0 | Upgrade Next.js and React | **BLOCKED** | Manifest and lockfile still resolve Next.js 16.2.6 and React/React DOM 19.2.4. Target versions for this release are Next.js and eslint-config-next 16.4.5; React and React DOM 19.2.9. Regenerate lockfile with pnpm; do not hand-edit it. |
| P0 | Reconcile Supabase migrations 0030–0036 | **PARTIAL** | Live history shows 0030–0033 applied and 0034–0036 missing. Repository target branch is further behind (migration 0020). Reconcile 0021–0036 in order on a restored staging database first. |
| P0 | Verify Razorpay payments and webhooks | **SOURCE ONLY** | Source checks cover signatures, order ownership, amount/currency and captured status. No real test-mode signed webhook delivery was executed. Test successful payment, duplicate delivery, timeout, DB failure/retry and ledger reconciliation. |
| P0 | Verify affiliate payout security | **PARTIAL** | 0030/0031 exist in live history; live commission and payout tables are empty. Test 0036 settlement, unique transaction reference and current-consent checks before any payout. |
| P1 | Configure CAPTCHA | **NOT CONFIGURED** | Select Turnstile or Supabase Auth CAPTCHA; store secrets outside source control; wire signup/reset/public forms and test rejected tokens. |
| P1 | Complete backup restoration | **NOT PERFORMED** | Take a verified backup, restore into isolated staging, compare critical row counts and verify storage objects. |
| P1 | Test multi-device progress synchronization | **UNIT COVERAGE ONLY** | Queue/retry unit tests exist; real two-device and cross-tab conflict behavior is unverified. Run concurrent edits and define merge/conflict acceptance. |
| P1 | Production build, full tests and load tests | **NOT EXECUTED** | Run frozen install, dependency audit, lint, typecheck, Vitest, platform-correct Cloudflare build and k6 against staging. |
| P1 | Browser accessibility testing | **NOT EXECUTED** | Run keyboard-only, focus visibility, semantic labels/errors, contrast, zoom/reflow, mobile touch and screen-reader flows. |

## Dependency update target

Once package registry access is available, update the branch's existing Cloudflare-compatible manifest without removing OpenNext dependencies or changing its build/deploy scripts:

```bash
pnpm add next@16.4.5 react@19.2.9 react-dom@19.2.9
pnpm add -D eslint-config-next@16.4.5
pnpm install
pnpm audit --audit-level high
pnpm check:release-deps
```

Commit `package.json` and `pnpm-lock.yaml` together. Verify the OpenNext Cloudflare build and deploy preview before considering production.

## Required sequence

1. Reconcile this branch's migration history with the complete archive and live database; review all migrations 0021–0036.
2. Provision/identify staging; take a backup and restore it there.
3. Apply the reconciled migrations in order on staging only.
4. Verify RLS/grants, payout destination lock, financial retention, entitlement stacking, unique payout references and account-erasure preflight.
5. Enable leaked-password protection and configure CAPTCHA.
6. Run Razorpay test-mode payment/webhook and idempotency tests.
7. Run multi-device conflict scenarios and browser accessibility tests.
8. Run all CI checks, platform-correct build and 15-VU k6 smoke profile on staging.
9. Obtain explicit release approval, take a fresh production backup and deploy only in an approved maintenance window.

## Evidence policy

A code path, SQL file or runbook is not proof of a successful live operation. Mark a blocker complete only with staging output, provider events, CI run, restore evidence, or browser/device test results.

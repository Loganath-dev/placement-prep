# StudyBench V11.7 execution summary

Date: 10 November 2026

## Implemented in the source archive

- Current checkout: ₹249/year only.
- Historical ₹299/180-day and ₹499/365-day orders remain verifiable; no new checkout for those plans.
- Untagged historical ₹24,900 orders resolve as annual (365 days), matching the live payment ledger. Explicit `premium_lifetime_249` metadata is required to resolve a historical lifetime order.
- Razorpay order/verify/webhook input, identity, signature, timeout and upstream response checks strengthened.
- Payment verification returns a retryable 503 when affiliate commission persistence fails after payment/entitlement processing.
- Payment entitlement RPC now stacks finite renewals and preserves an already-active lifetime entitlement.
- Affiliate commissions store plan identity; dashboard labels current and historical purchases accurately.
- Affiliate payout settlement locks the payout account, checks current terms, 15-day eligibility, payout day, minimum balance, UPI destination and unique transaction reference.
- Affiliate terms v2 has an existing-account reacceptance flow; the payout RPC blocks accounts with stale consent.
- Account deletion checks the financial FK retention schema and fails closed until nullable `ON DELETE SET NULL` references are present.
- Admin affiliate workspace shows current consent and the latest 100 payout settlement snapshots.
- Live Supabase advisor remediations included in migration 0036: RLS `auth.uid()` initplan rewrites, five missing FK indexes, fixed search paths and legacy UPI update revocation.
- Added read-only RLS audit SQL, live audit report, backup/restore runbook, k6 harness and browser/accessibility checklist.
- Added regression tests for plan resolution, webhook retries, affiliate commission failure, payout validation, consent reacceptance, account-erasure gating and sync queue behavior.

## Live Supabase audit findings

The connected `PLACEMENT` project was inspected read-only. All inspected public/storage tables had RLS enabled. Anon smoke checks returned no rows for sampled private tables; authenticated checks showed owner-scoped profile/payment/progress rows and zero rows owned by other users.

The live database is behind the source archive:
- Source migrations 0030–0035 are not recorded as applied.
- Live affiliate UPI fields in `profiles` are still user-updatable, and the live payout function reads those fields.
- Live Auth deletion cascades commission and payout rows; migration 0031 is required to preserve financial evidence.
- Live `grant_premium_for_payment` does not stack an early renewal.
- Live content question schema lacks the V11.6 review-workflow columns.
- Live payment ledger has three ₹24,900 purchases, all with `entitlement_days = 365`.
- No affiliate accounts, referred profiles, commission rows or payout rows were present at inspection.

See `V11_7_LIVE_SUPABASE_AUDIT_2026-11-10.md` for full evidence.

## Verification performed

Passed:
- TypeScript syntax-only transpilation of modified TS/TSX files.
- Client/server content boundary script.
- PYQ duplicate audit: 457 hand-authored PYQs, zero exact duplicate prompts.
- Seed script syntax.
- k6 script syntax.
- Static payment/security/affiliate contract assertions.
- ZIP archive integrity check.

Not passed / not run:
- Vitest, ESLint, full TypeScript project check and Next.js build could not run because project dependencies/binaries were unavailable or inaccessible in the extracted environment.
- No SQL migration was executed; no PostgreSQL client was available in the local workspace.
- No live Razorpay payment or webhook was triggered.
- No backup or restore rehearsal was performed.
- No k6 load test or real browser accessibility run was performed.
- No real two-device conflict test was performed. Current full-snapshot progress sync may be last-writer-wins across devices.

## Release blockers

1. Reconcile and apply migrations 0030–0036 on staging, in order; do not deploy app code against the current live schema.
2. Verify the payout-destination lock and financial-record retention behavior before enabling affiliate payouts/account deletion.
3. Enable Supabase leaked-password protection in Auth settings.
4. Complete staging backup/restore, payment/webhook, two-device progress, load, keyboard and screen-reader tests.
5. Run Vitest, lint, typecheck and production build in the normal dependency-installed environment.

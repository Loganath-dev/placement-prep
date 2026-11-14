# StudyBench V11.7 release notes

## Payment and entitlement

- New purchases expose only ₹249/year (365 days).
- Historical ₹299/180-day and ₹499/365-day orders remain verifiable but cannot be newly purchased.
- Untagged historical ₹24,900 orders resolve as annual (365 days), matching the connected live ledger. Lifetime is recognized only from an explicit historical `premium_lifetime_249` plan key.
- Razorpay order creation validates upstream order responses and handles network timeouts.
- Payment verification validates Razorpay order/payment IDs and returns a retryable 503 if entitlement or affiliate reconciliation is incomplete; the message explicitly tells the user not to pay again.
- Webhook input is bounded, signatures are shape-checked, and upstream order/payment lookups have timeouts.
- Duplicate payment delivery continues through the payment-keyed ledger and entitlement RPC.
- Migration 0036 fixes finite renewal stacking and preserves already-active lifetime access.

## Affiliate operations

- New commission rows store their plan key.
- Affiliate dashboard labels current and historical plans separately.
- Admin referral reconciliation fails visibly on incomplete financial queries.
- Admin payout page includes the latest 100 settlement records and payout destination snapshots.
- Admin payout API validates JSON input and avoids returning raw database error details.
- The live audit found profile UPI fields are still user-updatable and the live payout function reads them. Migration 0030 moves payout destination authority to the locked `affiliate_accounts` row; payouts must remain disabled until that migration is applied and verified.
- The live audit also found Auth deletion currently cascades affiliate commission and payout rows. Migration 0031 changes these foreign keys to `ON DELETE SET NULL` so financial evidence survives account erasure; do not enable affiliate account deletion until it is applied and verified.
- Affiliate terms have a new version; existing accounts can reaccept in the dashboard, and the payout RPC blocks settlement until the current consent version is recorded.

## Supabase security and performance

- Live RLS/catalog inspection found all inspected public and storage tables have RLS enabled.
- Migration 0036 rewrites 18 auth-context RLS policies to use statement-level `auth.uid()` evaluation.
- Adds indexes for five foreign keys reported by the live Performance Advisor.
- Fixes the mutable search path on `set_updated_at`.
- Replaces deprecated `auth.role()` in the referral attribution trigger with a current database role check.
- Drops the redundant direct commission SELECT policy after direct table reads were revoked.

## Operations and testing assets

- Read-only RLS/security audit SQL.
- Live Supabase audit report with actual advisor findings and role-scoped smoke checks.
- Backup/restore and release runbook.
- k6 public smoke/load harness.
- Browser accessibility and multi-device acceptance checklist.
- Added regression tests for payment plan resolution, duplicate webhook delivery, retryable commission failures, admin payout input and migration invariants.

## Release limitations

- No live migration was applied.
- No Razorpay payment/webhook was triggered.
- No backup or restore was performed.
- No k6 load test or real browser accessibility run was performed.
- Vitest, ESLint, TypeScript project check and Next.js production build could not complete in the extracted environment because dependencies/binaries were unavailable or inaccessible.
- The connected live Supabase project is behind the V11.6 source migration head. Reconcile migrations 0030–0035, then apply 0036 on staging only.
- Leaked-password protection must be enabled in Supabase Auth settings manually.

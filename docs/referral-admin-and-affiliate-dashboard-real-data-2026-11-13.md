# Referral Admin and Affiliate Dashboard — Real Data Fix

Date: 2026-11-13

## Requested outcome

The admin referral workspace must identify the affiliate who referred each student, the referred student's username, total referrals attributed to that affiliate, the selected Premium plan, captured payment amount/status, and Premium expiry. Each affiliate's own dashboard must show only the students attributed to that authenticated affiliate, using real records.

## Changes

- Reworked the admin referred-student directory into a clear attribution/purchase table with affiliate username, referred-student username, total referred by that affiliate, signup date, plan, captured amount, payment status, and Premium expiry.
- Added a truthful empty state explaining that records appear after referral attribution is saved. No sample users or fabricated metrics are inserted.
- Updated the affiliate dashboard API to query profiles using `referred_by = authenticated user.id`, then reconcile those same referred user IDs against the captured payment ledger.
- The affiliate sees display names, signup dates, plan labels, and whether a Premium payment was captured. Student IDs, email addresses, Razorpay payment IDs, exact payment amounts, and UPI details are not exposed to the referrer.
- Commission plan identity is preferred when available; the payment ledger amount is the fallback for existing captured purchases. Removed reliance on `payments.plan_key`, because that column is not present in the live schema.
- Kept commission and payout records scoped to the authenticated affiliate.

## Live database verification

Read-only checks against the PLACEMENT Supabase project (`rvekcdsczorpxwqdwpbp`) returned:

- Affiliate accounts: **0**
- Profiles with `referred_by` set: **0**
- Affiliate commission rows: **0**
- Captured payment ledger rows: **3**

The live `payments` table has `user_id` and `amount`; it does not currently have `plan_key`. The implementation therefore uses the commission's server-resolved `plan_key` when available and otherwise derives the known plan label from the captured amount. No schema migration is required for this display change.

Because the live database currently contains zero affiliate accounts and zero referred profiles, the page will correctly show an empty state until a real user activates an affiliate account and a signup is attributed through their referral code. It is not appropriate to fabricate referral rows from unrelated payment records.

## Validation

- TypeScript transpile/parser diagnostics: passed for all five modified TS/TSX files.
- `scripts/check-client-content-boundary.mjs`: passed.
- `scripts/check-release-dependencies.mjs`: passed.
- `scripts/check-next-app-directory.mjs`: passed.
- Full `tsc --noEmit`, Vitest and production build were not run because project dependencies are not installed in this environment.
- No production database rows were modified and no deployment was performed.

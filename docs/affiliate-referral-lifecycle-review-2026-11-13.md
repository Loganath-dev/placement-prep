# StudyBench referral lifecycle review — 13 November 2026

## Expected lifecycle

1. Affiliate accepts current programme/privacy terms and saves a UPI ID + account-holder name.
2. Affiliate shares `/auth/signup?ref=<12-char-code>`.
3. Email signup (immediate session or confirmation callback) and Google OAuth preserve the referral code into the trusted auth callback.
4. The server resolves an active affiliate code and writes `profiles.referred_by` once. Self-referrals and overwrites are rejected. The referred student does not need to buy Premium immediately.
5. A captured ₹299 / 6-month payment creates one ₹25 pending commission; a captured ₹499 / 1-year payment creates one ₹50 pending commission. Both payment verification and Razorpay webhook call the same idempotent payment/commission ledger flow. `payment_id` is unique, so verify/webhook retries cannot create a second reward.
6. The referred student's join is visible in Admin → Referrals → Every referred student. The affiliate sees an aggregate join count; individual student identities and payment IDs are intentionally not exposed to the referrer.
7. A successful Premium purchase appears as a commission row in the affiliate dashboard and as a buyer/payment/reward row in the admin payout queue.
8. After the 15-day review period, an admin with MFA explicitly verifies and approves the reward. It stays pending until this action.
9. On the 25th, the admin manually transfers the approved balance by UPI, enters the transaction reference and marks it paid. The database enforces the ₹250 minimum, current affiliate consent, active affiliate account, payout day, UPI snapshot and unique transaction reference.

## Issues found and fixed

- **Automatic approval contradicted manual verification.** The admin page previously called `auto_approve_eligible_commissions()` on page load. Removed that call and added an explicit MFA-protected Verify & approve action. The database RPC re-checks the 15-day delay, pending status, original payment ledger, buyer identity, amount, refund state, referral attribution and active affiliate account. It records reviewer and review timestamp.
- **Refunded purchases could inflate affiliate conversion count.** The affiliate dashboard now counts only pending/approved/paid commissions as successful conversions; refunded/cancelled records remain visible in history but do not count as conversions.
- **Admin conversion terminology was ambiguous.** The account directory distinguishes verified Premium purchases from currently active Premium entitlements.
- **Admin must not approve based on UI state alone.** Eligibility and payment/referral checks are enforced again inside the database transaction; UI disabling is only a convenience.

## Files changed

- `app/(app)/admin/referrals/page.tsx`
- `app/admin-referrals-table.tsx`
- `app/admin-affiliate-directory.tsx`
- `app/api/admin/referrals/approve/route.ts`
- `app/api/affiliate/dashboard/route.ts`
- `tests/admin-referral-approval.test.ts`
- `tests/affiliate-dashboard.test.ts`
- `supabase/migrations/0037_manual_affiliate_reward_review.sql`

## Verification

- Existing auth callback tests cover email/OAuth callback referral preservation, first attribution wins, self-referral rejection, unknown affiliate rejection and read-error safety.
- Existing Razorpay route tests cover verified six-month/annual payments, webhook/verify idempotency and retry behavior.
- Added route tests cover trusted-origin protection, admin MFA, valid commission IDs and database rejection handling.
- Added dashboard regression coverage ensures refunded commissions do not count as conversions.
- Static repository checks passed: client/server boundary, release dependency gate and App Router directory check.
- TypeScript parser/syntax checks passed for all seven changed TS/TSX files.

## Important deployment gate

The migration `0037_manual_affiliate_reward_review.sql` must be applied to the intended Supabase project before the new Verify & approve action can work. No Supabase migration was applied by this local source change. Run the migration in staging first, verify the RPC and new columns, then deploy the application. Full Vitest/typecheck/build/browser tests remain blocked until dependencies can be installed from the package registry.

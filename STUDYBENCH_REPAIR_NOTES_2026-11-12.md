# StudyBench repair notes — 12 November 2026

## Changes made in this source archive

### Affiliate referrals
- Kept personal referral codes as 12-character cryptographically random hexadecimal codes.
- Changed code creation to retry a unique-constraint collision instead of failing the affiliate application immediately.
- Removed legacy direct-referrer-user-ID attribution. New attribution accepts only an active affiliate referral code.
- Preserved first attribution: the profile update still only writes when `referred_by` is null.
- Kept self-referral rejection, authenticated user checks, trusted-origin checks and per-user rate limiting.
- Corrected affiliate purchase labels: ₹249 is shown as legacy annual, ₹299 as the current six-month plan, and ₹499 as the current annual plan.

### Creator and admin payout views
- Creator payout history now requests and displays the UPI ID and account-holder name snapshot saved with each payout.
- Admin payout history now displays both snapshot fields, even if the creator later changes their current payout details.
- Admin commission rows show the current account-holder name alongside the current UPI ID.
- Payout-day UI now uses Asia/Kolkata time to match the database settlement function.
- Added migration `20261112090000_affiliate_payout_destination_snapshot.sql`. It adds `affiliate_payouts.upi_name` and updates the settlement RPC to snapshot both UPI fields at payout time.
- Existing payout rows remain valid; their historical `upi_name` will be null because that information was not recorded at the time.

### Admin access and resilience
- Exempted `/admin` from the student onboarding redirect in the client shell. Server-side `requireAdmin()` remains the authorization gate; sensitive admin routes still require AAL2 MFA.
- Admin overview now handles a missing service-role configuration with a clear setup message and shows individual metrics as unavailable if a metric query fails, rather than crashing the whole overview.
- Added an admin-segment error boundary with a retry path and links back to the admin overview and student dashboard.

### Learning quality
- Removed generic reusable “application/debugging/transfer” filler questions that were appended to every non-language programming chapter.
- Lesson practice now uses chapter-authored questions; SQL/DBMS can additionally use its dedicated SQL practice bank. It no longer pads every lesson with section-wide drills that may not match the topic.
- Practice questions are distributed by difficulty so each lesson receives easy, then medium, then hard questions where the bank supports it.
- Chapter practice now uses the chapter's own quiz (plus the dedicated SQL/DBMS bank), and sorts questions easy-to-hard. Free-tier difficulty filtering remains in place.
- Added unit tests for progressive difficulty, no synthetic padding and duplicate removal.

## Required database step before testing the payout history
Apply the new migration in the intended Supabase environment:

`supabase/migrations/20261112090000_affiliate_payout_destination_snapshot.sql`

Do not manually add the column and do not run the migration against production until you explicitly approve that operation. New creator/admin payout-history queries expect this column to exist.

## Not done / intentionally deferred
- Full Next.js build, TypeScript, lint and Vitest run were not performed, per request to defer build/crash verification.
- No live Supabase migration, schema/RLS verification or data mutation was performed.
- No Razorpay, Upstash, email provider or browser end-to-end test was performed.
- No production deployment or GitHub push was performed.
- A complete academic fact-check of every lesson across every track still requires subject-by-subject review. This pass removed known generic filler and corrected lesson practice scoping; it does not claim every topic has been independently fact-checked.

## Manual acceptance checks to run after database migration
1. Create an affiliate account and confirm a unique 12-character referral code is generated.
2. Copy its `/auth/signup?ref=CODE` URL; test email signup and Google signup.
3. Confirm the new profile has the affiliate's user ID in `referred_by`, and a second attribution attempt cannot overwrite it.
4. Confirm invalid, suspended, unknown and self-referral codes are rejected.
5. Update the creator's UPI ID and account-holder name; verify both appear in the creator account panel and admin affiliate directory.
6. On the payout date, settle an eligible commission with MFA and a transaction reference.
7. Verify the payout snapshot contains the exact UPI ID and account-holder name used for that settlement in both creator and admin payout histories.
8. Change the creator's UPI details after a payout and verify the old payout row still shows the original snapshot.
9. Verify the ₹250 minimum, 15-day review, 25th-of-month rule, current terms acceptance and duplicate settlement protections.
10. Confirm a non-admin cannot open admin pages or call admin APIs, and an admin without AAL2 cannot perform sensitive actions.

## Verification performed in this pass
- Source ZIP extracted successfully and original archive integrity passed.
- Static local-import scan: no unresolved project imports; only the two expected generated `.next/types` references are absent.
- Key source assertions checked for strict code attribution, admin onboarding exemption, UPI snapshot reads/writes and lesson difficulty ordering.
- The new migration and tests are present in the archive.

# Referral reporting and affiliate dashboard update — 13 November 2026

## Admin → Affiliate management

- The referred-student directory now shows the referred student's profile name, the referring affiliate's profile name, that affiliate's total referred count, signup date, selected Premium plan, captured payment amount/status and current Premium expiry.
- The commission queue now shows the plan label and captured purchase amount separately from the referral reward.
- Plan labels are resolved from the server-owned `payments.plan_key`, with amount-based labels for historical records.
- Existing account-level total-referral counts remain in the affiliate accounts table.

## Affiliate → Your referral dashboard

- The dashboard now lists actual signup events attributed to the signed-in affiliate only, sourced by `profiles.referred_by = auth.uid()`.
- Referral rows show anonymised sequence labels and join dates. Student IDs, names, emails, account state, expiry and payment details are not exposed to affiliates, consistent with the existing privacy copy.
- Existing commission activity continues to show plan, reward and review/payout status without linking a purchase to a student identity.

## Payment plan data integrity

- Added `payments.plan_key` in migration `0038_payment_plan_identity_for_referral_admin.sql`.
- Both Razorpay verify and webhook paths now write the trusted, server-resolved plan key into the payment ledger.
- Historical commission plan keys are backfilled into matching payment rows where available.
- A captured payment ledger row is displayed as Captured; absence of a payment row is displayed as No purchase. No synthetic data is generated.

## Important production note

The admin screenshot shows zero affiliate accounts, zero referred students and zero commissions. If the selected Supabase project genuinely has no rows, the UI must continue to show zero/empty states. Do not create sample referrals or fake payments. Confirm that local `.env` and production point to the intended Supabase project and that real signup attribution/payment flows have been exercised.

## Validation

- Added affiliate dashboard route tests for authenticated-user scoping and anonymised real referral rows.
- Added a payment ledger plan-key assertion to entitlement tests.
- Static repository checks and full tests/build must be run before deployment; the migration must be applied to the correct Supabase project before deploying code that selects `payments.plan_key`.

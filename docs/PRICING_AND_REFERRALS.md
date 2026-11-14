# Premium pricing and referral rewards

## Active Premium plans

| Plan key | Customer price | Entitlement | Referral reward |
|---|---:|---:|---:|
| `premium_6_months_299` | ₹299 | 180 days | ₹25 (2,500 paise) |
| `premium_annual_499` | ₹499 | 365 days | ₹50 (5,000 paise) |

Amounts, currency, entitlement duration and referral reward are resolved on the server from the selected plan key. The browser cannot set the order amount or access duration. Payment verification and webhook reconciliation fetch the Razorpay order and payment, then grant access only when the captured payment matches the order amount, currency and owner.

The previous ₹249 annual plan remains verifiable for already-created orders. Untagged historical ₹24,900 orders resolve as annual (365 days), matching the live ledger. Lifetime access is recognized only when the explicit historical `premium_lifetime_249` key is present; lifetime access is not offered for new purchases.

The payment ledger is unique by `payment_id`. Migration `0022_idempotent_payment_entitlements.sql` adds a payment-keyed grant RPC so checkout verification and webhooks can retry without extending the same purchase twice.

## Referral attribution and reward

- A referral URL uses `/auth/signup?ref=<unique-12-character-affiliate-code>`. The code is issued only after the affiliate accepts the current Terms & Conditions and Privacy Policy and provides UPI payout details.
- Email confirmation and Google OAuth carry the referral identifier through `/auth/callback`.
- The server attaches attribution once. A database trigger prevents client-side changes and self-referrals.
- A verified ₹299 six-month purchase creates a fixed ₹25 commission. A verified ₹499 annual purchase creates a fixed ₹50 commission. The historical ₹249 annual reward remains ₹25.
- The current Affiliate Terms version is `affiliate-2026-11-11-v3`. Existing affiliates must accept the updated terms before payout settlement; the database payout RPC enforces this check.
- Commissions are idempotent by `payment_id`.
- Rewards remain pending for 15 days. The admin referral page approves elapsed rewards and records manual UPI payouts.
- The minimum approved payout balance is ₹250. Payouts are processed on the 25th of each month; the database RPC rejects manual settlements on other dates.

## Release checklist

1. Review migrations `0021_restore_fixed_referral_program.sql`, `0022_idempotent_payment_entitlements.sql`, `0025_affiliate_applications_and_monthly_payouts.sql`, and `20261111050747_update_affiliate_pricing_terms.sql`.
2. Apply pending migrations to the intended Supabase environment during the coordinated app release. The new migration updates the payout RPC's accepted affiliate terms version; plan prices remain server-configured in the application.
3. Configure Razorpay checkout keys and webhook secret; ensure `payment.captured` webhook delivery is enabled.
4. Verify both current plans in Razorpay test mode, including captured and authorized-but-not-captured cases; separately verify historical order resolution without creating legacy orders.
5. Test referral signup through email confirmation and Google OAuth.
6. Test ₹25 and ₹50 commission creation, the 15-day review period and manual UPI payout. Reconcile refunds manually outside this application.
7. Deploy only after the production build and full test suite pass.

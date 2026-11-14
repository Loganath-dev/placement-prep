# StudyBench V11.7 — Payment, Security & Production Reliability

## Current pricing contract

- New purchases: ₹249 for 365 days only.
- No six-month or lifetime plan is offered to new buyers.
- Untagged historical ₹24900 orders resolve as annual (365 days), matching the live ledger. Lifetime access is resolved only when the explicit historical `premium_lifetime_249` key is present.
- Already-created ₹299 / 180-day and ₹499 / 365-day orders remain verifiable using their historical plan keys.
- Historical plan keys are deliberately excluded from `ACTIVE_PURCHASE_PLANS`, so the order-creation API cannot sell them again.
- The current annual plan retains the existing fixed ₹25 affiliate reward. Historical commissions retain their original reward amounts.

## Payment changes

- The payment verification route now treats affiliate commission persistence failures as retryable reconciliation failures rather than silently returning success.
- Payment verification checks the trusted Razorpay order ID and payment ID in addition to ownership, amount, currency and captured status.
- Order creation validates the Razorpay response and handles upstream network timeouts/failures.
- Webhook signatures are shape-checked, request bodies are bounded, and Razorpay order/payment API calls have explicit timeouts.
- Existing payment ledger uniqueness and payment-keyed entitlement RPC remain the idempotency boundary.

## Lifetime entitlement correction

Migration `0036_payment_reliability_and_plan_identity.sql` replaces `grant_premium_for_payment` so that a currently active `premium = true, premium_until = null` row remains lifetime after a finite renewal purchase. Finite entitlements continue stacking from the later of the current expiry or now. Historical lifetime order grants still set a null expiry.

## Affiliate reconciliation changes

- New commission rows persist the server-resolved `plan_key`.
- Account deletion now checks that financial foreign keys are nullable and `ON DELETE SET NULL` before deleting application/Auth data; it fails closed if the retention migrations are missing.
- Affiliate Terms version `affiliate-2026-11-10-v2` reflects the ₹249 annual plan and ₹25 reward. Existing affiliates see a reacceptance prompt; the payout RPC locks the affiliate account and refuses settlement until both current terms and privacy versions are accepted.
- The affiliate dashboard uses plan identity to label the current annual plan and historical plans correctly.
- Admin affiliate reconciliation now fails visibly if auto-approval or related financial/profile queries fail; it no longer silently renders incomplete results.
- Expired Premium states are excluded from the admin's active conversion count.

## Migration order

Apply `0036_payment_reliability_and_plan_identity.sql` after `0035_content_review_workflow.sql`, on staging first. It adds a nullable plan identity column and replaces the entitlement RPC. No migration is applied automatically.

## Explicit limitations

- No live Razorpay API call, webhook delivery or real payment was performed.
- The connected `PLACEMENT` project was inspected read-only; see `V11_7_LIVE_SUPABASE_AUDIT_2026-11-10.md` for actual catalog and advisor findings. The pending source migrations were not applied.
- No production backup or restore was performed.
- Load and browser accessibility scripts are test harnesses; they require the user's deployed URL and a configured test account.
- The project dependencies were unavailable in the extracted environment, so Vitest, ESLint, full TypeScript typecheck and production build still require execution in the user's normal development environment.

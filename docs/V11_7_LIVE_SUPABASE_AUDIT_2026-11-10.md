# V11.7 live Supabase audit — 10 November 2026

## Project inspected

- Supabase project: `PLACEMENT`
- Region: `ap-south-1`
- Database: PostgreSQL 17.6
- Project status at inspection: `ACTIVE_HEALTHY`
- Inspection method: Supabase project metadata, migration history, table catalog, policy catalog, function catalog, security/performance advisors, and read-only role-scoped SQL checks.
- No DDL, DML, migration, setting change, or deployment was performed.

## 1. Migration drift — release blocker

The live migration history currently ends at the recorded migration `remove_refund_state_from_entitlement_grant` (the repository's migration 0029 line). The V11.6 source ZIP includes migrations 0030 through 0035, but these are not recorded as applied in the connected project.

The live `content_questions` table also does not yet contain the V11.6 governance fields (`author_id`, `reviewer_id`, `reviewed_at`, `review_notes`, `version`, `quality_flags`, `content_kind`, `source_url`, `source_checked_at`, and publication audit fields) expected by the V11.6 admin workflow.

The current live `grant_premium_for_payment` function is also older than the V11.7 replacement. Its finite grant logic computes `now() + p_days` and retains the later of that value or the existing expiry; it does not add the new duration to an existing future expiry. This means early renewals do not stack as intended. The V11.7 migration replaces this behavior and preserves an active lifetime row (`premium = true`, `premium_until IS NULL`) when a finite plan is purchased.

**Do not deploy the V11.6/V11.7 app code against this database until migrations 0030–0036 have been reviewed and applied in order on staging.**

## 2. RLS status and role-scoped checks

- All inspected tables in the `public` and `storage` schemas had RLS enabled.
- The `creator_invite_codes` table has RLS enabled and no policies. This is a deny-by-default, service-role-only design; Supabase reports it as an INFO advisor finding, not as an exposed table.
- `content_questions` has an anon/authenticated SELECT policy limited to `status = 'live' AND tier = 'free'`. No client write policy was observed.
- `profiles`, `user_state`, `company_progress`, `daily_challenges`, `mistakes`, `coding_attempts`, `drive_outcomes`, `payments` and `question_reports` have owner-scoped policies.
- `affiliate_commissions` has no authenticated table-level SELECT privilege; the older own-row policy remains but is ineffective without the grant. The V11.7 migration removes this redundant policy.
- Affiliate account and payout data are served through server-side APIs; direct authenticated table SELECT privileges were not present for those tables in the inspected catalog.
- No views were found in the inspected `public` or `storage` schemas. The live `storage.buckets` table currently contains zero buckets, so no active object bucket policy was available to test.
- The inspected SECURITY DEFINER routines had fixed `search_path` settings and were not executable by anon/authenticated roles.

Read-only role simulation using an authenticated identity with a recorded payment returned exactly one visible profile, one visible payment and seven company_progress rows; explicit counts for rows owned by other users were zero. A second authenticated identity saw one own profile, one own user_state row and four own company_progress rows. A separate anon simulation returned zero visible rows for profiles, user_state, content_questions and analytics_events. These checks support the expected row-filtering behavior for the sampled tables; they are not a substitute for a complete two-account negative test across every table and Storage bucket.

## 3. Supabase Security Advisor findings

### Warnings

1. `function_search_path_mutable`: `public.set_updated_at` had no fixed search path. V11.7 migration 0036 replaces it with `SET search_path = pg_catalog`.
2. `auth_leaked_password_protection`: leaked-password protection is disabled. This requires a project Auth setting change in the Supabase Dashboard; it is not enabled by SQL in this release.

### Informational

- `rls_enabled_no_policy`: `public.creator_invite_codes` has RLS enabled with no policies. This is expected if all access is through service-role code.

## 4. Supabase Performance Advisor findings

1. Five foreign keys lacked covering indexes:
   - `affiliate_commissions.buyer_id`
   - `affiliate_payouts.paid_by`
   - `content_questions.created_by`
   - `creator_invite_codes.redeemed_by`
   - `question_reports.user_id`

   V11.7 migration 0036 adds indexes for these columns.

2. Eighteen policies called `auth.uid()` in a way that can be re-evaluated per row. Migration 0036 rewrites the ownership predicates to `(select auth.uid())`, preserving the same owner checks and reducing repeated evaluation.

3. Nine indexes were reported unused at the time of the advisor scan. They were not dropped. An unused-index warning is not enough evidence to remove an index, especially with a relatively small dataset and short observation window.

## 5. Additional live observations

- `public.user_state.premium_until` is currently a text column; the existing function relies on timestamp coercion. The V11.7 replacement retains the compatible column contract and writes an ISO-compatible timestamp value.
- **Critical payout-destination risk:** authenticated users currently have column-level UPDATE privilege on `profiles.upi_id` and `profiles.upi_name`; the owner `profiles` policy permits updates to their own row. The live `admin_pay_affiliate_commission` SECURITY DEFINER function reads the payout UPI from `profiles` and does not lock a separately consented payout-account row. An affiliate can therefore change the destination without the reviewed affiliate-account flow. The repository's migration `0030_lock_affiliate_payout_destination.sql` fixes this by reading/locking `affiliate_accounts` and revoking authenticated updates to the legacy profile UPI columns. **Do not process affiliate payouts until migration 0030 and the subsequent migrations are reconciled and applied on staging/production.**
- **Critical financial-retention risk:** the live `affiliate_commissions.referrer_id`, `affiliate_commissions.buyer_id` and `affiliate_payouts.user_id` columns are still `NOT NULL` with `ON DELETE CASCADE` foreign keys to `auth.users`. The account-delete API erases application rows and then deletes the Auth identity, so erasing an affiliate/buyer currently cascades away commission and payout audit rows. The repository's migration `0031_preserve_affiliate_financial_records.sql` changes these references to nullable `ON DELETE SET NULL` so financial snapshots survive while personal identities are erased. V11.7 also adds `assert_financial_erasure_schema_ready()` and calls it before account deletion, so the API fails closed if the required nullable columns and `SET NULL` constraints are not present. **Do not enable account deletion for affiliate users until migrations 0031 and 0036 are applied and verified.**
- The live affiliate programme currently has zero affiliate accounts, zero referred profiles, zero commission rows and zero payout rows. There is no outstanding commission or payout balance to reconcile at this inspection point.
- The live payout ledger had no duplicate non-empty UPI transaction references. Migration 0036 adds a case-insensitive unique index so a transaction reference cannot settle two payout rows.
- The live `set_updated_at` function was the only mutable-search-path warning returned by the Security Advisor scan. The separate profile timestamp trigger and entitlement/referral protection triggers had fixed search paths.
- Authenticated roles also have column UPDATE grants on `profiles.referred_by`, `user_state.premium` and `user_state.premium_until`; live triggers protect referral attribution and entitlement columns. These trigger protections were confirmed present in the trigger catalog, but their negative write behavior still needs an explicit two-account staging test.
- No refund-processing function is present in the current source path; the application refund flow was intentionally removed by the migration history. Refunds must be reconciled through the merchant/provider process and accounting records until a new approved refund design exists.

## 6. Required manual setting

Enable leaked-password protection in the Supabase Dashboard under Authentication password security settings. Supabase guidance: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## 7. What remains unverified

- No migration was applied to staging or production.
- No database backup was created and no restore rehearsal was performed.
- No Razorpay test payment or signed webhook delivery was triggered.
- No browser session or multi-device progress conflict test was performed. The client sync code upserts whole `user_state` and `company_progress` snapshots; concurrent updates from two devices may be last-writer-wins. A two-device conflict/merge test is a release gate before scaling.
- No authenticated cross-account write attempt was made; live RLS checks were read-only.
- No Storage bucket/object policy upload/download test was run.
- No load test was run against a deployed app.

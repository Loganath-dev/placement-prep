# StudyBench remediation report — 10 November 2026

## Fixes implemented in this source package

### Account deletion
- Added `erase_user_data(uuid)` as a service-role-only, transactional database function.
- The API now stops and returns a server error if the cleanup transaction fails.
- The browser store checks the API status and `{ ok: true }` before clearing local state or signing out. A failed delete no longer appears successful.
- Financial payment ledger rows remain for accounting and their user FK is nulled by `ON DELETE SET NULL`. Question reports are removed by their existing `ON DELETE CASCADE` relationship when the Auth identity is deleted.

### Payment lifecycle
- Premium purchases are the ₹249 / 365-day plan only. Untagged historical ₹24900 orders resolve as annual (365 days), consistent with the live payment ledger; explicit legacy lifetime keys remain lifetime-only.
- Webhook plan and owner resolution now use the server-fetched Razorpay order as the source of truth. A `payment.captured` event no longer needs order notes duplicated into the payment entity; any owner ID included in the event is treated only as a consistency check.
- The app does not implement refund webhooks or refund-state entitlement logic. The public Terms explain purchase finality while preserving non-waivable consumer rights and remedies for duplicate or failed transactions.
- The payment grant RPC records each payment's duration and stacks early renewals from the later of the current expiry or the current time.

### Affiliate data minimisation
- Payout destinations are read from the consented `affiliate_accounts` record; authenticated users cannot edit payout fields directly. Affiliate application is rate-limited and uses insert-only creation so concurrent submissions cannot overwrite an existing payout destination.
- Migration `0031_preserve_affiliate_financial_records.sql` changes affiliate commission and payout account foreign keys to `ON DELETE SET NULL`, retaining financial history while allowing account erasure.
- Revoked direct `SELECT` on `affiliate_commissions` from `anon` and `authenticated`; RLS alone was not sufficient to hide sensitive columns.
- Reworked the authenticated affiliate dashboard API to return aggregate referral/conversion counts and commission plan labels/reward amounts only. It no longer returns student names, student IDs, Premium expiry/status, exact purchase amounts, buyer IDs, or payment IDs.
- Service-role admin payout operations retain their required access.

### SQL/DBMS practice quality
- SQL chapters no longer use the generic CS-core drill generator.
- SQL/DBMS chapters use a small, distinct authored practice set. The code no longer claims or manufactures a 12+ question authored bank by permuting scenario nouns.
- SQL lesson practice now consumes that SQL bank instead of injecting unrelated OS/networking questions.
- Placement-enrichment questions from unrelated sources are excluded from the SQL chapter quiz.

### Account deletion
- Application data is erased transactionally before the Auth identity is deleted. A cleanup or identity-deletion failure is reported as a failure rather than returning a success response with cleanup pending.

### Release and API hardening
- Admin/creator access uses trusted Auth `app_metadata` or server-only allowlists; user-editable metadata is ignored. Admin actions require a verified email and AAL2 MFA.
- Vercel is the selected deployment target. The active build and CI use `next build`; Cloudflare/OpenNext runtime configuration was removed to avoid split deployment behavior.
- CI includes lint, the client/server content-boundary check, typecheck, tests and a production build.
- CSP now allows the Google Tag Manager / Google Analytics and Vercel Analytics origins already used by the root layout.
- The entitlement-filtered questions API returns `Cache-Control: private, no-store, max-age=0`.
- Settings narrows the company selector to real company tracks; the general/core track is not passed to company-only controls.
- Chapter route not-found branches return explicitly, and result arrays are explicitly typed.

## Validation performed

- TypeScript `transpileModule` syntax validation passed for the modified TypeScript/TSX files.
- Added regression coverage for payment-captured webhook events without duplicated payment notes, trusted-order ownership checks, retryable activation failures, insert-only affiliate applications, and account-erasure sequencing. The suite itself remains unexecuted in this environment.
- Added distinct SQL practice items, deterministic answer-position rotation and topic-based difficulty labels. The SQL bank is deliberately bounded by the authored content available; it is not padded to a marketing count.
- The archive has no `node_modules` and registry access is unavailable in this execution environment. Vitest, ESLint, full typecheck and production build therefore remain unverified here. Do not interpret syntax transpilation as a substitute for those checks.

## Remaining release checks — do not skip

- Confirm the client/server curriculum boundary using `pnpm check:boundaries`; inspect the emitted client chunks after a production build to ensure lesson bodies and answer keys are absent.
- Run the full test/lint/typecheck/build suite in CI and review the Vercel deployment result.
- Exercise payment renewal stacking, duplicate webhook delivery, failed activation retries and account deletion in a staging environment.
- Confirm the role allowlists/app_metadata assignments and payout destination controls in the real Supabase project before launch.

## Deployment sequence

1. Review the diff and apply only the migrations required by this ZIP to a staging Supabase project; do not replay migrations that are already applied remotely.
2. Verify account deletion, payment activation/renewal, affiliate column access, payout destination integrity, and SQL practice against staging.
3. Run `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` in the project environment.
4. Inspect production client bundles and complete a manual entitlement test before enabling paid content in production.

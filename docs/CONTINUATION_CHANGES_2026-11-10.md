# StudyBench continuation changes — 10 November 2026

This pass continues from `studybench-security-payment-remediation-draft-2026-11-10.zip`.

## Changes made

1. **Razorpay webhook identity and plan resolution**
   - Removed the dependency on order notes being duplicated inside the payment webhook entity.
   - The webhook now fetches the order from Razorpay and resolves both the plan and account owner from that trusted response.
   - If the webhook event also contains an owner ID, it must agree with the trusted order owner.
   - Added regression tests for payment-captured payloads without notes, mismatched event identity, six-month plan resolution, and retryable activation failures.

2. **Account erasure ordering**
   - The API now runs the transactional `erase_user_data` function before deleting the Auth identity.
   - It stops if data erasure fails and reports incomplete closure if the Auth deletion then fails.
   - Added tests for ordering and both failure paths.

3. **Affiliate payout destination race**
   - Affiliate application creation now uses insert-only semantics rather than upsert.
   - A concurrent duplicate application returns HTTP 409 and cannot replace an existing UPI destination.
   - Added tests for normal application, duplicate insert, existing account and unverified email.

## Checks completed in this environment

- ZIP extracted successfully.
- `node scripts/check-client-content-boundary.mjs`: passed.
- TypeScript syntax transpilation for all five changed TypeScript files: passed.
- `node --check` for the relevant `.mjs` scripts: passed.
- `package.json` JSON parse: passed.

## Checks not completed

- Vitest, ESLint, full `tsc --noEmit`, and `next build` could not run because dependencies are not present and Corepack could not reach `registry.npmjs.org` to fetch pnpm.
- No Supabase migration was applied or tested against a database.
- No Razorpay test-mode transaction, browser E2E, screen-reader test, or deployment was performed.

This ZIP is a local development candidate, not a production-release approval.

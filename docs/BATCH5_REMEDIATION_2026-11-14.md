# StudyBench — Batch 5 remediation and outstanding issues

Date: 14 November 2026  
Scope: Resolve a confirmed least-privilege defect from the live Supabase security review; consolidate remaining release blockers.  
Mode: Source-tree change plus read-only production inspection. No live migration or deployment was performed.

## 1. Confirmed issue and remediation

The live Supabase privilege check showed that `anon`, `authenticated`, and `service_role` all had table-level SELECT/INSERT/UPDATE privileges on `public.creator_invite_codes`. RLS was enabled and there were no policies, so the client roles were currently blocked by RLS. However, these broad grants were unnecessary and created avoidable exposure if a policy were accidentally introduced later.

The source confirms the only application path is `POST /api/creator/redeem`, which hashes the submitted code and calls `redeem_creator_code` through the server-side service-role client. The SQL function is `SECURITY DEFINER`, and its execute permission is intended to be service-role-only. The app does not directly query or mutate `creator_invite_codes`.

Added migration:

`supabase/migrations/20261114041000_revoke_creator_invite_table_access.sql`

It revokes all direct table privileges from `PUBLIC`, `anon`, `authenticated`, and `service_role`, while retaining the service-role-only execute grant on `redeem_creator_code`. The function's owner context continues to perform the atomic code claim. The migration is transactional and does not alter invite rows or creator entitlements.

**Important:** this migration is added to the ZIP only. It has NOT been applied to the live Supabase project. Apply it only after reviewing the migration against the current production schema and taking/confirming a recoverable backup.

## 2. Other advisor findings

- `affiliate_commissions`: no RLS policies; service-role-only table grants are present. This is consistent with the current server-only API design and is not changed here.
- `content_question_reviews`: no RLS policies; used by service-role-only admin review/publish RPCs and server admin routes. No client policy is added.
- Supabase Auth leaked-password protection remains disabled. This is an Auth dashboard configuration item; the available database migration path does not safely change this setting. Enable it in Supabase Auth password/security settings and test signup/password reset UX.
- The five FK index advisor notices were handled in the subsequent follow-up, not in the original Batch 5 pass. The follow-up adds `20261114042000_index_review_and_content_foreign_keys.sql` with five `CREATE INDEX IF NOT EXISTS` statements after a read-only check found no existing index containing those FK columns. That migration remains unapplied in production.
- Ten unused-index notices remain. No index was dropped; advisor usage counters alone do not establish that an index is safe to remove.

## 3. Still blocked from earlier batches

1. Exact source/provenance for live migration `20261114035209_fix_company_progress_snapshot_insert_grants` is not recovered in the supplied ZIP. Effective grants were inspected, but the original SQL was not reconstructed.
2. Backup/PITR status cannot be inspected with the available Supabase project/database tools. A dashboard backup/PITR screenshot or supported backup metadata access is required.
3. Package installation is unavailable in this environment (`pnpm` absent; earlier pinned pnpm bootstrap failed on npm registry DNS `EAI_AGAIN`). Full Vitest, TypeScript, ESLint, and Next.js build remain unverified.
4. No browser E2E, Lighthouse, controlled Redis/Supabase fault injection, or load test was performed. The 1,500-concurrent-user target remains unverified.
5. Production smoke tests and deployment remain gated on the full build/test suite.

## 4. Validation

- Live production privilege state was queried read-only immediately before authoring this migration.
- Source usage was searched: application code calls the redemption RPC and does not directly access `creator_invite_codes`.
- Migration is additive and contains only GRANT/REVOKE statements; no data mutation.
- No production SQL was executed for this remediation.

## Verdict

Batch 5 adds a narrowly scoped least-privilege remediation for creator invite inventory. The production database remains unchanged. The broader release gate remains **BLOCKED** by missing migration provenance, unverified backups, and unavailable executable build/test dependencies.

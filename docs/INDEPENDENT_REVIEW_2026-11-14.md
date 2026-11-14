# StudyBench — independent re-review of production-readiness remediation

Date: 14 November 2026
Scope: Re-opened the latest follow-up ZIP, checked the newly added SQL and scripts, executed all available dependency-free repository checks, and re-queried the live Supabase privilege/function state. This is not a complete end-to-end audit of every workflow in the master prompt.

## Executive result

**NOT PRODUCTION READY.** The creator-invite grant revocation and five FK indexes were applied and verified in production in the subsequent remediation session (migration versions `20261114041639` and `20261114041641`). Leaked-password protection remains disabled, backup/PITR and restore rehearsal remain unverified, exact provenance for migration `20261114035209` remains unresolved, and runtime/build plus browser, integration and load verification remain outstanding.

## Repository checks actually executed

Executed with Node.js v22.16.0 from the extracted ZIP:

- `node scripts/check-client-content-boundary.mjs` — PASS; 59 client entry points scanned transitively.
- `node scripts/check-release-dependencies.mjs` — PASS; manifest/lockfile version gate only, not a package install or vulnerability audit.
- `node scripts/check-next-app-directory.mjs` — PASS.
- `node scripts/check-learning-progress-security.mjs` — PASS; 26 source-pattern assertions.
- `node scripts/check-batch5-security-migrations.mjs` — PASS; 6 source-pattern assertions.

`node_modules` is absent. No Vitest, ESLint, `tsc --noEmit`, Next.js production build, browser E2E or load test was run in this re-review. Pattern-based scripts are useful regression guards but do not prove runtime behavior or full SQL correctness.

## Live Supabase read-only verification

Project `rvekcdsczorpxwqdwpbp` is `ACTIVE_HEALTHY`.

For `public.redeem_creator_code(uuid,text)` the live catalog reports:
- owner: `postgres`;
- `SECURITY DEFINER`;
- pinned search path: `pg_catalog, public`;
- EXECUTE: `service_role` true, `anon` false, `authenticated` false.

The function body uses schema-qualified table references. The creator redemption route derives `p_user_id` from `auth.getUser()` and calls the RPC with the SHA-256 hash of a validated code. It does not accept a client-supplied user ID.

This section records the pre-remediation observation only. The later applied migration `20261114041639_revoke_creator_invite_table_access` revoked all direct table privileges. Post-apply checks confirmed direct SELECT/INSERT false for anon, authenticated, and service_role; RPC EXECUTE remains service_role-only.

## Prepared source migrations

1. `20261114041000_revoke_creator_invite_table_access.sql`
   - Revokes direct table privileges from `PUBLIC`, `anon`, `authenticated`, and `service_role`.
   - Reasserts service-role-only EXECUTE on the redemption RPC.
   - Contains no row deletion/update/truncate.
   - Requires staging validation and post-apply route verification.

2. `20261114042000_index_review_and_content_foreign_keys.sql`
   - Adds five `IF NOT EXISTS` indexes for the five advisor-identified FK columns.
   - No existing indexes are dropped.
   - Live advisor had reported these FK columns unindexed; a catalog query found no valid index containing those columns at the time of inspection.
   - The three affected tables had zero rows at inspection time. This is a point-in-time observation, not a guarantee of future workload or query benefit.

Both migrations were subsequently applied to production and verified. See `FINAL_BLOCKER_STATUS_2026-11-14.md`.

## Documentation consistency correction

The original Batch 5 report said no FK indexes were added and that the five notices remained. The follow-up later added a separate index migration. The Batch 5 report was corrected to make that chronology explicit.

## Remaining blockers

1. Recover exact source/provenance for live migration `20261114035209_fix_company_progress_snapshot_insert_grants`; do not reconstruct historical SQL from current grants.
2. Enable Supabase Auth leaked-password protection in the Dashboard and verify the security advisor clears.
3. Verify backup/PITR retention and complete an isolated restore rehearsal; no production restore.
4. Restore package installation in a network-enabled environment, then run frozen install, `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm build`.
5. Complete payment/reward/admin integration tests, including replay/concurrency and transient DB failures.
6. Complete browser/mobile/tablet accessibility and visual checks.
7. Run controlled fault injection and approved load testing before claiming capacity for 1,500 concurrent users.
8. Verify deployment configuration and production smoke tests only after the full build/test gate passes.

## Change record

- Corrected `docs/BATCH5_REMEDIATION_2026-11-14.md` to reflect the later index migration.
- Added this independent re-review report.
- No application runtime source code changed.
- Applied production migrations `20261114041639` and `20261114041641`; no application deployment was performed.

# StudyBench — follow-up issue remediation

Date: 14 November 2026  
Scope: Follow up the Batch 5 Supabase advisor findings and verify the creator-invite least-privilege remediation.  
Mode: Source-tree changes plus read-only production inspection. No production migration or data change was performed.

## 1. Creator invite RPC verification

Read-only production inspection confirmed:

- `public.redeem_creator_code(uuid,text)` is owned by `postgres`.
- It is `SECURITY DEFINER` and pins `search_path` to `pg_catalog, public`.
- `service_role` has EXECUTE; `anon` and `authenticated` do not.
- The application calls the RPC from the server-side creator redemption route; it does not directly access the invite inventory table.

This supports the intended privilege design in `20261114041000_revoke_creator_invite_table_access.sql`: revoke direct table grants from all API roles while retaining the server-only RPC grant. The migration remains unapplied in production.

## 2. Foreign-key index findings

The live advisor had reported five unindexed foreign-key columns. A read-only check confirmed no valid index with any of these columns as a leading key:

- `affiliate_commissions.reviewed_by`
- `content_question_reviews.reviewer_id`
- `content_questions.author_id`
- `content_questions.published_by`
- `content_questions.reviewer_id`

The three affected tables each had zero rows at inspection time. Added source migration:

`supabase/migrations/20261114042000_index_review_and_content_foreign_keys.sql`

It creates five narrow indexes using `IF NOT EXISTS`. This is a source-only remediation; advisor status will not change until the migration is reviewed and applied. No existing index was removed.

## 3. Added local regression guard

Added `scripts/check-batch5-security-migrations.mjs` and package script `check:batch5-security-migrations` to assert that:

- client roles are revoked from direct creator invite table access;
- only service role can execute the redemption RPC;
- invite rows are not modified by the grant migration;
- all five advisor-identified foreign-key indexes are present in the migration source.

Result: 6/6 checks passed.

## 4. Validation performed

- `npm run check:batch5-security-migrations` — passed (6/6).
- `npm run check:boundaries` — passed (59 client entry points scanned transitively).
- `npm run check:release-deps` — passed.
- `npm run check:app-directory` — passed.
- `npm run check:learning-security` — passed (26/26).
- `corepack pnpm --version` — blocked because registry DNS lookup failed (`EAI_AGAIN registry.npmjs.org`).
- `node_modules` is absent; full Vitest, TypeScript, ESLint and Next.js production build remain unrun.

## 5. Still unresolved / release blockers

1. Enable Supabase Auth leaked-password protection in Auth security settings and verify signup/password-reset UX. The available database migration path does not configure this Auth setting.
2. Recover the exact original source for live migration `20261114035209_fix_company_progress_snapshot_insert_grants`; do not reconstruct historical SQL from effective grants.
3. Verify backup/PITR availability and complete a restore rehearsal using the supported Supabase dashboard/operator path.
4. Install pinned dependencies in a network-enabled environment and run Vitest, TypeScript, ESLint and production build.
5. Complete browser/device, accessibility, fault-injection and controlled load tests. The 1,500-concurrent-user target remains unverified.
6. Review and apply the two prepared migrations only after backup/recovery confirmation and staging validation.

## Verdict

This follow-up closes the source-level index findings and independently verifies the creator invite RPC's privilege model. Production remains unchanged. Release readiness remains **BLOCKED** until the remaining operational and test gates are evidenced.

# StudyBench — production blocker remediation

Date: 14 November 2026
Supabase project: `PLACEMENT` (`rvekcdsczorpxwqdwpbp`, `ap-south-1`)

## Result

The creator-invite privilege revocation and five FK indexes have been applied and verified in the live database. Three account/operational items remain unresolved: exact historical SQL provenance, hosted Auth leaked-password configuration, and backup/PITR plus isolated restore evidence. See `FINAL_BLOCKER_STATUS_2026-11-14.md` for the current verified state and closure runbook.

## Completed in production

### 1. Creator invite least-privilege grants

Applied migration `20261114041639_revoke_creator_invite_table_access` (source: `supabase/migrations/20261114041000_revoke_creator_invite_table_access.sql`).

Post-apply catalog checks returned:

- `creator_invite_codes`: anon SELECT/INSERT false; authenticated SELECT/INSERT false; service_role SELECT/INSERT false.
- `redeem_creator_code(uuid,text)`: anon EXECUTE false; authenticated EXECUTE false; service_role EXECUTE true.

This preserves the service-role-only redemption RPC design. The function's ownership, SECURITY DEFINER setting, pinned search path, and schema-qualified body were checked in the preceding review. No invite rows were deleted or updated by this migration.

### 2. Five missing foreign-key indexes

Applied migration `20261114041641_index_review_and_content_foreign_keys` (source: `supabase/migrations/20261114042000_index_review_and_content_foreign_keys.sql`).

Post-apply `pg_indexes` verification confirmed all five indexes exist:

- `idx_affiliate_commissions_reviewed_by`
- `idx_content_question_reviews_reviewer_id`
- `idx_content_questions_author_id`
- `idx_content_questions_published_by`
- `idx_content_questions_reviewer_id`

The performance advisor currently labels these newly created indexes unused. That is expected immediately after creation and is not a reason to drop them. Reassess usage after representative production traffic and query-plan observation; do not drop them based on the initial counter alone.

## Still unresolved — requires owner/dashboard action or canonical source

### 3. Exact provenance for `20261114035209`

The live migration history contains `20261114035209 / fix_company_progress_snapshot_insert_grants`, but the exact SQL source was not recovered from the supplied ZIP or current working tree. Effective grants were previously inspected and found consistent with the intended owner-scoped design, but effective state is not proof of the original migration text. Do not fabricate a replacement historical migration. Recover it from the original authoring environment, CI artifact, or canonical Git commit, then archive it under `supabase/migrations/` with a provenance note. Until then, provenance remains unresolved.

### 4. Supabase Auth leaked-password protection

The live Supabase security advisor still reports `auth_leaked_password_protection` as WARN / disabled. The connected toolset does not expose the Auth password-security configuration toggle, so it was not possible to enable it from this session.

Owner action:
1. Open Supabase Dashboard → Authentication → Settings (password/security section; labels can vary by dashboard revision).
2. Enable leaked password protection / Have I Been Pwned password checks.
3. Save the setting.
4. Re-run the Supabase Security Advisor and confirm `auth_leaked_password_protection` is absent or resolved.
5. In a staging project, verify signup and password reset reject known-compromised passwords while accepting strong unique passwords. Do not test by creating a known-compromised production account.

Reference: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

### 5. Backup/PITR and restore rehearsal

Backup/PITR availability, retention, and restore readiness remain unverified. The available project metadata endpoint does not return backup inventory or PITR configuration. No restore operation was attempted; a restore can replace or roll back project data and must not be used as a status probe.

Owner action:
1. In Supabase Dashboard → Project Settings / Database → Backups (dashboard labels may vary), record the plan, automated backup frequency, retention period, and PITR availability/retention.
2. Capture a timestamped backup status screenshot/export for the release record.
3. Perform a restore rehearsal into a separate isolated project, never over production.
4. Verify schema, migration history, auth users, payment records, entitlements, learning progress, XP/rewards, and critical RPCs in the restored project.
5. Record RPO/RTO and the restore completion time. A backup listing alone is not a restore rehearsal.

No backup status or restore success is claimed in this package.

## Current advisor snapshot

- Security advisor: three INFO `rls_enabled_no_policy` findings remain on server-only tables (`affiliate_commissions`, `content_question_reviews`, `creator_invite_codes`); these are deny-by-default and intentional for the current server-only design. The leaked-password protection WARN remains until the dashboard toggle is enabled.
- Performance advisor: the five just-created indexes are currently reported unused. Reassess after real workload; do not remove them without query-plan and FK-delete/update analysis.

## Safety / change record

- Applied only the two additive/permission-tightening migrations named above.
- No table rows were deleted or rewritten by these two migrations.
- No restore, deployment, or application runtime source change was performed.
- No full build, Vitest, typecheck, browser E2E, or load test is claimed by this remediation.

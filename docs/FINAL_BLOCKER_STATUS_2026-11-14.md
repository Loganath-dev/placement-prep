# StudyBench — final blocker status and closure runbook

Date: 14 November 2026  
Project: `PLACEMENT` (`rvekcdsczorpxwqdwpbp`, `ap-south-1`)  
Status: **PARTIALLY REMEDIATED — NOT YET PRODUCTION-READY**

## 1. Live database work completed in this session

The following migrations were applied successfully through the Supabase migration interface:

- `20261114041639_revoke_creator_invite_table_access`
- `20261114041641_index_review_and_content_foreign_keys`

Post-apply checks:

- `creator_invite_codes`: direct table SELECT/INSERT privileges are false for `anon`, `authenticated`, and `service_role`.
- `redeem_creator_code(uuid,text)`: EXECUTE is false for `anon` and `authenticated`, true for `service_role`.
- All five FK indexes exist in `pg_indexes`:
  - `idx_affiliate_commissions_reviewed_by`
  - `idx_content_question_reviews_reviewer_id`
  - `idx_content_questions_author_id`
  - `idx_content_questions_published_by`
  - `idx_content_questions_reviewer_id`

The performance advisor currently calls the new indexes unused. They were just created; do not drop them solely because the initial usage counters are zero. Reassess after representative traffic and query-plan review.

## 2. Historical migration provenance: not recoverable from current artifacts

Live migration history contains:

- Version: `20261114035209`
- Name: `fix_company_progress_snapshot_insert_grants`

The exact SQL source is absent from every supplied project ZIP and the current extracted project tree. The GitHub repository lookup available to this session did not return a matching source file. The live migration history stores the version/name record, not the original SQL body. Current effective grants are not proof of the exact SQL that was executed.

**Do not create a fabricated historical file under this version.** To close provenance, retrieve the original SQL from one of:

1. the machine/worktree that applied the migration;
2. the CI/CD job artifact or deployment log that applied it;
3. the exact Git commit or branch containing the migration;
4. a secure operator-maintained migration archive.

Then compare the SQL against the live grants and policies, preserve the original bytes, record its SHA-256, and add it to source control. If the original cannot be recovered, document it as a permanent historical provenance gap and create a *new forward-only reconciliation migration* only if a schema change is actually needed. Never rewrite the historical migration record to pretend the source was recovered.

## 3. Leaked-password protection: owner action in Supabase Auth

The live Supabase Security Advisor reported `auth_leaked_password_protection` as WARN / disabled during the latest check. The connected Supabase tools available in this session do not expose the hosted Auth password-security configuration endpoint, so this setting could not be changed programmatically here.

Use the project owner/admin account:

1. Open the [PLACEMENT Supabase Dashboard](https://supabase.com/dashboard/project/rvekcdsczorpxwqdwpbp).
2. Open **Authentication → Sign In / Providers → Email** (the dashboard may also expose this under password/attack-protection settings).
3. Enable **Prevent use of leaked passwords** / leaked-password protection (Have I Been Pwned password checks).
4. Save.
5. Re-run **Security Advisor** and confirm `auth_leaked_password_protection` is no longer WARN.
6. Test the behavior in a staging project with a known-compromised test password; do not create or alter a production user's password for this test.

Supabase documents this feature as available on Pro plan and above. If the toggle is disabled or unavailable, verify the project's plan and that the operator has sufficient project permissions before proceeding. Do not weaken password policy to hide the warning.

Official reference: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## 4. Backups/PITR: inventory must be read from the project dashboard

The project metadata and connected Supabase tools available here do not expose backup inventory, retention, or PITR recovery-point data. Therefore no claim is made that daily backups or PITR are enabled. A database restore was not attempted.

Owner action:

1. Open the [PLACEMENT Supabase Dashboard](https://supabase.com/dashboard/project/rvekcdsczorpxwqdwpbp).
2. Navigate to **Database → Backups** and record whether daily backups are available, the latest successful backup timestamp, and the retention window.
3. Open **Point in Time** / PITR settings and record whether PITR is enabled, the configured retention period, and the earliest/latest available recovery points.
4. Decide on PITR only after reviewing its recurring add-on cost. Supabase bills PITR by the hour; pricing depends on retention. Do not enable it without confirming the organization's billing approval.
5. For a restore rehearsal, use **Restore to a New Project** from a selected backup/recovery point. Do not restore over the live production project.
6. Once the isolated clone is ready, verify schema, migration history, RLS/grants, Auth users, payments, entitlements, learning progress, XP/rewards, storage object availability, and critical RPCs. Record restore duration (RTO) and the newest recoverable point (RPO).
7. Delete the isolated rehearsal project only after the owner has verified it and confirmed it is no longer needed; project creation may incur charges.

Supabase notes that database backups do not include the underlying Storage API objects, only their metadata. A database-only restore is not proof that uploaded files can be recovered. PITR restores replace database state; never use the production project as the rehearsal target.

Official references:
- https://supabase.com/docs/guides/platform/backups
- https://supabase.com/docs/guides/platform/clone-project
- https://supabase.com/docs/guides/platform/manage-your-usage/point-in-time-recovery

## 5. What this session did not do

- Did not invent or backfill the missing historical SQL for `20261114035209`.
- Did not change hosted Auth configuration; the required setting is not exposed by the available connected tools.
- Did not enable PITR or incur add-on charges.
- Did not restore, clone, or pause the production project.
- Did not deploy the application.
- Did not run full application build, unit/integration/E2E, browser accessibility, or load tests.

## Release decision

Do not label the application production-ready until the historical migration source is recovered or formally accepted as a provenance gap, the Auth advisor warning is cleared, backup/PITR status is evidenced, an isolated restore rehearsal passes, and the remaining application verification gates are complete.

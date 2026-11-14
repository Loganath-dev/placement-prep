# StudyBench — Batch 2 database and migration reconciliation

Date: 14 November 2026
Target: Supabase project `PLACEMENT` (`rvekcdsczorpxwqdwpbp`)
Mode: Read-only production inspection. No database writes or migrations were executed.

## Executive result

- Supabase project is `ACTIVE_HEALTHY`, PostgreSQL 17.6.1, region `ap-south-1`.
- The four learning-progress/reward migrations are represented in live history, but three are recorded under different live version identifiers than the repository filenames.
- One live migration-history entry is not present as a matching SQL file in this ZIP:
  - `20261114035209` — `fix_company_progress_snapshot_insert_grants`
- The `20261112171126_affiliate_service_role_access.sql` file is present in this ZIP and matches the live migration name; the earlier inventory omission is corrected in this revision.
- The observed effective permissions and schema objects were inspected. The exact original SQL for the remaining live-only entry was not recoverable from the migration-history listing, so this report does not fabricate its source file or recommend reapplying it.
- Production backup/PITR status could not be independently read through the connected Supabase project-inspection tools. Backup verification remains a blocker before any further production DDL/data changes.

## 1. Learning migration mapping

| Repository migration file | Live migration history | Assessment |
|---|---|---|
| `20261113144800_server_authoritative_learning_progress.sql` | `20261114033100` — `server_authoritative_learning_progress` | Matching name/effect |
| `20261113144900_lock_legacy_progress_writes.sql` | `20261114034056` — `lock_legacy_progress_writes` | Matching name/effect |
| `20261113150500_learning_rewards_and_legacy_history.sql` | `20261114033555` — `20261113150500_learning_rewards_and_legacy_history` | Matching name/effect |
| `20261114100000_verified_challenge_and_mock_rewards.sql` | `20261114033659` — `verified_challenge_and_mock_rewards` | Matching name/effect |

These changes are recorded as applied in the live migration history. Do not reapply them solely to make their version strings match the repository filenames.

## 2. Live-only migration entries

### `20261112171126_affiliate_service_role_access` — source file recovered

The ZIP contains `supabase/migrations/20261112171126_affiliate_service_role_access.sql`. Its SQL grants `service_role` the intended access to `affiliate_accounts`, `affiliate_commissions`, `affiliate_payouts`, and `affiliate_settings`; it does not grant direct table access to `anon` or `authenticated`. The file is consistent with the live migration-history name.

Current observed state:
- `affiliate_commissions` has service-role SELECT/INSERT/UPDATE grants and no direct authenticated/anon table grants in the inspected privilege listing.
- `affiliate_accounts` has service-role SELECT/INSERT/UPDATE grants; an owner-only authenticated SELECT RLS policy exists.
- `affiliate_payouts` has service-role SELECT grant; an owner-only authenticated SELECT RLS policy exists.
- The exact SQL body and full historical intent were not available from migration history alone.

Action: retain this migration file in source control; no reapplication is needed.

### `20261114035209_fix_company_progress_snapshot_insert_grants`

Current observed `company_progress` privileges:
- Authenticated SELECT is allowed.
- Authenticated INSERT is column-scoped to `user_id`, `company_id`, and `mock_scores`.
- Authenticated UPDATE is column-scoped to `mock_scores`.
- Authenticated INSERT/UPDATE of `chapters` is denied.
- Authenticated UPDATE of key columns and `updated_at` is denied.
- Anonymous INSERT is denied.
- RLS owner policy restricts rows to `auth.uid() = user_id`.

This effective state is consistent with the staged legacy-write lockdown. The exact original SQL body is not available from migration history alone. Recover the authoritative SQL before creating a canonical source migration.

## 3. Schema and security checks

Observed:
- `company_progress_legacy_archive` exists and has RLS enabled.
- `learning_progress_events` exists and has RLS enabled.
- `learning_reward_ledger` exists and has RLS enabled.
- `learning_badge_awards` exists and has RLS enabled.
- `user_gamification_legacy_archive` exists and has RLS enabled.
- `learning_progress_events` event-type constraint includes lesson, recall, chapter assessment, daily challenge, weekly challenge and mock-test event types.
- `user_state` has triggers protecting XP/badges, entitlement fields, onboarded status and updated timestamps.
- Owner-read policies exist for learning events, reward ledger, badge awards and both legacy archives.
- `company_progress` has an owner-scoped authenticated RLS policy.

## 4. Data preservation comparison

Read-only full joins compared the archived values with their source tables:

| Comparison | Source rows | Archive rows | Mismatches |
|---|---:|---:|---:|
| `company_progress` vs `company_progress_legacy_archive` | 436 | 436 | 0 |
| `user_state.xp/badges` vs `user_gamification_legacy_archive` | 137 | 137 | 0 |

The comparisons included user keys and the preserved JSON/value fields. This is positive evidence that these two archives match their source rows at the time of inspection. It is not a substitute for a restorable database backup.

## 5. Backup verification

Status: **NOT VERIFIED**

The connected project metadata did not expose a backup inventory, latest backup timestamp, PITR status, retention window or restore-test status. No backup was created and no restore was attempted.

Before any further production database changes:
1. Open Supabase Dashboard → project → Database → Backups.
2. Confirm the latest successful backup timestamp and retention.
3. Confirm Point-in-Time Recovery status and its coverage window, if enabled on the project plan.
4. Record the backup/restore point identifier and timestamp.
5. Confirm the team has a documented restore procedure; ideally perform a restore drill on a separate branch/project, never over production.
6. Keep the production database unchanged until this verification is complete.

## 6. Current migration reconciliation decision

- Do not reset the database.
- Do not mark missing migration versions as applied.
- Do not reapply already-present learning migrations under alternate identifiers.
- Do not create guessed historical migration SQL.
- Recover the exact `20261114035209_fix_company_progress_snapshot_insert_grants` SQL from the canonical source and commit it to the repository.
- Preserve all existing data and the current column-level `company_progress` restrictions.

## 7. Remaining blockers

1. Backup/PITR inventory and restore readiness are not verified.
2. Exact source SQL for `20261114035209_fix_company_progress_snapshot_insert_grants` is not present in the inspected ZIP.
3. Older legacy numbered migrations (`0001`–`0036`) use a different versioning convention from live timestamped history; their complete semantic mapping still needs authoritative migration provenance.
4. No production DDL/data change was made in this batch.

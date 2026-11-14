# StudyBench production backup, restore and release runbook

This is an operator procedure, not evidence that a backup or restore has already occurred.

## Before any production migration

1. Confirm the target Supabase project ref and environment.
2. Confirm the current migration head and inspect the diff from the last applied migration.
3. Pause high-risk admin operations (manual affiliate payouts, content publishing) during the migration window.
4. Create a database backup using the project's supported Supabase backup/PITR capability or a `pg_dump` export.
5. Export Storage object inventory and ensure uploaded files are included in the recovery plan; a PostgreSQL dump alone does not back up object bytes.
6. Record backup timestamp, project ref, migration head, operator and checksum in the release ticket.
7. Verify the backup is readable before applying any schema change.

## Logical backup example

Run from a trusted workstation with a direct database connection string. Do not put credentials in shell history, chat, source control or CI logs.

```bash
pg_dump "$SUPABASE_DB_URL" \
  --format=custom \
  --no-owner \
  --no-acl \
  --file="studybench-pre-v117.dump"

pg_restore --list "studybench-pre-v117.dump" > studybench-pre-v117.contents.txt
sha256sum studybench-pre-v117.dump
```

Use a current PostgreSQL client compatible with the Supabase PostgreSQL server. For large production databases, prefer managed backups/PITR and follow Supabase's documented recovery procedure.

## Restore rehearsal

1. Restore the backup to an isolated staging project/database, never over production.
2. Restore Storage objects from the separately retained object backup.
3. Apply migrations only up to the captured migration head.
4. Compare table counts for `profiles`, `user_state`, `payments`, `affiliate_commissions`, `affiliate_payouts`, `content_questions`, `content_question_reviews` and progress tables.
5. Verify key constraints, RLS policies, security-definer function grants and indexes using `supabase/audits/rls_security_audit.sql`.
6. Sign in with a test student and test admin account.
7. Verify entitlement reads, a historical payment lookup, progress sync, content visibility and affiliate payout history.
8. Record restore duration and data-loss point. A restore is not accepted until an operator has completed the checks and recorded the evidence.

## V11.7 migration sequence

Apply after reviewing the exact deployed migration head:

- `0036_payment_reliability_and_plan_identity.sql`

Run it first on staging. Verify:
- A user with `premium = true` and `premium_until IS NULL` remains lifetime after a finite paid renewal is applied.
- A free user receives exactly the configured 365-day period.
- An active finite entitlement stacks from its current expiry.
- A duplicate payment does not extend entitlement twice.
- A historical lifetime order still grants lifetime access.
- New commission rows retain `plan_key`, and legacy commission rows remain readable.

## Rollback

Do not blindly reverse a financial migration after real payments have been processed. Prefer a forward corrective migration. Restore from backup only under an approved incident procedure with explicit reconciliation of payments and payouts that occurred after the backup point.

## Release gates

- Unit and route tests pass.
- TypeScript typecheck, lint and production build pass.
- Staging migration and payment simulations pass.
- RLS audit has no unexplained public write grants or SECURITY DEFINER functions callable by untrusted roles.
- Backup restore rehearsal has been completed.
- k6 smoke/load test stays within the agreed thresholds.
- Keyboard and screen-reader smoke checks are complete.
- Razorpay webhook URL, secret, subscribed events and delivery history are checked in the Razorpay dashboard.
- Supabase production migration head matches the release manifest.


## Load-test command

After deploying a staging build and confirming the public routes:
```bash
k6 run -e BASE_URL="https://YOUR-STAGING-ORIGIN" tests/load/public-smoke.k6.js
```

Do not point the default 15-VU smoke profile at production without an approved window and agreed request budget.

# StudyBench V11.7 — Supabase RLS audit findings (migration-source review)

## Scope and evidence

This is a static review of the migrations bundled in the V11.6 source archive. It is not a live Supabase catalog audit. The actual project may have manual policies, grants, triggers or migrations not represented in this ZIP.

Run `supabase/audits/rls_security_audit.sql` against the intended staging project and reconcile every result before production release.

## Controls visible in the migration history

| Data area | Intended access model in migrations | Review note |
|---|---|---|
| `profiles` | Owner-scoped authenticated access | `referred_by` is protected by a trigger; payout columns have explicit update revocation in migration 0030. |
| `user_state` | Owner-scoped authenticated access | Entitlement columns are protected by a trigger and payment grants use a service-role-only RPC. |
| `company_progress`, `daily_challenges` | Owner-scoped authenticated access | These are student progress records; multi-device concurrent writes still need staging tests. |
| `mistakes`, `coding_attempts`, `drive_outcomes` | Owner-scoped authenticated access | Explicit user identity filters are used by client persistence helpers. |
| `question_reports` | Owner insert and own-row read | Cross-user moderation access is through service-role admin code. |
| `payments` | Owner read; no client write policy | Financial writes are service-role only; ledger rows are retained when the Auth identity is erased. |
| `affiliate_accounts` | Owner read; no client write policy | UPI payout destination changes are not self-service after application; server-side admin process is required. |
| `affiliate_commissions` | Direct table SELECT revoked from anon/authenticated in migration 0027 | User-facing aggregate summary is exposed through `get_affiliate_summary`; admin uses service role. |
| `affiliate_payouts` | Owner read; no client write policy | Payout rows retain destination and transaction reference snapshots for audit. |
| `affiliate_settings` | Read-only public settings policy | Contains programme settings, not account-specific payout details. Writes remain service-role only. |
| `content_questions` and review evidence | Governed through server-side admin APIs and service-role database operations | The V11.6 review workflow requires admin MFA AAL2 at the route boundary. |

## High-risk review points

1. `SECURITY DEFINER` functions must have a safe fixed `search_path`, explicit execute grants and validated inputs.
2. Confirm the live project has applied migrations 0027, 0030, 0031, 0035 and 0036 in order.
3. Confirm no broad `GRANT ALL` or unexpected anon/authenticated write grants were added manually.
4. Confirm no `SECURITY DEFINER` function is executable by anon/authenticated unless it is explicitly designed for a narrow self-read use case.
5. Confirm every public table has RLS enabled and every table exposed through PostgREST has the intended policy set.
6. Confirm views do not bypass expected row filters through owner execution. Inspect view owners and `security_invoker` options.
7. Confirm storage buckets have separate object policies; table RLS does not secure Storage objects.
8. Confirm the production service-role key is never exposed in client bundles, public environment variables or browser logs.

## Known limitations

- The source archive does not contain the live Supabase catalog.
- No authenticated/anon role impersonation tests were run against a database.
- No Storage bucket policy audit was executed.
- No SQL migration was applied to staging or production.
- A static policy in a migration is not proof that the live project has the same policy.

## Release decision

Do not mark the RLS audit complete until the SQL audit output is reviewed, unexplained grants are resolved, and negative tests confirm that one student cannot read or modify another student's rows or access admin/financial records.


## Live project follow-up (10 November 2026)

A read-only catalog/advisor inspection was completed against the connected `PLACEMENT` Supabase project. See `V11_7_LIVE_SUPABASE_AUDIT_2026-11-10.md` for the observed migration drift, policy findings, role-scoped smoke checks, Security Advisor warnings and Performance Advisor findings.

The live project had RLS enabled on all inspected public/storage tables. The anon smoke test returned zero rows for the sampled student and content tables; an authenticated test identity saw one own profile and one own user_state row. The live project still needs the missing repository migrations 0030–0035 before the V11.6 content governance and payout code can safely be deployed.

The live Security Advisor also reported a mutable search_path on `public.set_updated_at` and disabled leaked-password protection. The Performance Advisor reported 18 auth-initplan policy warnings and five missing foreign-key indexes. Migration 0036 now includes SQL changes for the database-side findings; leaked-password protection remains a dashboard setting.

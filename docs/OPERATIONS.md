# Operations runbook

Operational posture for StudyBench. Pairs with the env contract in `lib/env.ts`
and the migrations in `supabase/migrations/`.

## Environments & secrets

All configuration is environment variables — see `.env.example` for the full
list. They fall into two classes, enforced by `lib/env.ts`:

- **Core (required):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`. Missing any of these **crashes the server at boot
  in production** (`instrumentation.ts`) instead of failing mid-request.
- **Feature (optional):** payments (`RAZORPAY_*`) and email (`RESEND_*`).
- **Production security dependency (required):** distributed rate limiting
  (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`). Production requests fail
  closed if the global limiter is unavailable; the in-memory adapter is local-dev only.

### Secret rotation

| Secret | Where it's used | Rotation |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Entitlement grant, account erasure, admin reads | Rotate in Supabase → Project Settings → API; update the host env. Full-privilege key — rotate immediately if leaked. |
| `RAZORPAY_KEY_SECRET` | Order creation, payment verify | Razorpay Dashboard → API Keys → regenerate; update env. |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature check | Razorpay Dashboard → Webhooks; update env. Until updated, webhook deliveries 400. |
| `UPSTASH_REDIS_REST_TOKEN` | Global rate limiting | Upstash console; rotate both URL/token configuration as required. Production fails closed if unavailable. |

Never expose anything except the `NEXT_PUBLIC_*` pair to the client. The service
role key must only be read from server routes / instrumentation.

## Privileged account access

- Admin and creator roles are assigned only through trusted Supabase Auth `app_metadata` or server-only allowlists. `user_metadata` is not an authority source.
- Admin pages require a confirmed email and an Authenticator Assurance Level 2 (`aal2`) session. Enrol and verify an authenticator factor for each administrator before assigning the admin role. Keep a documented recovery administrator and test factor recovery; an account without `aal2` is intentionally denied admin access.
- Do not put administrator email addresses in source code. Use the server-only `STUDYBENCH_ADMIN_EMAILS` allowlist only as a controlled bootstrap fallback.

## Database migrations

Schema is version-controlled in `supabase/migrations/` and applied with:

```bash
supabase db push      # or paste the SQL into the Supabase SQL editor
```

Migrations are version-controlled in `supabase/migrations/`. Do not infer remote
migration status from this source tree: inspect `supabase migration list` against
the intended project before applying anything. CI currently verifies that
migration files exist; it does not yet enforce remote schema drift. A clean-room
`supabase db reset` and a linked staging drift check are release gates.

## Backups & point-in-time recovery

- Enable **PITR** in Supabase → Database → Backups (Pro plan). Target ≤ 24h RPO.
- Verify restores quarterly by restoring to a throwaway branch and sanity-checking
  `user_state`, `company_progress`, and `payments` row counts.
- The `payments` table is the financial ledger — treat it as the highest-value
  data for recovery and reconciliation.

## Data retention & erasure (DPDP)

- **Account deletion** (`POST /api/account/delete`, service role) erases
  `profiles`, `user_state`, `company_progress`, `daily_challenges`, `mistakes`,
  `coding_attempts`, `drive_outcomes`, then the auth user.
- **Intentionally retained:** `payments` (financial/GST reconciliation),
  `affiliate_commissions` and `affiliate_payouts` (financial/audit evidence), and
  `question_reports` (content QA). User references are set to null on account
  deletion; payout snapshots remain for accounting. Personal payout destination
  details in `affiliate_accounts` are erased with the account.
- When adding any new per-user table, add it to the delete route's erasure list.

## Observability

- **Logging:** `lib/logger.ts` emits structured JSON in production (parseable by
  Vercel/Datadog/Logtail) and readable lines in dev.
- **Error capture:** `captureError()` logs and forwards to a pluggable reporter.
  Server errors are caught centrally by `onRequestError` in `instrumentation.ts`.
- **Wiring an error tracker (e.g. Sentry):** install the SDK and register a
  reporter once at boot — no call-site changes needed:

  ```ts
  // in instrumentation.ts register()
  import * as Sentry from "@sentry/nextjs"
  import { registerErrorReporter } from "@/lib/logger"
  registerErrorReporter((err, ctx) => Sentry.captureException(err, { extra: ctx }))
  ```

- Add uptime monitoring (e.g. a health check on `/api/premium/status` returning
  401 unauthenticated) and alerting on the `[webhook]` / `razorpay/verify` error
  logs — those are the money path.

## Premium content & the data layer

`state.premium` on the client is only a UI echo: it is reconciled from
`user_state` on every hydrate and can never be written by the client (DB trigger).
The server is the authority via `lib/premium-guard.ts` (`readEntitlement` /
`requirePremium`).

The main learning curriculum is marked server-only and is loaded by
`app/api/content/*` routes after authentication and entitlement checks. Client
learning pages use the catalog metadata for navigation and fetch lesson bodies
and practice data from those APIs. Keep lesson bodies, quiz answer keys and
premium question banks out of client imports. The separate `/api/questions`
content datastore path also enforces free/premium tiers. Any new client surface
must use an entitlement-checked server route and return `Cache-Control: private,
no-store` for user-specific content.

Before release, inspect a production client bundle and source maps to confirm
that premium lesson bodies and answer keys are absent. API authorization tests
must cover signed-out, free, and premium users for each content route.

### V11 content quality and answer-key controls

- `/api/questions` returns live questions only, filtered by server-derived entitlement. It omits answer keys, explanations and per-option notes.
- `POST /api/questions` grades a bounded authenticated submission against the server-side live bank and only then returns answer feedback.
- Apply `supabase/migrations/0034_content_quality_workflow.sql` after reviewing the migration in staging. Existing live rows are not silently assigned a reviewer; the review-metadata constraint is `NOT VALID` for legacy compatibility and should be validated only after legacy live rows are reconciled.
- Use `docs/content-quality-standard-v11.md` for independent review and provenance requirements. Automated checks do not constitute SME approval.


## V11.6 content review workflow

Apply migrations in order through `0035_content_review_workflow.sql` before using `/admin/content`.
The admin page and its API require an authenticated admin with MFA assurance level `aal2`.
New seeded questions enter as `draft`; reviewers must independently confirm the answer key,
explanation, source, difficulty and duplicate check. An approval is recorded against the
current `content_questions.version` and moves the row to `reviewed`. Publishing then moves it
to `live`, where the existing `/api/questions` endpoint serves it according to the free/premium
tier gate. Answer keys and explanations remain server-side until answer submission.

Any substantive edit to question content increments its version and automatically resets its
status to `draft`, clearing reviewer and publication metadata. A new independent review is
therefore required. Review evidence is recorded in `content_question_reviews`; do not edit
or delete review rows manually. The V11.6 UI manages the database-backed `content_questions`
bank only; the code-authored PYQ and mock banks retain their separate publication governance.

Do not apply this migration directly to production until it has been reviewed and tested against
a staging database backup. The application code does not apply migrations automatically.


## V11.7 payment and database reliability

Migration `0036_payment_reliability_and_plan_identity.sql` must run only after the pending V11.6 migrations through `0035_content_review_workflow.sql` have been reconciled against the live migration history. It is a single transaction and includes:
- Payment entitlement stacking and active-lifetime preservation.
- Nullable `affiliate_commissions.plan_key` metadata.
- Live Supabase advisor follow-ups: fixed `search_path`, safe `auth.uid()` initplans, and five missing foreign-key indexes.
- A `protect_referred_by` trigger guard using the current database role instead of deprecated `auth.role()`.

The live `PLACEMENT` project was inspected read-only on 10 November 2026. It is behind the V11.6 source migration head. Do not deploy the V11.6/V11.7 application code until the migration drift has been resolved and tested on staging. See `docs/V11_7_LIVE_SUPABASE_AUDIT_2026-11-10.md`.

Enable Supabase Auth leaked-password protection in the Dashboard; SQL migrations do not change that Auth setting. Run the k6 harness only against a staging URL with `BASE_URL` set. Complete the backup restore rehearsal and keyboard/screen-reader acceptance checklist before production release.

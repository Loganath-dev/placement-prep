# Operations runbook

Operational posture for StudyBench. Pairs with the env contract in `lib/env.ts`
and the migrations in `supabase/migrations/`.

## Environments & secrets

All configuration is environment variables — see `.env.example` for the full
list. They fall into two classes, enforced by `lib/env.ts`:

- **Core (required):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`. Missing any of these **crashes the server at boot
  in production** (`instrumentation.ts`) instead of failing mid-request.
- **Feature (optional):** payments (`RAZORPAY_*`), email (`RESEND_*`),
  distributed rate-limit (`UPSTASH_*`). Absent → that feature is disabled and the
  app logs an informational notice at boot; everything else works.

### Secret rotation

| Secret | Where it's used | Rotation |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Entitlement grant, account erasure, admin reads | Rotate in Supabase → Project Settings → API; update the host env. Full-privilege key — rotate immediately if leaked. |
| `RAZORPAY_KEY_SECRET` | Order creation, payment verify | Razorpay Dashboard → API Keys → regenerate; update env. |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature check | Razorpay Dashboard → Webhooks; update env. Until updated, webhook deliveries 400. |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting | Upstash console; safe to rotate (limiter falls back to in-memory if unreachable). |

Never expose anything except the `NEXT_PUBLIC_*` pair to the client. The service
role key must only be read from server routes / instrumentation.

## Database migrations

Schema is version-controlled in `supabase/migrations/` and applied with:

```bash
supabase db push      # or paste the SQL into the Supabase SQL editor
```

**Pending application to remote (apply in order):**

- `0009_spaced_repetition_and_outcomes.sql` — SR schedule columns on `mistakes`
  + the `drive_outcomes` table. Required for cross-device sync of review schedule
  and logged drive outcomes.
- `0010_content_questions.sql` — content datastore foundation (see below).

CI (`.github/workflows/ci.yml`) lists migrations but does not yet enforce drift —
wire the Supabase secrets and uncomment the `db diff` step to make it fail on
schema drift.

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
- **Intentionally retained:** `payments` (financial/GST reconciliation) and
  `question_reports` (content QA) — both have their `user_id` FK null out on
  deletion, so they are retained de-identified, not linked to a person.
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

`content_questions` (migration `0010`) is the path to closing the last gap —
premium content currently ships in the JS bundle. The table's RLS exposes only
`status='live' AND tier='free'` rows to clients; **premium rows are reachable
only through a server route that has passed entitlement gating** (service role).

Already in place (the proven first slice):

- **Authored seed:** `lib/data/content-seed.json` — original questions with
  per-option rationale, tiered free/premium.
- **Seeder:** `scripts/seed-content.mjs` upserts the seed (idempotent). Run after
  applying 0010:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-content.mjs
  ```
- **Serving route:** `GET /api/questions?section=…` returns only `free` rows to a
  non-premium viewer and `free + premium` to a premium viewer (`tiersFor`), so
  premium content is served from the server, never the bundle.

Remaining rollout:

1. Grow the seed (this is human authoring/review, not generation).
2. Switch a client surface (e.g. PYQs) to fetch from `/api/questions`; verify.
3. Remove the migrated content from the client bundle. Repeat per surface.

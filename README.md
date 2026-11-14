# StudyBench

StudyBench is a student-first placement preparation platform built with Next.js 16, React 19, TypeScript, Supabase and PostgreSQL. It combines structured learning paths, aptitude and CS fundamentals, programming-language roadmaps, practice, mock tests, progress tracking and an optional affiliate programme.

The free plan includes one original, 20-question general placement-readiness mock. Company-pattern mock simulations remain unavailable until they complete academic review and are explicitly published.

## Product and pricing

- Free access includes starter lessons and limited practice across learning paths.
- Premium plans: **₹299 for 6 months (180 days)** or **₹499 for 1 year (365 days)**. The previous ₹249 annual plan remains verifiable for existing orders.
- The server resolves purchase amounts, durations and referral rewards from the selected plan key. Lifetime access is resolved only from an explicit historical lifetime plan key.
- Premium purchase plans and durations are resolved on the server. Never trust a price or entitlement duration supplied by the browser.

## Technology

- Next.js App Router (`app/` at the repository root), React and TypeScript
- Supabase Auth, PostgreSQL, Row Level Security and service-role-only server operations
- Razorpay payment verification and signed webhooks
- Upstash Redis REST for distributed production rate limiting
- Tailwind CSS and shadcn/ui primitives

## Local development

Requirements: Node.js 22.12+, pnpm 10.28.0 and a Supabase project.

The V11.10 ZIP updates patched framework/test-tool versions and adds dependency overrides. Its lockfile must first be regenerated on a network-enabled workstation; do this once before relying on frozen installs:

```bash
corepack enable
pnpm install --no-frozen-lockfile
pnpm check:release-deps
pnpm audit --audit-level high
cp .env.example .env.local
# Fill the local Supabase values and any services you want to exercise.
pnpm dev
```

After the regenerated `pnpm-lock.yaml` is saved, use `pnpm install --frozen-lockfile` for ordinary installs and CI.

## Verification commands

```bash
pnpm check:app-directory
pnpm check:boundaries
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Vercel is the single deployment target. The Vercel project and CI both use `next build`; Cloudflare/OpenNext deployment configuration has been removed to prevent platform drift.

## Security boundaries

- Curriculum bodies, answer keys and practice banks are server-only modules. Client learning pages request the current chapter through authenticated, entitlement-checked API routes.
- `SUPABASE_SERVICE_ROLE_KEY`, Razorpay secrets and Upstash credentials must never be exposed to browser code or committed.
- Production requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; rate limiting fails closed if the global limiter is unavailable.
- Admin and creator roles must be assigned through trusted Supabase Auth `app_metadata` or explicitly configured server-side allowlists. User-editable metadata is not trusted. Admin access also requires a verified email and an AAL2 MFA session; provision and test the admin authenticator before assigning production access.

## Repository layout

- `app/` — Next.js App Router pages, layouts and API route handlers. Keep framework routes here; do not move them into `components/`.
- `components/` — reusable UI components and design primitives.
- `lib/` — domain logic, security helpers, data access and state synchronization.
- `tests/` and colocated `*.test.ts` files — automated regression coverage.
- `supabase/migrations/` — ordered database migrations.

## Project documentation

- [`docs/PRD.md`](docs/PRD.md) — historical product requirements (not the current implementation contract)
- [`docs/technical/REMEDIATION_AUDIT_2026-11-13.md`](docs/technical/REMEDIATION_AUDIT_2026-11-13.md) — latest source-level remediation audit
- [`CHANGELOG.md`](CHANGELOG.md) — repository changes
- [`docs/OPERATIONS.md`](docs/OPERATIONS.md) — operational runbook
- [`docs/PRICING_AND_REFERRALS.md`](docs/PRICING_AND_REFERRALS.md) — plan and reward rules
- [`docs/LEGAL_COMPLIANCE.md`](docs/LEGAL_COMPLIANCE.md) — legal review checklist (not legal advice)

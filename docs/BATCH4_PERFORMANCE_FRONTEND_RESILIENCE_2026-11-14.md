# Batch 4 — Performance, Frontend and Resilience Audit

Date: 2026-11-14  
Scope: StudyBench production-readiness master audit phases 10–12.  
Source: supplied Batch 3 ZIP working tree.  
Execution mode: source inspection and local static checks only; no production traffic, database writes, deployment, or load test.

## Executive result

**Batch 4 is source-reviewed, not performance-certified.** No confirmed critical/high defect was established from the inspected code. The application has useful resilience controls, including a shared Redis-backed rate limiter that fails closed in production, explicit network timeouts for Razorpay and Upstash calls, client-side progress queuing with bounded exponential retry, entitlement-status retry, route error boundaries, and server-side request error capture.

The target of 1,500 concurrent users is **not verified**. No approved load-test environment or production-like test credentials were available, and no load test was run. Do not advertise a 1,500-concurrent-user capacity based on this audit.

## 1. Performance and scalability

### Positive findings

- `lib/rate-limit.ts` uses Upstash Redis REST and a single atomic Lua script for sliding-window prune/count/add/expiry. This avoids a split count-then-increment race across serverless instances.
- Production requires both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`; a Redis failure rejects the request rather than silently falling back to per-instance memory.
- Upstash requests use `cache: "no-store"` and a 5-second timeout.
- Razorpay order/verify/webhook calls use 12-second timeouts and disable caching for webhook fetches.
- Personalized content and progress APIs explicitly return private/no-store headers, avoiding cross-user cache leakage.
- Admin pages and sensitive admin APIs are marked dynamic.
- Large authored content is primarily served through server API routes; the browser fetches chapter and practice payloads on demand.

### Risks / follow-up

1. **No shared application-data cache found.** Redis is currently used for rate limiting; no Redis cache, Next cache tags, or `unstable_cache` usage was found. This is not automatically a defect: personalized entitlement, payment, and progress data must not be cached indiscriminately. A future cache should target public/static catalog or reviewed content only, with explicit invalidation on publication.
2. **Client bundle review is incomplete.** Several client pages import `lib/data/content-catalog.json` via `lib/data/content-catalog.ts`. The JSON source is approximately 470 KB uncompressed. This may contribute to client JavaScript if its full module is included in client chunks. Bundle analyzer output was unavailable because dependencies could not be installed. Measure actual emitted client chunks before deciding whether to split the catalog or move lookups server-side.
3. **No measured database latency, serverless duration, Core Web Vitals, bundle budget, or concurrency profile.** These require an instrumented deployed preview or local production build.
4. **No 1,500-user load test.** Running a load test against the live payment or production database without an approved test environment would be unsafe.

## 2. Frontend and user experience

### Positive findings

- App-level and root loading UI exist (`app/(app)/loading.tsx`, `app/loading.tsx`).
- Error boundaries exist at root, app, and admin segments, plus `app/global-error.tsx` for root-layout failures.
- A custom not-found page exists.
- The authenticator QR uses an SVG data URL from Supabase; the deliberate native `<img>` avoids unnecessary Next image optimization for a tiny inline QR.
- Client-side content boundaries passed the repository's transitive boundary check (59 client entry points scanned).

### Not verified

- No browser automation or manual browser session was available. Therefore mobile/tablet/desktop layout, hydration warnings, console errors, keyboard access, image loading, and complete navigation cannot be certified.
- No screenshot-based visual regression or Lighthouse run was performed.

## 3. Error handling and resilience

### Positive findings

- `fetchPremiumStatusWithRetry()` retries transient network/5xx responses up to three attempts and avoids treating an unavailable entitlement service as a confirmed free entitlement.
- `lib/supabase/progress-sync-queue.ts` persists pending state before network sync, coalesces updates, avoids deleting a newer snapshot after an older in-flight request, uses bounded exponential backoff, and blocks automatic retries for permanent permission/data errors until an explicit retry.
- Account deletion clears both current and legacy local progress queue entries after successful server-side erasure.
- `instrumentation.ts` validates required server environment variables at runtime, logs optional feature configuration, and wires uncaught request errors to the central logger.
- Payment and Redis network calls have explicit timeouts; financial/reward retry behaviour is guarded by idempotency mechanisms reviewed in Batch 3.

### Follow-up risks

- Browser storage failure and offline progress recovery need real browser tests, including quota exceeded, private browsing restrictions, tab close during sync, sign-out/sign-in with queued state, and account deletion while a queue exists.
- Redis outage behaviour is source-reviewed but was not exercised against a real Redis test instance.
- Supabase outage and database transaction rollback behaviour require controlled integration tests against a disposable/staging project.

## 4. Commands and checks executed

Passed:

- `node scripts/check-client-content-boundary.mjs` — 59 client entry points scanned.
- `node scripts/check-release-dependencies.mjs`.
- `node scripts/check-next-app-directory.mjs`.
- `node scripts/check-learning-progress-security.mjs` — 26 checks passed.

Not run / unavailable:

- Vitest suite (no installed Vitest executable / `node_modules`).
- TypeScript project check (dependencies and framework type declarations unavailable).
- ESLint.
- Next.js production build.
- Bundle analysis / Lighthouse / browser E2E.
- Redis/Supabase fault-injection tests.
- Load test at any concurrency level.

The repository pins `pnpm@10.28.0`; the prior install attempt was blocked by npm registry DNS/network failure (`EAI_AGAIN`). No dependencies were installed in this batch.

## 5. Defect and change log

- No source-code modification was made in Batch 4 because no confirmed high-severity defect was established that could be safely fixed without executable tests or production-like validation.
- No SQL migration, production data mutation, payment operation, Vercel deployment, or external service configuration change was performed.

## 6. Recommended next actions

1. Restore package registry access or provide a dependency cache; install with `pnpm install --frozen-lockfile`.
2. Run lint, full TypeScript, Vitest, and production build before browser testing.
3. Use a Vercel preview connected to a disposable Supabase project and dedicated Upstash database for fault injection.
4. Add browser E2E for mobile/tablet/desktop, entitlement status outage, progress queue recovery, QR enrollment, and navigation.
5. Measure client chunk sizes; if the catalog is bundled broadly, split metadata from full content and/or serve it through a versioned public-content endpoint.
6. Create an approved k6/Artillery load profile that isolates read-heavy learning traffic from payment/admin flows. Ramp gradually (e.g. 50 → 150 → 500 → 1,000 → 1,500 virtual users), define SLOs, monitor Supabase pool/CPU, Upstash commands, Vercel function duration and error rates, and stop on database saturation. Do not run this against production without explicit approval.

## Verdict

**Batch 4: source review complete; runtime/performance verification pending.** StudyBench has meaningful rate-limit and failure-recovery foundations, but frontend acceptance, production build, service fault injection, and the 1,500-concurrent-user target remain unverified. This batch does not change the overall release gate from Batch 3.

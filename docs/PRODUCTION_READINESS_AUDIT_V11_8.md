# StudyBench V11.7 — SaaS UX and Security Checklist Audit

Date: 10 November 2026  
Basis: source archive `studybench-v11-7-payment-security-production-reliability.zip` plus read-only Supabase findings recorded in `V11_7_LIVE_SUPABASE_AUDIT_2026-11-10.md`.

This is a source and configuration review, not a penetration test or production acceptance certificate.

## Executive decision

**NOT APPROVED FOR PRODUCTION.** The source contains a substantial set of good controls, and this audit adds a custom 404 page, a keyboard command palette, same-origin mutation checks and a grading API rate limit. However, the exact dependency versions in the archive are affected by later security advisories: Next.js is `16.2.6` and React/React DOM are `19.2.4`. The November 2026 Next.js advisories list `16.4.5` as patched; a React Server Components DoS advisory lists `19.2.9` as patched. The lockfile cannot safely be regenerated in this environment because the package registry was unreachable. Do not deploy until dependencies and the lockfile are updated together and the full CI pipeline passes.

## UX checklist — 20 patterns

| # | Pattern | Status | Evidence / gap |
|---:|---|---|---|
| 1 | Optimistic UI updates | Partial | Store mutations update local state immediately and queue a durable progress snapshot; no explicit React `useOptimistic` usage. |
| 2 | Skeleton loaders | Pass | App segment loading and quiz loading skeleton components exist. |
| 3 | Command palette | Implemented in this audit | Added Ctrl/⌘+K navigation palette in the authenticated student shell. |
| 4 | Persistent sidebar navigation | Pass | App shell keeps desktop navigation mounted; mobile has bottom navigation and a sheet. |
| 5 | Loading and empty states | Pass | Route-level loading UI, empty-state copy and unavailable-content states exist across key screens. |
| 6 | Autosave functions | Pass | App store persists local state and progress sync queue snapshots; quiz progress is saved through store mutations. |
| 7 | Debouncing | Pass | Local persistence is debounced (400 ms). |
| 8 | Throttling | Partial / not demonstrated | No reusable UI throttle utility was found. Server rate limiting is present but is not the same as UI event throttling. |
| 9 | Smart form validation | Partial | Native required/email/min-length constraints and route-level validation exist; validation consistency is not centralized. |
| 10 | Bulk actions on list | Not found | No clear bulk-selection/bulk-action workflow was found. This may be unnecessary for current student-facing lists. |
| 11 | Reusable data table | Partial | Admin pages have tabular list views, but a shared reusable DataTable abstraction was not found. |
| 12 | Advanced data filtering | Pass / partial | Admin content queue supports status, text query and bounded result count; not every table has advanced filters. |
| 13 | Keyboard shortcuts | Implemented in this audit | Ctrl/⌘+K opens the command palette; broader keyboard shortcut coverage remains untested. |
| 14 | Tier-based UI indicators | Pass | Premium/free access indicators and locked states exist; server routes independently enforce entitlement. |
| 15 | Onboarding data capture | Pass | Onboarding collects focus, confidence, time goal and programming preferences. |
| 16 | Referral and affiliate pages | Pass | Affiliate application, dashboard, terms reacceptance, commissions and payout history exist. |
| 17 | Custom 404 page | Implemented in this audit | Added root `app/not-found.tsx`. |
| 18 | Mobile-optimized SaaS layouts | Pass / needs device test | Responsive layouts, sheet navigation and mobile bottom nav exist. Actual viewport and touch testing remains outstanding. |
| 19 | Destructive action protection | Pass | Account deletion dialog requires typing `DELETE`; server checks financial retention before erasure. |
| 20 | Graceful error recovery | Pass | App/root error boundaries, retry controls and progress-sync recovery banner exist. |

## Security checklist — 19 controls from the reference

| # | Control | Status | Evidence / gap |
|---:|---|---|---|
| 1 | Row-level security | Partial pass | Live audit found RLS enabled on inspected public/storage tables and sampled owner scoping behaved as expected. Live schema is behind source migrations 0030–0035. |
| 2 | Authentication on API routes | Partial pass by design | User-specific APIs call Supabase `getUser`/`readEntitlement`; signed Razorpay webhook uses HMAC. Public question GET intentionally serves only free-tier content without a login. |
| 3 | Never trust frontend | Pass | Premium entitlement is resolved server-side; client premium state is only a UI echo. |
| 4 | Rate limiting | Partial pass | Upstash is mandatory in production and key payment/affiliate/email actions are limited. The question grading POST is now limited to 30 per user per 10 minutes. Some read-only content endpoints remain unmetered. The public free-question GET is intentionally unauthenticated and excludes answer keys; answer submission requires authentication. |
| 5 | Sanitize user input | Partial pass | Route handlers validate key IDs, enums, lengths and answer shapes; React escapes ordinary text. No dedicated comprehensive XSS/property-based input suite was found. |
| 6 | Parameterized queries | Pass | Supabase query builder is used; admin search filters are constrained before `.or(...)`. |
| 7 | Lock down CORS / CSRF | Improved, verify in staging | No permissive CORS response headers were found. Added same-origin `Origin` and `Sec-Fetch-Site` checks to browser mutation endpoints. Missing Origin is allowed for non-browser clients; cookie/SameSite behavior still needs browser testing. |
| 8 | HTTPS everywhere | Deployment-dependent | Production HSTS header is configured. Verify canonical domain, TLS and all redirect behavior at the deployed edge. |
| 9 | Stop IDOR bugs | Partial pass | Server identity and owner-scoped database policies are used. Full two-account negative tests across every route/table have not been completed. |
| 10 | Debug mode off in production | Partial pass | No `debugger` statement or explicit debug flag was found; no `productionBrowserSourceMaps` override was found. Verify production build/deployment settings. |
| 11 | CAPTCHA on public forms | Not found | No Turnstile, hCaptcha or reCAPTCHA integration found in source. Configure Supabase Auth CAPTCHA or another approved anti-bot control for public signup if abuse risk warrants it. |
| 12 | Log admin actions | Partial pass | Content review history records reviewer/decision; payout rows record `paid_by` and transaction reference. No general append-only admin audit log for every privileged action was found. |
| 13 | Private storage buckets | Not applicable / unverified | Live audit found zero Storage buckets. No file upload workflow exists in the source. If Storage is introduced, create private buckets and object-level policies before release. |
| 14 | Hide admin pages properly | Pass | Admin pages use `requireAdmin`; admin APIs require trusted admin identity and MFA AAL2. Client navigation visibility is not the authorization boundary. |
| 15 | Update vulnerable packages | **Fail — release blocker** | Next.js `16.2.6` and React/React DOM `19.2.4` are below patched versions identified in current advisories. Upgrade package.json and pnpm-lock.yaml together. |
| 16 | Check file upload types | Not applicable | No file upload routes or file inputs were found. |
| 17 | Review security / AI-generated changes | Partial | Static review performed; no external penetration test, dependency audit command or independent security assessment completed. |
| 18 | Security headers | Pass / tune later | CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy and Permissions-Policy are configured. CSP currently includes `unsafe-inline`; nonce-based CSP would be stronger. |
| 19 | Verify webhook signatures | Pass in source; live test pending | Razorpay HMAC signature is checked with timing-safe comparison; order and payment are re-fetched from Razorpay. No real signed webhook replay test has been performed. |

## Additional security checklist from the second reference

- Hide API keys/secrets: no literal production secrets found in the archive; service-role key is server-side and `.env*` is ignored. Git history was not included, so history scanning is unverified.
- Check environment variables: production boot validation requires Supabase and Upstash configuration; optional payment/email variables are checked at call sites.
- Protect admin routes: server-side allowlist/trusted app metadata plus AAL2 MFA.
- Validate user access: server-side entitlement guard and database RLS.
- Prevent XSS: React text escaping; one `dangerouslySetInnerHTML` occurrence is used for JSON-LD structured data. Review any future rich HTML feature separately.
- Secure API endpoints: input checks, auth and no-store headers exist on sensitive responses; mutation-origin checks were added in this audit.
- Disable production debug mode: no `debugger` statements found; confirm deployment environment and build settings.
- Remove unused packages: not assessed; requires dependency graph analysis and tests.
- Scan Git history for leaked secrets: impossible from this ZIP because `.git` history is excluded. Run Gitleaks/secret scanning against the actual repository and all branches.
- Hash passwords properly: password handling is delegated to Supabase Auth; the application does not store or hash passwords itself.

## Dependency remediation required

The source manifest currently pins:
- `next`: `16.2.6`
- `eslint-config-next`: `16.2.6`
- `react`: `19.2.4`
- `react-dom`: `19.2.4`

Current advisory references:
- Next.js 16.4.5 is listed as patched for the 3 November advisories GHSA-pc58-hwjq-p385, GHSA-rhh4-g77r-r9qj and GHSA-7qx7-33qx-rqx2.
- The October 2026 critical Next.js advisory also affects versions before 16.4.1.
- React Server Components advisory GHSA-h3gv-c5rc-p453 lists 19.2.9 as patched for the 19.2 line.

Recommended package update, followed by a regenerated lockfile:
```bash
pnpm add next@16.4.5 react@19.2.9 react-dom@19.2.9
pnpm add -D eslint-config-next@16.4.5
pnpm install
pnpm audit --audit-level high
```
Do not manually edit package versions without regenerating `pnpm-lock.yaml`. The package registry was unreachable in this audit environment, so this update was not applied.

## Verification status

Performed:
- ZIP extracted and source inspected.
- API route inventory reviewed.
- No literal production secrets found in the archive.
- No file upload endpoints/inputs found.
- Security headers, admin MFA, RLS migration history, entitlement checks and Razorpay signature flow inspected.
- Added root 404 page.
- Added Ctrl/⌘+K command palette.
- Added same-origin mutation checks to authenticated browser POST routes.
- Added per-user rate limit to answer grading.
- Added unit tests for request-origin behavior. Added CI dependency audit gate (`pnpm audit --audit-level high`) and full-history Gitleaks workflow.

Not performed:
- `pnpm install`, `pnpm audit`, Vitest, ESLint, full TypeScript typecheck or Next.js production build.
- Real browser keyboard/accessibility/mobile tests.
- Two-user IDOR/CSRF penetration tests.
- Git history secret scan.
- CAPTCHA provider configuration test.
- Live payment/webhook test.
- Backup restore and load tests.

## Production release gates

1. Upgrade vulnerable framework/runtime dependencies and regenerate the lockfile.
2. Reconcile live Supabase migrations 0030–0036 on staging before deploying this application version.
3. Run `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm check:boundaries`, `pnpm exec tsc --noEmit -p tsconfig.json`, `pnpm test`, `pnpm audit --audit-level high`, and `pnpm build`.
4. Run browser tests for login/signup, keyboard navigation, 404, mobile breakpoints, CSRF rejection and destructive confirmation.
5. Run Razorpay test payment, duplicate webhook delivery, failed DB retry and entitlement reconciliation tests.
6. Complete backup/restore rehearsal, two-device progress tests, staging load test and accessibility review.
7. Scan the actual Git repository history for leaked secrets and confirm production environment variables.

**Release decision: HOLD.** The source is materially improved, but the vulnerable dependency versions and uncompleted runtime/database acceptance tests mean the app is not yet production-ready.

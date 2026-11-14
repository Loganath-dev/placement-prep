# StudyBench repository remediation audit — 13 November 2026

## Scope and evidence

The audit used the uploaded `studybench-final (2).zip` archive (351 files) as the source snapshot. The latest in-archive repair note is `STUDYBENCH_REPAIR_NOTES_2026-11-12.md`. This is a source-level review; no live Supabase, Razorpay, Upstash, email-provider or production environment was accessed.

## Confirmed defects and fixes

### 1. Next.js App Router was outside the recognized routing root

**Evidence:** Route files, including `page.tsx`, `layout.tsx` and API handlers, were stored in `components/app/`. The repository had no root `app/` or `src/app/` directory, while `next.config.ts` did not define a custom route root. Tests also imported handlers through `@/app/api/...`, which did not match the supplied file tree.

**Fix:** Moved the route tree to root `app/`, retained colocated UI components, updated `@/components/app/` aliases to `@/app/`, and added `scripts/check-next-app-directory.mjs` plus a CI step to guard the convention.

### 2. Authentication callback open redirect

**Evidence:** Both the callback and the login page accepted any `next` value beginning with `/` except values beginning with `//`. URL parsers also treat backslashes as path separators in special-scheme URLs, so a value such as `/\\attacker.example` could resolve outside the application origin.

**Fix:** Added `safeInternalRedirectPath`, shared by the callback and login page. It requires a relative path, rejects protocol-relative and backslash forms, parses against the trusted origin, and checks the resolved origin before returning path/query/hash.

### 3. Referral attribution race and read-error ambiguity

**Evidence:** When the profile lookup returned no row, the callback used an unconditional upsert. A concurrent callback or transient read error could cause a later referral to overwrite the first attribution.

**Fix:** Treat lookup errors as errors (no write), insert the initial profile with attribution, recover only from unique-key conflict, then use a conditional update requiring `referred_by IS NULL`. Existing attribution is preserved.

## Test gap analysis

- The route files were not under the conventional Next.js App Router root, so route-level test imports and actual framework routing were structurally inconsistent.
- There was no dedicated authentication callback referral-race test.
- Redirect tests did not cover backslash-based authority parsing.
- The existing CI had no explicit App Router directory guard.

## Tests added

- `lib/security/redirect.test.ts`
- `tests/auth-callback-referral.test.ts`
- `scripts/check-next-app-directory.mjs` (structural CI check)

## Verification status

- `node scripts/check-release-dependencies.mjs`: passed.
- `node scripts/check-client-content-boundary.mjs`: passed.
- `node scripts/check-next-app-directory.mjs`: passed.
- TypeScript/TSX syntax scan: 230 source/test files, zero syntax diagnostics. This is a syntax scan, not a typecheck.
- Alias import scan: 231 TypeScript files, zero unresolved `@/` imports.
- JavaScript syntax scan: passed. JSON parse scan: 7 files, zero invalid JSON.
- Migration inventory 0001–0036: passed (exactly one migration per version).
- Focused Node execution of the actual transpiled redirect helper and callback route with mocked Supabase/Next dependencies: passed for external/backslash redirect rejection, existing-attribution preservation and duplicate-key race recovery.
- Full Vitest, ESLint, Next.js build and dependency audit: not run because the archive has no `node_modules`, pnpm is not installed, and Corepack could not reach the npm registry in this environment.
- TypeScript command was attempted with the globally installed compiler; diagnostics were dominated by missing Next.js, React, Supabase and Node type packages. It is not a valid project typecheck result.
- Coverage before/after: unavailable because Vitest and coverage instrumentation could not be installed or run. No percentage is claimed.

## Operational constraints

No migrations were applied. No production data was changed. No Git push or deployment was performed. Staging verification remains required for the payout snapshot migration and affiliate service-role grants already present in the source archive.

## Student-first follow-up review — 13 November 2026

### Confirmed issue fixed: UTC calendar rollover

The student challenge and streak experience used UTC date strings in client-side state and challenge API seeding. For students in `Asia/Kolkata`, UTC midnight occurs at 05:30 local time, which could change the displayed daily challenge and streak date before the student's local day ended.

Changes:
- Added `lib/date-keys.ts` with timezone-aware date keys, Monday week-start keys, date arithmetic and IANA timezone validation.
- Updated streak calculations and weekly challenge completion to use the browser's local timezone.
- Updated the challenge page to send its IANA timezone to the challenge API and calculate completion indicators with the same zone.
- Updated the daily challenge API to use the validated timezone when generating its stable daily/weekly period key.
- Added `lib/date-keys.test.ts` with timezone boundary, week start, leap-day, year/month boundary and invalid-input coverage.
- Added user story `docs/functional analysis/US-2026-11-13-student-local-calendar.md` and technical explanation `docs/technical/STUDENT_LOCAL_CALENDAR_AND_STREAKS.md`.

No database migration is needed; date keys remain `YYYY-MM-DD` strings.

### Revalidation corrections

Two concerns in the earlier conversational review were not substantiated by the current source and should not be treated as confirmed defects:

1. **Company progress lookup:** `loadUserState()` maps every `company_progress` row by its `company_id`, and the learning routes read `state.progress[companyId]`. No wrong-company mapping defect was reproduced in this archive.
2. **Premium curriculum exposure:** the client/server boundary script passes. Full `lib/data/content` imports found in application routes are in server API handlers or server-rendered marketing code. The marketing prep page exposes a small sample of easy questions in public SEO markup, not the complete premium lesson/question bank. This should remain covered by the boundary CI check, but the earlier assertion that client bundles currently contain the full curriculum is stale for this archive.

### Verification limits

- The date utility compiled with strict TypeScript settings independently.
- Eight direct runtime assertions passed for Asia/Kolkata and America/Los_Angeles date keys, Monday week keys, leap-day and year boundaries, and invalid timezone handling.
- `check-client-content-boundary`, `check-release-dependencies`, and `check-app-directory` passed.
- The full Vitest suite, full project typecheck, lint and Next.js build remain unverified because dependencies are not installed in this environment.

### Premium content boundary — follow-up correction and fixes

The earlier revalidation was directionally correct that the full `lib/data/content` module was not in the current client import graph, but the review was too narrow: it did not fully evaluate every server response and public HTML surface. A deeper student-entitlement review found two narrower, real leaks:

1. The daily challenge API trusted `company_progress.passed` when selecting questions and did not independently re-check the current Free/Premium chapter entitlement. A Free account with stale or manipulated progress could therefore receive questions from a locked chapter. The route now checks `canAccessLearningChapter` against the current server entitlement before including each chapter and applies the same Free difficulty/count restrictions as chapter practice.
2. The public company-prep page selected easy sample questions from any chapter in a section, including chapters beyond the Free starter chapter. Both its visible sample and JSON-LD now select only from free starter chapters.

The client/server boundary checker was also expanded from direct-import detection to transitive local import-graph traversal. It now scans 59 client entry points in the current source tree and passes with no protected curriculum runtime imports. Type-only imports are ignored because TypeScript erases them from browser output.

Regression coverage was added to `lib/access.test.ts` for daily challenge Free/Premium question filtering. See `docs/technical/PREMIUM_CONTENT_BOUNDARY_2026-11-13.md` for the threat model and endpoint review.

Verification on this archive: `node scripts/check-client-content-boundary.mjs`, `node scripts/check-release-dependencies.mjs`, and `node scripts/check-next-app-directory.mjs` pass. Full Vitest/typecheck/lint/build remain pending because project dependencies are not installed in this environment. No production database or deployment was changed.

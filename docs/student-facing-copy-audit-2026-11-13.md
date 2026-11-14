# StudyBench student-facing and admin copy cleanup — 2026-11-13

## Scope
Reviewed visible copy in the application routes and shared components for implementation details, infrastructure terminology, internal content workflow language, and developer-facing diagnostics.

## Changes
- Replaced question-bank terminology in the practice widget with learner-friendly practice wording.
- Replaced curriculum implementation descriptions in Chapter Practice with a direct learner instruction.
- Removed references to reviewed question inventory from the chapter-assessment empty state.
- Changed recall progress wording from “reviewed” to “completed”.
- Replaced technical payment endpoint/environment-variable diagnostics with a user-safe retry message in pricing and settings.
- Replaced service-role and deployment diagnostics on admin error/metrics screens with plain-language messages.
- Simplified admin overview copy about content provenance and approval workflow.
- Simplified content review workspace copy while retaining the operational source/reviewer information administrators need.
- Removed sample-data implementation instructions from the empty referral state.
- Replaced the admin content API's migration-number error with a safe retry message.

## Audit findings
A follow-up source scan found no visible instances in `app` or `components` of the targeted phrases: `database-backed`, `provenance`, `source ID`, `reviewed chapter`, `curated`, `question bank`, `service-role`, `production schema`, `MFA session`, migration-number diagnostics, `available lesson questions`, `target 20`, `target per lesson`, `60% required`, generated-volume labels, or environment-variable/API-routing diagnostics.

Remaining matches for terms such as `service-role`, `migration`, `RPC`, `webhook`, and `curated` are confined to source comments, API implementation, or internal data fields; they are not rendered page copy. Academic terms such as databases and debugging remain where they describe actual learning subjects.

## Validation
- `node scripts/check-client-content-boundary.mjs` — passed (59 client entry points scanned transitively).
- `node scripts/check-release-dependencies.mjs` — passed.
- `node scripts/check-next-app-directory.mjs` — passed.
- TypeScript transpile/syntax diagnostics — passed for all 12 modified TS/TSX files.
- `tsc --noEmit` — could not complete because `node_modules` is absent; errors include missing `next`, `react`, Supabase and Node type declarations. This is an environment/dependency limitation, not a verified typecheck pass.
- Full tests and production build were not run because dependencies are not installed.

No product logic, database schema, payment rules, referral rules, learning progression, or question limits were changed.

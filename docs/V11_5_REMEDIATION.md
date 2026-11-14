# StudyBench V11.5 — Data Integrity Remediation

## Baseline

Built from `studybench-v11-4-reliability-academic-remediation.zip`.

## Critical defect corrected

The prior full-sync routine loaded the latest 60 mistakes and 50 drive outcomes, then treated every remote row absent from those bounded lists as deleted. This could delete older valid records during an ordinary progress sync.

### Implementation

- Removed absence-based remote deletion reconciliation from `syncAll`.
- Added durable explicit queue operations for deleting individual mistakes and outcomes.
- Added explicit bulk-clear operations for the notebook and drive outcomes.
- Preserved queued deletion operations across successive snapshots and failed sync attempts.
- Prevented a pending individual mistake deletion from winning if the same question is present again in the newest snapshot.
- Preserved reset semantics by explicitly clearing notebook and outcome records when the student invokes reset.
- Added queue regression tests for the above operation semantics.

## Database impact

No Supabase schema changes or migrations were added. No live database was accessed or modified.

## Verification status

- Client/server content-boundary script: passed.
- Seed script JavaScript syntax check: passed.
- PYQ duplicate script: passed; 457 hand-authored prompts checked, 0 exact duplicates.
- TypeScript transpilation/syntax check: passed for the four modified TS/TSX files.
- Full `tsc --noEmit`: attempted but not verifiable; dependencies and type packages are absent (`node_modules` is not present), producing unresolved module/type diagnostics. This is not a passing typecheck.
- Vitest: not run; Vitest is not installed and the package manager could not be bootstrapped because registry access was unavailable.
- ESLint and production build: not run for the same missing-dependency limitation.
- Live Supabase, RLS, payment provider and browser workflows: not tested in this environment.
- Migration 0034 was edited locally to backfill unreviewed legacy live rows; SQL execution against PostgreSQL was not possible here.
- No Supabase migration was applied or executed against a database.

## Release position

Development candidate only. This correction addresses one critical data-loss path but does not certify all progress-sync race conditions, multi-tab concurrency, payment workflows, academic answer keys or production readiness.

## Content publication safety correction

A second P0 defect was found in the seed path: `scripts/seed-content.mjs` previously upserted every seed row with `status: "live"`. This bypassed the intended review lifecycle and could overwrite an existing publication decision. It also conflicted with migration 0034's requirement for independent reviewer metadata.

The seed script now checks existing IDs, inserts only missing rows as `draft`, and leaves existing rows (including their review state) untouched. Migration 0034 now moves legacy `live` rows back to `draft` when reviewer evidence is missing or author and reviewer are the same. Properly reviewed rows remain live. Regression tests assert the seed script's fail-closed behavior and migration backfill.

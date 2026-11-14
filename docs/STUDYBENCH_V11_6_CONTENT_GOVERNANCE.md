# StudyBench V11.6 — Content Governance & Academic Verification

## Scope

This release adds an authenticated admin workflow for the database-backed `content_questions`
bank. It does not claim that every code-authored PYQ or mock in the static curriculum has been
individually reviewed. Those banks retain their own governance paths.

## Admin workflow

- `/admin/content` is guarded by the existing admin check and MFA AAL2.
- `/api/admin/content` repeats the admin and MFA checks for every request.
- Review evidence is inserted transactionally through a service-role-only database function.
- Approval requires all five checks: answer key, explanation, source, difficulty and duplicate review.
- Author attribution must be recorded before approval; a reviewer cannot approve their own authored question. The author is set explicitly in the admin workspace and cannot be silently inferred for legacy rows.
- Approval is tied to the exact question version.
- Publishing requires the latest review to be an approval for the current version.
- Substantive edits and author-attribution changes automatically increment the version and return the question to draft.
- Review history is available to admins.
- The student question API continues to deliver only `status = live` rows and applies the existing free/premium gate. Answer keys are withheld until submission.

## Migration

New migration: `0035_content_review_workflow.sql`.

Apply only after `0034_content_quality_workflow.sql`, on a staging database first. It adds publish audit fields, transactional review/publish RPCs, and a trigger that invalidates stale review evidence after content edits. RPC execution is revoked from public/anon/authenticated and granted only to `service_role`.

## Important limitations

- No live Supabase project was accessed or modified.
- SQL was inspected statically; it was not executed against PostgreSQL in this environment.
- Full Vitest, TypeScript project typecheck, ESLint and production build must be run in an environment with dependencies installed.
- The static PYQ and mock banks are not managed by this new database review screen.
- An admin can mark a question approved only after actually completing the academic checks. The UI records the reviewer's attestation; it does not automatically prove correctness.

## Release acceptance

1. Apply migrations 0034 and 0035 to staging.
2. Verify draft rows are not returned by `/api/questions`.
3. Verify a complete approved review moves a question to `reviewed`.
4. Verify an incomplete approval is rejected.
5. Verify the author cannot review their own question.
6. Verify publishing succeeds only for the latest approved version.
7. Edit any substantive field and verify version increments, status returns to draft, and student delivery stops.
8. Verify a live free question is delivered to a free user without answer/explanation.
9. Verify a premium question is not delivered to a free user.
10. Verify answer and explanation are returned only after valid submission.


## Local checks performed for the V11.6 archive

- `node scripts/check-client-content-boundary.mjs`: passed.
- `node scripts/check-pyq-dups.mjs`: passed; 457 hand-authored prompts, zero exact duplicate prompts.
- `node --check scripts/seed-content.mjs`: passed.
- Global TypeScript `transpileModule` syntax parsing: passed for the changed TS/TSX files. This checks syntax only, not project types.
- Static governance contract assertions: passed.
- `tsc --noEmit`: attempted, but the project dependencies and React/Next type packages are unavailable in the extracted environment; this is not a passing typecheck.
- `npm test`, `npm run lint`, and `npm run build`: attempted; the local commands exited 127 with `Permission denied` for `vitest`, `eslint` and `next`. These checks are not passed.
- No PostgreSQL client was available, so migration 0035 was not executed or validated against a database.
- No Supabase project, payment provider or deployed browser session was accessed.

# Pre-launch test remediation — 13 November 2026

## Scope and baseline

Source archive: `studybench-referral-admin-real-data-fix-2026-11-13(1).zip`.

The supplied archive contains the affiliate dashboard route/test and the programming curriculum/content-quality tests. The environment did not contain `node_modules`; Corepack could not download the pinned pnpm release because the npm registry was unreachable (`EAI_AGAIN`). Therefore the complete Vitest suite, ESLint, full TypeScript check and Next.js production build could not be executed.

## Root causes and changes

### 1. Affiliate dashboard test contract conflict

`tests/affiliate-dashboard.test.ts` asserted a one-item `commissions` array in its response-shape matcher, then immediately asserted that the same response contained two commission records, including a refunded commission. The route intentionally returns the affiliate's full commission history, including refunded rows, so the matcher was stale and internally contradictory.

Updated the expected response to include both the approved annual commission and the refunded six-month commission. Added an explicit stable ordering assertion for those rows. No financial business rule or API filtering behavior was weakened.

The route continues to derive affiliate identity from the authenticated Supabase user, scope referral and commission queries to that user, avoid returning buyer/payment identifiers, and preserve refunded commission history.

### 2. Programming lesson practice gaps

Runtime inspection of the actual TypeScript curriculum found that all seven language paths contained 15 chapters and two lessons per chapter, but the second lesson in nine non-Python module templates did not receive topic-matched practice questions. The generated application/testing questions were not matching the lesson body strongly enough for the semantic lesson mapper.

Updated the second lesson's authored content to explicitly teach application, debugging and testing steps. This gives the existing authored question topics a clear, truthful match to the second lesson; no questions are copied from unrelated chapters and no round-robin fallback was introduced.

Added a regression test that checks every lesson in every programming-language chapter receives a non-empty, topic-matched practice set and that no lesson set exceeds the 20-question checkpoint cap.

### 3. Curriculum test assertion reconciliation

The old test expected four lesson records per language chapter, while the current learner-facing roadmap and authored curriculum intentionally show two substantial lessons per chapter. The four-lesson assertion was stale relative to the product's visible `2 lessons` chapter structure. The test now asserts exactly two lessons and checks that each explanation meets the existing 60-word structural floor. It does not manufacture duplicate lessons to satisfy an obsolete count.

### 4. Student-facing internal copy

Removed the content-governance/debugging note that exposed available question counts, the internal target, and the content-review gap to learners. The checkpoint now uses concise learner-facing wording: question count and pass threshold. The assessment heading was also simplified.

## Runtime validation performed

A local TypeScript-transpiled runtime inspection (using the globally available TypeScript compiler, without installing dependencies) loaded the curriculum and lesson-practice builder and verified:

- 7 programming-language paths.
- 15 chapters per language (105 total).
- 2 lessons per chapter (210 total).
- Every lesson explanation is at least 60 words.
- Every lesson receives at least one topic-matched practice question.
- No lesson practice set exceeds 20 questions.
- 735 total lesson-practice question assignments across the 210 lessons.
- All programming chapter MCQ and typed-recall records have valid structure, answer keys and explanations.
- No empty lesson practice sets remain in the 105 language chapters.

The 20-question value remains a maximum/target cap; the current authored curriculum does not yet provide 20 reviewed questions for every lesson. It deliberately does not pad the set with unrelated questions. Additional subject-authoring work is required before claiming 20 questions are available in every lesson.

## Checks

Passed:

- `node scripts/check-client-content-boundary.mjs`
- `node scripts/check-release-dependencies.mjs`
- `node scripts/check-next-app-directory.mjs`
- TypeScript parser diagnostics: zero syntax diagnostics in the four modified TS/TSX files.
- Runtime curriculum/practice integrity inspection described above.
- ZIP integrity (`ZipFile.testzip()` returned no errors).

Not run / not verified:

- Full Vitest suite (`vitest` executable unavailable).
- Full `tsc --noEmit` (blocked by absent Next.js, React, Supabase and Node type dependencies; emitted missing-module/type errors).
- ESLint (dependency unavailable).
- Next.js production build (dependency unavailable).
- Browser and live payment/referral end-to-end tests.

## Files changed

- `tests/affiliate-dashboard.test.ts`
- `lib/data/programming-curriculum.ts`
- `lib/data/programming-curriculum.test.ts`
- `app/(app)/learn/[company]/[section]/[chapter]/page.tsx`

No database migration or production data mutation was performed. No deployment was performed.

## Release recommendation

This archive contains targeted source fixes and successful static/runtime checks, but it is not certified launch-ready until dependencies can be installed and the full Vitest, typecheck, lint, production build and browser integration checks pass in CI or a connected development environment.

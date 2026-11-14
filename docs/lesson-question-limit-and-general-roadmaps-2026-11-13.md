# Lesson question limit and company-neutral learning roadmaps

Date: 13 November 2026

## Changes

- Lesson checkpoint question sets are now capped at `LESSON_PRACTICE_TARGET` (20) after topic mapping, deduplication and easy-to-hard ordering.
- The source question bank is not deleted or globally truncated. Chapter assessments, company PYQs and mock tests continue to use their own configured question counts.
- General Aptitude, Logical & Verbal, CS Core, Programming Languages and DSA subject roadmaps now resolve their chapters and progress against the `general` curriculum rather than the user's selected primary company.
- Company-specific learning paths remain available under the dedicated Company Tracks area. PYQs and Mock Tests remain separate company-specific preparation surfaces.

## Validation

Passed:

- `node scripts/check-client-content-boundary.mjs`
- `node scripts/check-release-dependencies.mjs`
- `node scripts/check-next-app-directory.mjs`

Added a unit test proving that a 32-question lesson bank returns exactly 20 questions for the lesson checkpoint.

Not run: Vitest, TypeScript typecheck, production build, and browser checks. This working tree does not contain `node_modules`; installing dependencies was not attempted in this validation pass.

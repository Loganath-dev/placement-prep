# Student-facing lesson checkpoint copy cleanup — 2026-11-13

## User-visible issues removed

The lesson checkpoint exposed implementation and content-operations wording that belongs in internal diagnostics, not the learner experience:

- Removed the lesson header line that described the available question count, target count per lesson, and pass threshold as implementation metadata.
- Changed the lesson progress indicator to the concise `Question X of Y` format, without the internal suffix `available lesson questions`.
- Removed the completion note that described target questions attempted and the availability of reviewed questions.

## Learner-facing behavior retained

- The checkpoint still presents the actual number of questions loaded for the attempt.
- The lesson pass threshold remains enforced by the existing `LESSON_PASS_THRESHOLD` value (60%).
- Failed attempts still explain the learner's score and what to do next.
- Question selection, question count, scoring, progress persistence, and unlocking behavior were not changed.
- Chapter assessment copy and its 70% progression rule remain intact.

## Files changed

- `app/quiz-runner.tsx`
  - Allows an empty question-count suffix so the lesson checkpoint can show `Question X of Y` without awkward extra wording.
- `app/(app)/learn/[company]/[section]/[chapter]/page.tsx`
  - Removes internal target/availability copy from the lesson checkpoint header and completion state.
  - Keeps a learner-oriented chapter assessment description.

## Validation

Passed:

- `node scripts/check-client-content-boundary.mjs`
- `node scripts/check-release-dependencies.mjs`
- `node scripts/check-next-app-directory.mjs`
- Source scan confirms the reported internal phrases are no longer present in application TS/TSX files.

Not run:

- Full TypeScript check, Vitest, production build, and browser verification. The uploaded source archive does not include `node_modules`, and dependency installation was not attempted for this copy-only change.

No database, API contract, question-selection, pass-threshold, or learner-progress logic was changed.

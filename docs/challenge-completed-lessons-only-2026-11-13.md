# Daily and Weekly Challenges — Passed Lessons Only

## Requirement
Challenges must contain questions only from lessons that the signed-in learner has individually completed and passed. Questions from in-progress, failed, not-started, skipped, or otherwise unpassed lessons must never be included.

## Implementation
- Kept challenge generation server-side and scoped progress reads to the authenticated user's `company_progress` rows.
- Added `onlyCompletedLessonSets`, a shared pure selector that pairs a lesson's question set only when that lesson ID exists in the learner's passed-lesson set.
- Updated `/api/content/daily-challenge` to use this selector before applying plan visibility and free/Premium question-access rules.
- Retained `getPassedLessonIds` compatibility for older saved practice attempts, but only attempts meeting the existing 60% lesson pass threshold qualify.
- Kept skipped chapters excluded and visible-lesson/Premium access restrictions intact.
- Updated student-facing challenge copy to explain that questions come from individually passed lessons, not merely completed chapters.
- If the learner has not passed any eligible lessons, the API returns an empty question set and the UI prompts them to pass a lesson first; there is no generic question-bank fallback.

## Tests added
- Challenge material includes a passed lesson and excludes in-progress and not-started lessons.
- No passed lessons produces no challenge material.

## Validation
- `node scripts/check-client-content-boundary.mjs` passed.
- `node scripts/check-release-dependencies.mjs` passed.
- `node scripts/check-next-app-directory.mjs` passed.
- Vitest could not be run because `node_modules` is not installed in this environment.
- Full TypeScript check, production build, and browser verification remain pending for the same dependency limitation.

## Deployment
No production deployment or database migration was performed.

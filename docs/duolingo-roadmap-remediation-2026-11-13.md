# Duolingo-style chapter roadmap remediation — 2026-11-13

## Changes
- Replaced the straight vertical chapter-card list on company/general learning section pages with an alternating, winding chapter path.
- Added numbered circular chapter nodes, connecting dashed path, completed/current/locked states, responsive layout, and progress-aware styling.
- Added visible Lessons, Recall, and Chapter Practice substeps to every chapter card.
- Recall and Chapter Practice links are gated until the required previous step is complete; their destination cards now have stable anchor IDs.
- Lesson completion indicators use `getPassedLessonIds`, including legacy practice-attempt recovery.
- Moved the shared `Icon` component from the reserved `app/icon.tsx` App Router metadata namespace to `components/app-icon.tsx` and updated all imports to avoid the reported module resolution failure.

## Validation
- `scripts/check-client-content-boundary.mjs`: passed.
- `scripts/check-release-dependencies.mjs`: passed.
- `scripts/check-next-app-directory.mjs`: passed.
- Confirmed no remaining `@/app/icon` imports.
- Full TypeScript/build/test validation could not run because project dependencies are not installed in this working environment. Global `tsc` reports missing framework and React modules, so its output is not a valid project typecheck.

## Notes
- No production deployment was performed.
- The chapter learning sequence remains Lessons → Recall → Chapter Practice; the UI now exposes these steps directly on the roadmap.

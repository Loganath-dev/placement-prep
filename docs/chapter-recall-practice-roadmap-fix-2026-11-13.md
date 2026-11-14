# Chapter Recall and Practice Roadmap Fix — 2026-11-13

## Problem
The section roadmap showed Lessons, Recall and Chapter Practice as small inline pills inside a chapter card. Although the chapter page and API already contained recall completion and practice gating, the roadmap did not present these as distinct, discoverable learning nodes.

## Changes
- Replaced inline step pills with three separate, full-width roadmap nodes inside every chapter card: Learning lessons, Chapter Recall, and Chapter Practice.
- Added individual circular node indicators, a vertical dotted connector, alternating left/right node cards, and responsive mobile layout.
- Each node now displays its own description and state: locked, available/current, or completed.
- Lessons are available when the chapter itself is accessible.
- Recall remains locked until every lesson checkpoint in the chapter is passed.
- Chapter Practice remains locked until Recall is completed; a passed chapter is shown as completed and can be revisited.
- Preserved the existing chapter-level lock (the previous chapter must be passed), Premium access checks, and the existing 70% chapter assessment pass threshold.
- Kept chapter assessment wording accurate; it does not claim a 20-question count. The 20-question cap applies to lesson checkpoints.

## Existing backend enforcement reviewed
`app/api/content/chapter-practice/route.ts` already checks previous-chapter completion, all lesson checkpoints, recall completion, and learning-card completion before returning chapter assessment questions. This UI change does not weaken those server-side checks.

## Files changed
- `app/(app)/learn/[company]/[section]/page.tsx`
- `app/globals.css`

## Validation
- `node scripts/check-client-content-boundary.mjs` — passed.
- `node scripts/check-release-dependencies.mjs` — passed.
- `node scripts/check-next-app-directory.mjs` — passed.
- TypeScript TSX parser diagnostics for the modified page — zero.
- Full typecheck, Vitest suite, production build and browser/mobile interaction tests were not run in this environment; do not treat this ZIP as production-build verified.

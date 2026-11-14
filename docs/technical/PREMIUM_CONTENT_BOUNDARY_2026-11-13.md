# Premium curriculum content boundary — 13 November 2026

## Security objective

A Free account must never receive Premium lesson bodies or Premium-only practice questions through a browser bundle, an API response, or public marketing HTML. Client-side lock states are presentation only; the server-side entitlement is authoritative.

## Source review

- `lib/data/content.ts` is the full seeded curriculum source. It already imports the StudyBench server-only runtime guard and is used by server routes and server-rendered marketing code.
- The client import graph was checked transitively from all `"use client"` entry points under `app/` and `components/`. No runtime import of `lib/data/content`, the premium-capable `lib/data/content-seed`, programming curriculum, question bank, PYQ bank, mock bank or `lib/server/learning-content` is permitted.
- `lib/data/content-catalog.json` is a separate roadmap catalogue containing public navigation metadata (section/chapter/lesson titles, summaries and durations), not lesson bodies or answer-bearing question banks.

## Defects corrected

### 1. Daily challenge could bypass chapter entitlement

The daily challenge endpoint previously selected questions from every chapter marked as passed in `company_progress`. Completion state is not proof of Premium entitlement: progress can be stale, imported, or written independently of a current purchase. The route now checks `canAccessLearningChapter(...)` for each chapter using the current `readEntitlement()` result before adding any question source. A Free account therefore receives challenge questions only from the first accessible chapter in each learning path.

The endpoint also now applies `visibleDailyChallengeQuestions(...)`, which mirrors the Free question restrictions used by chapter practice: no hard language/SQL questions and no more than `FREE_CHAPTER_PRACTICE_LIMIT` questions from a chapter. Premium accounts retain the complete eligible bank.

### 2. Public marketing sample could select a locked chapter

The company preparation page builds public sample-question markup and JSON-LD. It previously selected the first easy question found in a section without checking the chapter's path position. Both sample builders now skip chapters beyond `FREE_CHAPTERS_PER_PATH`, so public SEO markup only contains questions from free starter chapters.

### 3. Client/server boundary guard strengthened

`scripts/check-client-content-boundary.mjs` now follows local static and dynamic imports transitively from each client entry point, including alias and relative imports. It ignores erased type-only imports. Protected server curriculum modules are blocked if they enter a client module graph. The CI workflow already runs `pnpm check:boundaries`.

## Existing server authorization

- `GET /api/content/chapter` calls `readEntitlement()`, validates the chapter, checks previous-chapter completion, checks `canAccessLearningChapter`, and returns only the first `FREE_LESSONS_PER_PATH` lesson bodies for Free accounts. Responses are `private, no-store`.
- `GET /api/content/chapter-practice` calls `readEntitlement()`, checks chapter access and learning-card completion, and applies the Free question restrictions before returning questions. Responses are `private, no-store`.
- `GET /api/content/pyqs` reads the server-only PYQ bank and returns only `FREE_PYQ_LIMIT` entries to Free accounts. Responses are `private, no-store`.
- `GET /api/content/mock` returns question content only for the first Free mock or any mock for Premium; locked responses contain metadata only. Responses are `private, no-store`.

## Regression coverage

- `lib/access.test.ts` covers first-chapter access and verifies that daily challenge question filtering does not widen Free access.
- The transitive client/server boundary script is a CI check.

## Verification limits

This is a source-level remediation. The boundary script, dependency release gate and App Router directory check must pass in CI. Full Vitest, typecheck, lint and production build still need to run in an environment with the committed dependencies installed. No live Supabase changes, database migrations, production changes or deployments were made as part of this remediation.

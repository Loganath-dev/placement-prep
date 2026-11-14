# Lesson mastery implementation — 13 November 2026

## Student flow

1. Open a subject or company track and choose **Start first lesson / Continue learning**.
2. The chapter page opens the first unpassed lesson (or the next unfinished card).
3. Learning content is presented as individual concept, worked-example and strategy cards. Long prose is split into smaller screens; there is no nested answer scroll area.
4. Every card in the lesson must be completed before the lesson checkpoint can be requested.
5. A score of **60% or higher** records the lesson as passed and unlocks the next lesson.
6. A failed attempt does not unlock the next lesson. The result screen shows missed questions, correct answers and explanations; the student can return to cards and retry.
7. After every visible lesson checkpoint in the chapter is passed, the separate **70% chapter assessment** becomes available. Passing it unlocks the next chapter.
8. Passed lessons remain available for revision.

## Progress and compatibility

- `passedLessonIds` is the new mastery state.
- `completedCardIds` remains the card-completion state.
- The old `completedLessonIds` field is retained for backwards compatibility but is no longer treated as mastery.
- Existing lesson practice attempts are used to recover old passes at the new 60% threshold, so older students do not need to repeat a lesson they had already passed.

## Daily and weekly reviews

- Challenge questions are assembled from question sets belonging to lessons the student has passed.
- Daily sets remain short (5–10 questions based on the configured study time); weekly sets target 20.
- Included lesson links reopen the corresponding lesson for revision.
- The existing local-timezone date keys and once-per-period XP award flow are preserved.

## Question-bank integrity

- Questions may declare `lessonId` or `topicTags`; otherwise, the builder tries a conservative match between question topic/prompt and lesson title.
- Legacy untagged banks retain their existing distribution only when no question can be matched.
- The target is 20 questions per lesson, but the app reports the actual available count and a content-gap message rather than inventing unrelated filler.

## Files touched

- `lib/types.ts`, `lib/store.tsx`, `lib/learning-progress.ts`
- `lib/learning-cards.ts`, `lib/server/learning-content.ts`
- `lib/analytics.ts`
- `app/learning-subject-page.tsx`
- `app/(app)/learn/[company]/page.tsx`
- `app/(app)/learn/[company]/[section]/[chapter]/page.tsx`
- `app/flashcard-study-session.tsx`, `app/quiz-runner.tsx`
- `app/api/content/lesson-practice/route.ts`
- `app/api/content/chapter-practice/route.ts`
- `app/api/content/daily-challenge/route.ts`
- `app/(app)/challenges/page.tsx`

## Validation and remaining work

- TypeScript transpilation syntax checks passed for all 18 changed TypeScript/TSX files.
- Runtime assertions passed for the 60% threshold, legacy pass recovery, card splitting/stable IDs, and explicit/topic-based question mapping.
- Full `tsc`, Vitest and Next.js production build were not completed because this working copy has no `node_modules` and package-manager installation could not reach the npm registry.
- The 20-question goal is not yet satisfied by every lesson. The UI exposes actual counts and content gaps; the remaining academic work is to author/review missing questions and attach precise lesson/topic mappings.
- Open educational resources are references, not permission to copy. Follow `docs/learning-content-quality-standard.md` and verify exact licenses before adapting content for the paid product.

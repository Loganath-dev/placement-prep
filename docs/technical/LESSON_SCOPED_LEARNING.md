# Lesson-scoped learning and practice

Date: 2026-11-13

## Student experience

- A chapter is presented as a list of its actual lessons rather than one mixed chapter deck.
- Teaching cards are built independently from each lesson's authored body. Every card has the real `lessonId` and a stable ID scoped to that lesson.
- Students can move between lessons and resume the last viewed card. Completed card IDs and completed lesson IDs remain in the existing `company_progress.chapters[chapterId].learning` JSON state.
- The practice action is available only at the end of the selected lesson and only after all cards for that lesson have been completed.
- Lesson checkpoint results are stored as practice attempts with their `lessonId` and contribute to topic statistics. A checkpoint pass does not mark the chapter as passed.
- The separate chapter assessment remains available only after all accessible lessons are completed. Only that assessment uses `submitQuiz` and can unlock the next chapter.

## Server authorization

`GET /api/content/lesson-practice` authenticates through `readEntitlement`, applies the current chapter and lesson access rules, verifies previous-chapter completion, and reads the authenticated user's progress row scoped by both `user_id` and `company_id`. It returns only the practice set for the requested lesson after confirming every required card ID for that lesson is complete. Responses are private and non-cacheable.

The existing `/api/content/chapter-practice` remains the final chapter-assessment endpoint and retains its all-accessible-cards completion gate.

## Content integrity

- Cards are split by the lesson body into concept, worked-example and strategy groups; no chapter summary or another lesson's body is merged into a lesson card.
- Sparse lesson content is not padded with invented material.
- `buildLessonPracticeSets` continues to distribute only questions already attached to the chapter (plus the existing SQL/DBMS chapter bank). It does not fabricate unrelated questions to reach a target count.
- Some lesson practice sets may be small because the authored chapter bank is small. Content expansion should be done by authoring and reviewing lesson-mapped questions, not by duplicating or mislabelling questions.

## Data compatibility

No SQL migration is required. `completedCardIds`, `completedLessonIds`, and `practiceAttempts` already live in the chapter progress JSON. `lessonId` is an optional field on each practice attempt, so existing attempts remain readable. Legacy cards with `lessonId: "chapter"` are not used by the new deck; they do not falsely complete any real lesson.

## Verification performed

- Runtime traversal of the complete curriculum: 1,176 chapters and 4,739 lessons; all 4,739 lessons produced at least one card, every card carried its real lesson ID, and no card used `lessonId: "chapter"`.
- Runtime traversal of lesson practice sets: all 4,739 lessons had at least one question in the current authored/distributed bank (41,454 questions across the curriculum). This is a count of existing chapter questions distributed to lessons, not a claim that all questions are individually lesson-authored.
- TypeScript transpile/syntax checks passed for all modified TS/TSX files.
- Client/server boundary, release dependency and App Router directory checks passed.
- Full project typecheck, Vitest and production build remain pending because project dependencies are not installed and the package registry was unreachable in this environment.

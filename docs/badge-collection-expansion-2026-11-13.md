# StudyBench 15-badge achievement collection

## UX changes
- Expanded the achievement catalogue from 7 to exactly 15 distinct milestones.
- Replaced the short earned-only chip row with a complete 15-item badge collection.
- Each badge has a distinct icon, concise title, and earned/locked visual state; the tooltip exposes its requirement.
- Added a collection progress bar and an earned count out of 15.
- Updated the navigation account menu count from `/7` to `/15`.
- Locked badges remain visible so learners can understand what they can earn next.

## Achievement milestones
1. First Steps — onboarding complete.
2. Lesson Learner — first lesson checkpoint passed.
3. Lesson Explorer — 10 lesson checkpoints passed.
4. Memory Builder — first Chapter Recall complete.
5. Recall Ranger — Recall complete in five chapters.
6. Practice Starter — first chapter practice attempt.
7. Practice Pro — 10 chapter practice attempts.
8. Chapter Champion — first chapter assessment passed.
9. Path Builder — five chapter assessments passed.
10. Perfect Score — 100% chapter assessment.
11. Bright Beginner — 250 XP.
12. Knowledge Seeker — 1,000 XP.
13. Rising Star — Level 5.
14. Mock Master — at least one mock score recorded.
15. Code Crafter — five passed coding test cases.

## Engineering notes
- Badge eligibility is derived from persisted app progress; no database schema change is required.
- The dashboard renders the full catalogue and computes unlocked states from the same badge predicates used for the earned count.
- Added unit tests for the catalogue size, unique IDs, baseline state, XP thresholds, and lesson/Recall/practice/chapter milestones.
- Existing user progress is preserved. This change does not grant badges retroactively unless the user's saved progress satisfies the corresponding rule.

## Validation
- Client/server content-boundary check passed.
- Release dependency check passed.
- Next.js App Router directory check passed.
- Vitest and production build were not run because dependencies are not installed in this working directory.

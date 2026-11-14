# StudyBench student usability test — 13 November 2026

## Test type and limitations

This is a task-based expert walkthrough of the current source tree, using student goals and the implemented UI/state flows. It is **not** a moderated test with real student participants and it is **not** a live browser/device test. The working copy has no `node_modules`; installing the pinned package manager failed because the npm registry could not be reached (`EAI_AGAIN registry.npmjs.org`). Therefore Next.js could not be launched and Playwright/browser interactions, screenshots, keyboard execution, responsive viewport checks, and end-to-end auth/database checks could not be performed.

## Student tasks reviewed

1. Complete onboarding and choose a learning focus.
2. Reach the dashboard and identify the next action.
3. Find a subject roadmap and open a chapter.
4. Learn using the lesson flashcards.
5. Complete lesson practice and understand the result.
6. Recover from a failed checkpoint and retry.
7. Pass a lesson and move to the next lesson/chapter.
8. Find general practice, mistakes, and analytics.

## Findings

### P1 — Onboarding asks every student to choose a programming language

**Evidence:** `app/onboarding/page.tsx` always renders step 3 as “Which programming language do you want to learn?” and the continue guard at step index 2 requires `selectedLanguages.length > 0`, regardless of `focusArea`.

**Student impact:** An aptitude-, reasoning-, or CS-core-first student is forced through a programming-specific decision. The default Python selection masks the issue for many users, but a student who deselects all languages cannot continue even when programming is not their chosen focus. This adds irrelevant friction and makes the plan feel less tailored.

**Recommendation:** Make language selection explicitly optional for non-programming focus areas. If programming is selected, require one language; otherwise allow an empty selection and explain that languages can be added later. The final plan summary should not imply a language is part of the plan when none is selected.

### P1 — No actual usability evidence can be claimed yet

**Evidence:** The test environment lacks installed dependencies; `corepack pnpm install --frozen-lockfile` failed before install because the package manager download could not resolve `registry.npmjs.org`.

**Student impact:** Visual overflow, broken click targets, browser console errors, real touch/swipe behavior, loading delays, and cross-device issues remain unverified.

**Recommendation:** Repeat this walkthrough in a running preview with Playwright or 3–5 student participants on desktop and mobile. Capture task completion, time-on-task, hesitation points, and errors.

### P2 — The dashboard makes the programming section visually prominent for every student

**Evidence:** `app/dashboard-experience.tsx` renders a dedicated “Programming languages” section and an always-present SQL & DBMS chip. The language list respects selected languages, but the section itself is not conditional on the student's selected focus.

**Student impact:** Students whose first priority is aptitude or reasoning may interpret programming as mandatory or may need to scroll past content that is not immediately relevant.

**Recommendation:** Keep all paths discoverable, but prioritize the selected focus in the first viewport. Consider a compact “Explore other paths” section for non-selected areas.

### P2 — Practice count is lower than the stated target in some lessons

**Evidence:** The chapter learning page correctly displays the actual available count and warns when it is below `LESSON_PRACTICE_TARGET` (20). It does not insert unrelated filler, which protects relevance.

**Student impact:** Students may assume they completed a full 20-question checkpoint when fewer questions were available unless they notice the warning.

**Recommendation:** Keep the explicit count visible during the quiz and result screen as well as before it starts. Prioritize filling the remaining lesson-specific question gaps before launch.

## Positive usability observations

- Onboarding is divided into five short steps with a visible progress indicator, Back navigation, and large selectable cards.
- The dashboard exposes a clear “Continue learning” action and direct links to practice, mistakes, and analytics.
- The learning roadmap communicates current, completed, and upcoming states and includes progress bars.
- Flashcards show a clear card count and completion progress, support previous/next navigation, and make practice unavailable until all learning cards are completed.
- The lesson flow keeps lesson checkpoint practice separate from chapter assessment and clearly states the 60% lesson / 70% chapter thresholds.
- Failed checkpoints show missed questions, correct answers, and explanations; students can review cards and retry.
- When a lesson has fewer than 20 questions, the UI discloses the actual count rather than padding with unrelated questions.
- The app shell includes a skip-to-content link, and many key controls expose accessible labels or pressed/progress states.
- Static repository checks passed: client/server content boundary, release dependency gate, and Next.js App Router directory check.

## Task walkthrough status

| Task | Source-level result | Browser verified? |
|---|---|---|
| Onboarding | Five-step flow and validation inspected; language-selection friction found | No |
| Dashboard | Continue-learning and destination links inspected | No |
| Find a subject | Six learning areas and subject roadmaps inspected | No |
| Flashcard learning | Card progress, completion, save, and navigation logic inspected | No |
| Lesson practice | Empty question banks are handled with a visible error; actual count is disclosed | No |
| Failed checkpoint | Missed-question review and retry flow inspected | No |
| Unlock next lesson | Pass state and next-lesson action inspected | No |
| General practice | Loading, error, empty, and populated states inspected | No |
| Mobile/accessibility | Source-level responsive classes and accessibility attributes inspected only | No |

## Overall assessment

**Source-level student journey: promising, with onboarding relevance and dashboard prioritization needing improvement.**

This is not a numeric usability score because no real students or browser sessions were involved. The main release blocker from this walkthrough is to validate the complete journey in a running app, then address the onboarding friction and confirm mobile behavior. No live Supabase data or production deployment was changed during this test.

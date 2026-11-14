# Daily and weekly challenges navigation update — 2026-11-13

## Change
- Added a **Challenges** destination directly inside the **Learn** sidebar group, immediately after Tracks and before Practice.
- The destination links to the existing `/challenges` page; no duplicate challenge page or challenge engine was introduced.
- The existing page already exposes Daily and Weekly tabs and loads the personalized challenge API.

## Existing challenge behavior preserved
- Daily and weekly sets are generated from lessons the learner has already passed.
- Daily challenge size remains 5 questions; weekly challenge target remains 20 questions.
- Challenges use the learner's local calendar/time zone for daily and weekly boundaries.
- XP completion remains idempotent, so replaying a completed period does not award the completion reward twice.
- Questions from unpassed lessons are not introduced.

## Files changed
- `app/nav.tsx` — added the sidebar link in the Learn group.

## Validation
- Confirmed `/challenges` page and `/api/content/daily-challenge` endpoint exist.
- Confirmed Daily/Weekly tabs are already implemented on the destination page.
- Full typecheck, automated test suite, production build and browser testing were not run in this environment.

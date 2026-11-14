# User story — Student-local challenge calendar and streaks

- **Epic:** Personalized learning, daily practice and gamification
- **Story:** US-LEARNING-CALENDAR-01
- **Status:** Implemented; automated verification pending dependency installation

## User story

As a student using StudyBench in my local timezone, when I complete a daily or weekly challenge or practise on consecutive days, I should see the same calendar day and week across the challenge page, XP rewards and streak counter. The day must change at midnight in my timezone, not at UTC midnight.

## Acceptance criteria

1. Daily challenge question selection uses the calendar date in the student's browser timezone.
2. The challenge API accepts an IANA timezone and rejects invalid timezone identifiers.
3. Daily completion indicators use the same local date key as the challenge API and client-side XP state.
4. Weekly challenge completion uses Monday as the week start in the student's timezone.
5. Streak continuation compares local calendar dates and handles month/year/leap-day boundaries.
6. A student in India does not lose a day or see a new challenge at 05:30 IST solely because UTC has rolled over.
7. A student in another timezone receives the equivalent local-midnight behavior.
8. Invalid date keys and invalid instants fail explicitly rather than silently producing a misleading streak.

## Regression coverage

- Unit tests cover India and US timezone boundaries, week start, leap day, month/year transitions and invalid timezone/date input.
- Browser tests should verify a daily challenge around local midnight and after a timezone-specific reload when Playwright is installed.

# Student-local calendar keys and streak behavior

## Problem

The client previously used `Date#toISOString().slice(0, 10)` for streak and daily challenge dates. `toISOString()` always uses UTC. In India, UTC midnight occurs at 05:30 local time, so a student could see a new challenge or have their streak day roll over while it was still early morning locally.

## Implementation

- `lib/date-keys.ts` provides timezone-aware `YYYY-MM-DD` keys, Monday week-start keys, date-only arithmetic and IANA timezone validation.
- `lib/store.tsx` uses the browser's local calendar date for streak and daily challenge completion, and the local Monday key for weekly rewards.
- `app/(app)/challenges/page.tsx` detects the browser timezone and sends it to the challenge API. Its completion indicators use the same timezone.
- `app/api/content/daily-challenge/route.ts` validates the timezone and uses it to seed daily/weekly challenge periods.
- Formatter caching is bounded to avoid unbounded growth from arbitrary timezone query values.

## Data compatibility

Persisted date fields remain `YYYY-MM-DD` strings. No database migration is required. Existing UTC-derived dates are not rewritten; the next completed activity records the student's current local date. This may cause a one-time streak recalculation for accounts whose previous date was stored under UTC semantics.

## Verification

`lib/date-keys.test.ts` covers the UTC/local date boundary, multiple timezones, Monday week starts, leap day, month/year transitions and invalid timezone/date input. Run `pnpm exec vitest run lib/date-keys.test.ts` after installing dependencies. A browser test around midnight remains a release acceptance item.

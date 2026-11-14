# User story — Authentication callback integrity

- **Epic:** Identity, onboarding and referral attribution
- **Story:** US-AUTH-REFERRAL-01
- **Status:** Accepted for implementation

## User story

As a student arriving through an affiliate invitation, when I complete email or OAuth authentication, I should be returned only to a destination on StudyBench and have the first valid referral attribution preserved without being overwritten by concurrent callbacks.

## Acceptance criteria

1. The authentication callback accepts only same-origin relative redirect destinations.
2. Protocol-relative URLs, absolute external URLs, backslash-based URL authorities and malformed destinations fall back to `/dashboard`.
3. A valid, active affiliate code may attribute a profile only when `referred_by` is null.
4. Existing referral attribution is immutable through callback retries.
5. A missing profile is created with the referral in one insert.
6. If a concurrent callback wins profile creation, the losing callback may use a conditional update that requires `referred_by IS NULL`.
7. A profile lookup error is not treated as a missing profile.
8. Non-unique insert errors do not trigger a fallback update.
9. Referral attribution failure does not turn a successful authentication exchange into a failed sign-in; it must not overwrite existing data and may be retried safely.

## Regression coverage

- Unit tests cover same-origin redirects, external and backslash redirects, missing profile creation, duplicate-key races, existing attribution and profile-read failures.
- The application CI must verify the root-level Next.js `app/` directory exists and that the legacy `components/app/` route tree is absent.

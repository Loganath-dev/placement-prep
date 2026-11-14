# StudyBench landing page and Premium conversion build — 13 November 2026

## Objective
Improve the visitor-to-signup and free-to-Premium journeys while keeping pricing and referral claims consistent with the live product rules.

## Implemented

### Landing page
- Reframed the hero around a structured placement-preparation routine and a free study-plan call to action.
- Added compact value cues for the six learning areas, flashcards and feedback.
- Improved learning-loop and pricing-section messaging.
- Expanded the free, six-month and annual plan cards with clearer inclusions and duration.
- Added a Refer & Earn section showing the actual fixed rewards: ₹25 for a verified ₹299 six-month purchase and ₹50 for a verified ₹499 annual purchase.
- Disclosed the 15-day review period, ₹250 minimum approved payout balance and manual UPI payout on the 25th, subject to verification.

### Pricing page
- Improved the signed-in pricing page heading and supporting copy.
- Highlighted the annual plan as best value and retained the real ₹99 saving versus two six-month renewals (₹598 versus ₹499).
- Added approximate monthly equivalents and clarified one-time payment / no automatic renewal.
- Expanded plan benefits using existing Premium feature definitions.

## Pricing integrity decision
The requested ₹599 / ₹1,199 crossed-out prices were not added. The repository and current terms establish ₹299 / ₹499 as the active prices, but do not establish ₹599 / ₹1,199 as genuine previous or regular selling prices. Displaying unsubstantiated reference prices could mislead customers. If the business has actual transaction and offer-history evidence supporting those reference prices, they can be reviewed for a transparent price presentation.

## Validation
- Client/server content boundary check: passed.
- Release dependency gate: passed.
- Next.js App Router directory check: passed.
- Full typecheck, unit tests, production build and browser/mobile usability test: not run because dependencies are not installed in this working copy.
- No payment configuration, subscription plan keys, referral reward rules, Supabase data, or production deployment were changed.

## CFO metrics to instrument / review
- Landing visitor → signup conversion.
- Signup → first lesson activation.
- First lesson → first practice completion.
- Free → Premium conversion.
- Annual versus six-month purchase mix.
- Referral attribution → verified Premium purchase.
- Payment failure, refund / reversal and referral-fraud rates.

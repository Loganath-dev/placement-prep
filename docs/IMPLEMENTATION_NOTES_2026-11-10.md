# StudyBench implementation notes — 10 November 2026

## Premium pricing
- Free plan remains available.
- Premium: ₹249 for 1 year (365 days).
- Premium: ₹249 for 1 year (365 days).
- The current ₹249 plan is annual (365 days). Untagged historical ₹24,900 orders are treated as annual based on the live payment ledger; lifetime access is recognized only from an explicit historical `premium_lifetime_249` order key.
- Checkout amount, duration and fixed referral reward are resolved server-side from the plan key.

## Affiliate programme
- Application requires separate affirmative acceptance of the Terms & Conditions and Privacy Policy.
- Consent versions and timestamp are stored in `public.affiliate_accounts`.
- UPI ID and account-holder name are collected before a unique 12-character referral code is issued.
- Referral links use `/auth/signup?ref=<code>` and are attributed through email confirmation or Google OAuth.
- ₹25 fixed reward for a verified ₹249 annual purchase.
- Rewards are held for 15 days for refund review.
- Minimum approved payout balance is ₹250.
- Manual UPI payout is permitted only on the 25th of the month; the database payout RPC enforces this date and the minimum balance.
- The affiliate dashboard shows referred students, Premium status, purchases, commissions and payout history.
- `/admin` and `/admin/referrals` are restricted server-side to `lnath6630@gmail.com`.

## Dashboard
- The top bar displays streak, earned badge count and XP/level, with a shortcut to the affiliate programme.
- The student dashboard includes an achievements summary and a Join Affiliate Programme entry.

## Supabase migrations
- `0021_restore_fixed_referral_program.sql`
- `0022_idempotent_payment_entitlements.sql`
- `0024_learning_preferences.sql`
- `0025_affiliate_applications_and_monthly_payouts.sql`

These migrations were applied to the connected StudyBench Supabase project. The database currently stores the ₹250 minimum payout and day-25 payout schedule.

## Validation
- TypeScript/TSX syntax transpilation: 18 changed source files checked with no syntax diagnostics.
- Supabase: affiliate tables, payout settings and privileged functions queried after migration.
- A complete Next.js typecheck, lint, automated test suite and production build were not run because this source archive did not include `node_modules` and package installation was not performed.
- No deployment was performed.


## Admin and analytics integrity pass
- Admin routes now render a dedicated admin sidebar and header instead of the student navigation, streak, XP, badge count, affiliate CTA and study timer.
- Added direct admin navigation to the overview, affiliate management, platform metrics and question reports.
- Admin overview now fails visibly on Supabase query errors instead of rendering failed counts as zero.
- Active affiliate and unexpired Premium counts use their actual status/expiry fields.
- Platform metrics use the Asia/Kolkata calendar day for today's signup count and surface query failures.
- Removed the uncalibrated placement-probability function and arbitrary company cutoff/slope fields.
- Mock analytics now show only the student's own latest, average, best and recent score movement. Unsupported benchmark-percentile language has been removed.
- Corrected the First Steps badge description so it describes the actual onboarding condition.
- The red Next.js development issue indicator in the screenshot is framework tooling, not a StudyBench product element; it should be investigated rather than hidden.

## Shared UI refresh — 2026-11-10

- Established a single restrained light theme: warm-white page surfaces, charcoal text, quiet grey borders and deep teal actions.
- Removed the global decorative grid background. Kept the existing real font families and Lucide icon library; no generated images, illustration assets or decorative AI styling were added.
- Standardised the authenticated shell, sidebar width, topbar surface, content width, focus treatment and responsive spacing.
- Added a compact mobile bottom navigation for Home, Learn, Practice and Progress.
- Reworked the Learn index into a winding, connected roadmap with completed/current/upcoming visual states and real subject routes.
- Recoloured legacy blue UI accents to the shared teal palette through a compatibility layer while existing page components are progressively migrated.
- Preserved routes, data access, payment flows, entitlement checks and learning state contracts.
- Reduced motion for users who request it.

Visual QA still required in a browser at desktop, tablet and mobile breakpoints. The roadmap is a UI navigation treatment; it does not change lesson completion or unlock rules.

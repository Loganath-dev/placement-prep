# StudyBench — product truth and admin audit
**Updated: 10 November 2026**

This note supersedes older PRD language where it conflicts with the current implementation.

## No fabricated hiring predictions
- StudyBench does not calculate or display a placement probability, candidate percentile, hiring likelihood, or recruiter benchmark.
- Company profile thresholds are not used to claim a student's probability of selection.
- The learning-progress index is calculated only from the student's recorded chapter results and mock scores. Its bands describe study progress, not employability or selection.
- Mock analytics show the student's own latest, average, best and recent score movement only. No peer ranking or invented benchmark is shown.
- Company-pattern questions and mock tests are educational reconstructions based on public test patterns, not leaked or official question papers.

## Admin workspace
- Admin pages use a dedicated navigation shell. Student-only streak, XP, badge, affiliate promotion, Premium nudge and study timer controls are not rendered in admin.
- Admin overview metrics are read from Supabase tables, not hardcoded sample numbers.
- Active Premium count excludes expired entitlements.
- Active affiliate count includes only accounts whose status is `active`.
- Database/query errors are surfaced instead of silently turning failed queries into zero-valued metrics.
- Admin access remains server-verified through the owner allowlist.
- The admin workspace links to overview, affiliate management, platform metrics and student question reports.

## What is real product data
- The curriculum and question bank are authored static product content in the repository. They are not per-user generated records or live external data.
- Student progress, quiz outcomes, mock scores, streaks and XP are derived from recorded student activity and the persisted account state.
- Signup, payment, referral and payout totals are read from the corresponding Supabase records.

## Development-only UI
- The red Next.js “1 Issue” badge shown in the supplied screenshot is the framework's development overlay, not a StudyBench product widget. Do not hide it to make the screenshot look clean; inspect and resolve the underlying issue in the local development overlay.

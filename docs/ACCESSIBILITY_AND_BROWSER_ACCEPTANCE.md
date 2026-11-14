# Accessibility and browser acceptance checklist

Run against the deployed staging build with keyboard-only and screen-reader checks. This is a checklist; no browser session was available during this archive review.

## Browser matrix

- Chrome / Edge desktop: current stable.
- Firefox desktop: current stable.
- Safari macOS: current stable.
- Chrome Android: current stable.
- Safari iOS: current stable.

## Keyboard-only checks

- Every interactive control is reachable using Tab / Shift+Tab.
- Focus order follows visual and reading order.
- Focus indicator remains visible in light and dark themes.
- Dialogs trap focus, close with Escape where appropriate, and restore focus to the opener.
- No keyboard trap in navigation, lesson flows, checkout or admin tables.
- Form validation moves focus to the first invalid field and announces errors.
- Buttons have action-specific names; icon-only buttons have accessible labels.

## Screen-reader checks

- Page title and main landmark are announced.
- Headings follow a logical hierarchy.
- Form labels, required state and validation messages are associated correctly.
- Loading, sync failure and payment status changes are announced without requiring a visual toast.
- Tables expose header relationships and meaningful row/column context.
- Progress, streaks and scores are not communicated by color alone.

## Responsive checks

- At 320 CSS px wide, no essential content is clipped.
- At 200% zoom, primary workflows remain usable.
- Sticky navigation does not cover focused controls.
- Admin tables remain readable through responsive overflow or stacked layouts.
- Checkout works on touch screens and does not rely on hover.

## Contrast and motion

- Text and control contrast meet WCAG 2.2 AA targets.
- Focus indicators meet non-text contrast requirements.
- Reduced-motion preference is respected.
- Status colors have text/icon labels.
- Error states are distinguishable without color alone.

## Critical end-to-end workflows

1. New user signup, email confirmation and Google login.
2. Complete onboarding and resume an existing learning roadmap.
3. Complete a lesson, practice set and mock; confirm XP/streak/progress persist.
4. Sign in on a second device; confirm the same account progress appears.
5. Go offline while updating progress, reconnect, and confirm queued changes sync without losing newer snapshots.
6. Start Razorpay checkout with a test account; verify success, cancel, pending and retry states.
7. Deliver the same signed webhook twice; confirm one payment ledger row and one entitlement extension.
8. Verify a payment while the webhook is delayed; confirm both paths converge.
9. Complete affiliate application and verify commission attribution, eligibility and payout history.
10. Open `/admin/content`; confirm AAL2 is required and review/publish controls work.
11. Attempt student access to admin routes and another user's records; confirm denial.
12. Delete a test account; confirm learning data is erased and financial audit records are retained according to policy.

# StudyBench — release blocker remediation (2026-11-13)

## Changes completed

1. **Payment plan identity:** Applied additive Supabase migration `20261113143507_payment_plan_identity_for_referral_admin`. It adds nullable `payments.plan_key` and backfills it from matching affiliate commission rows. Verified the column exists and migration is recorded. No payment, entitlement, commission or payout rows were otherwise modified.
2. **Referral plan reporting:** Admin referral and individual affiliate dashboard payment queries now select `payments.plan_key`; plan labels prefer the server-resolved plan key and fall back to verified amount for legacy rows. Affiliate conversion count now includes referred users with a captured payment even when no commission row exists.
3. **General learning roadmap:** Subject roadmap cards now expose separate Chapter Recall and Chapter Practice nodes. Recall is disabled until all lesson checkpoints are passed; Chapter Practice is disabled until Recall completion. The links target the existing chapter anchors and preserve the 70% assessment requirement.
4. **Encoding:** Repaired common UTF-8 mojibake in bookmarks, chapter loading text and authored PYQ explanations/comments.

## Validation completed

- `node scripts/check-client-content-boundary.mjs` — passed.
- `node scripts/check-release-dependencies.mjs` — passed.
- `node scripts/check-next-app-directory.mjs` — passed.
- Supabase migration history confirms `20261113143507_payment_plan_identity_for_referral_admin`.
- Supabase information_schema confirms `public.payments.plan_key` exists.

## Remaining release blockers / limitations

### 20-question content coverage is NOT fixed by this patch

The question builder intentionally refuses to borrow unrelated questions to pad a lesson. Earlier source audit found only 8 lessons with 20 mapped questions, 314 with fewer than 20, including 6 with none; programming/coding lessons were particularly incomplete. Creating thousands of high-quality, topic-aligned, answer-verified questions requires curriculum authoring and validation, not generated filler. Until that work is complete, affected lessons must be treated as content-incomplete and must not be represented as having a full 20-question checkpoint.

### Learning progression integrity still needs architectural work

`company_progress` currently has an owner-write RLS policy and the client syncs the complete chapter JSON. This permits a determined user to alter their own progress state. Ownership scoping prevents cross-user writes, but does not make scores or progression authoritative. A secure fix requires moving progression mutations behind authenticated server endpoints/RPCs that validate card completion, answer keys, scoring, sequencing and chapter thresholds, then restricting direct client writes. This patch does not pretend that owner-scoped RLS alone solves that issue.

### Full validation not completed

Vitest, TypeScript typecheck, production build and browser/E2E checks were not run because dependencies were unavailable in the environment. Do not treat this package as production-launch approved until those checks pass and the question-bank and progression-integrity work above is complete.

## Production database impact

The only production schema change in this remediation is an additive nullable column plus a backfill from existing commission records. The migration was applied and verified. No financial records, payout states, referral attribution, or entitlements were changed.

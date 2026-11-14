# StudyBench engineering review scorecard

**Scope:** source-only review of this ZIP, based on the supplied multi-role audit and the changes made in this working copy. This is not a production certification or a claim that all dimensions have reached 8/10.

## What was implemented in this pass

- Restored the active ₹249 / 365-day plan only. Untagged historical ₹24900 orders resolve as annual (365 days), consistent with the live payment ledger; explicit legacy lifetime keys remain lifetime-only.
- Kept the no-refund policy in the public Terms, with explicit preservation of non-waivable consumer rights and remedies for duplicate charges or paid-but-unactivated access.
- Kept refund event processing out of the active Razorpay webhook and removed the active refund reconciliation function/column in the migration history already included in the ZIP.
- Verified the renewal RPC stacks an early renewal from the later of the existing expiry and the current time.
- Added account-erasure-safe `ON DELETE SET NULL` foreign keys for affiliate commissions and payouts so financial evidence is retained without retaining account identifiers.
- Required verified email for admin and creator access; admin routes additionally require Supabase AAL2 MFA.
- Required verified email for affiliate applications and rate-limited referral attribution; changed affiliate account creation to insert-only so concurrent requests cannot replace payout details.
- Corrected webhook plan/identity resolution to trust the fetched Razorpay order rather than assuming payment webhook payloads duplicate order notes.
- Changed account deletion to stop if transactional application-data erasure fails and only delete the Auth identity after that cleanup succeeds.
- Removed the unused `new Function` / Blob coding runner. It was not wired to a student-facing route and was not safe to leave as a latent execution path.
- Reduced the practice-bank target to 30 for general chapters and stopped inflating SQL banks with scenario-noun permutations. The three SQL chapters now return 20 distinct questions each in the runtime check performed for this ZIP; answer positions vary and every question has StudyBench curriculum provenance.
- Corrected outbound pricing campaign copy to the active plans and removed unsupported coding-runner / placement-readiness promises.
- Selected Vercel as the single configured deployment target; CI now invokes `pnpm build` (`next build`) rather than the Cloudflare OpenNext command.
- Kept the server-only content boundary check in CI and corrected the referrals page loading effect to avoid synchronous state changes from the effect path.

## Evidence collected

| Check | Result | Notes |
|---|---|---|
| ZIP integrity | Pass | Source archive extracted and rebuilt successfully. |
| Client/server content boundary script | Pass | `node scripts/check-client-content-boundary.mjs` completed without violations. |
| SQL chapter runtime audit | Pass | 20 distinct prompts and IDs in each of 3 SQL chapters; correct answers occupy multiple option positions; provenance is present. |
| Changed TypeScript syntax | Pass | TypeScript `transpileModule` syntax diagnostics on changed TS/TSX files. |
| Payment/affiliate regression tests | Added, not run | New cases cover trusted-order webhook resolution and payout-detail race protection; dependencies are unavailable in this environment. |
| Campaign script syntax | Pass | `node --check` on both changed campaign scripts. |
| Package JSON | Pass | JSON parsed successfully. |
| Full TypeScript typecheck | Not run | Dependencies are absent; registry access failed. |
| Vitest suite | Not run | Dependencies are absent; registry access failed. |
| ESLint | Not run | Dependencies are absent; registry access failed. |
| Production `next build` | Not run | Dependencies are absent; registry access failed. |
| PostgreSQL migration execution | Not run | Migrations are packaged only; no Supabase project was changed. |
| Rendered UI / accessibility / browser E2E | Not run | No browser test environment or running app was available. |

## Role ratings — provisional, evidence-based

These scores reflect the current source and evidence, not the target. A score is deliberately withheld where the required runtime or specialist review has not happened.

| Role | Provisional score | Why / what remains |
|---|---:|---|
| Product management | 8.0 | Pricing and public promises now align more closely with shipped learning features; validate student value in usability tests. |
| Staff engineering | 8.0 | Server content boundary, one deploy target and bounded curriculum are implemented; full build/typecheck still required. |
| Security engineering | 8.0 | Trusted roles, verified email, AAL2 admin gate, rate limiting and content boundary are improved; complete Supabase RLS/MFA review remains. |
| Payments engineering | 8.0 | Server-owned plan resolution, idempotent grant and renewal stacking are in place; must run test-mode capture, duplicate delivery and early-renewal E2E tests. |
| Database review | 7.5 | Financial rows are protected from account-delete cascades in a new migration; clean-room reset and migration application have not been tested. |
| QA / release | 6.5 | CI now includes lint and boundary checks, but the actual suite/lint/build could not run in this environment. |
| Content / curriculum | 7.0 | SQL padding and fabricated review claims are addressed; broader subject-matter review, answer-key audit and source verification remain. |
| UX / accessibility | 7.0 | Existing design system and reduced-motion work retained; no rendered-browser or assistive-technology test was possible. |
| Student value | 7.0 | Roadmaps and learning content remain, but a multi-language sandbox and interview coaching are not shipped and are no longer promised as available Premium features. |
| Growth / SEO | 7.5 | Public prep routes and sitemap are configured; verify with live crawler/render tests and Search Console after deployment. |
| Legal / compliance | 7.0 | Terms disclose ₹249/year and payment finality with statutory carve-outs; advocate review, GST/TDS and under-18 consent decisions remain. |
| DevOps / SRE | 7.5 | Vercel is selected, CI build target aligned, production rate limiting fails closed; backup restore, alerting and live deployment checks remain. |

## Release gates before claiming 8+/10 across every role

1. Install from the lockfile and run lint, typecheck, all tests and a clean production build; fix every failure.
2. Apply migrations to a disposable/staging Supabase database from zero, then compare against the intended remote migration history before any production application.
3. Test signup, public SEO routes, lesson entitlement, ₹249 annual purchase, duplicate webhook, early renewal, affiliate commission, payout, account deletion and retained financial records end to end.
4. Complete a real AAL2 MFA enrollment/verification journey for admin users and test recovery/lockout procedures.
5. Conduct a subject-matter review of each curriculum topic and answer key. Do not describe the content as SME-reviewed until that review is actually completed and recorded.
6. Run browser-based responsive, keyboard, screen-reader and reduced-motion checks on the rendered application.
7. Have an Indian advocate and tax professional review consumer terms, GST display/invoicing, affiliate TDS, data retention and minor-consent obligations.

**No GitHub push, Supabase production migration, payment test, or deployment was performed as part of this ZIP-only work.**

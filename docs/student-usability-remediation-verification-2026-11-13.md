# StudyBench student usability remediation — 13 November 2026

## Scope
Resolved the actionable source-level findings from the supplied student usability walkthrough. This is a source remediation and static verification report, not a claim of real-user or browser usability testing.

## Fixes
1. **Conditional onboarding language requirement**
   - Non-programming focus areas may continue with zero selected languages.
   - Programming focus requires at least one language.
   - The default selected-language list remains empty and the step explains when language selection is optional.
2. **Dashboard focus relevance**
   - Selected learning focus is sorted first.
   - A Programming languages roadmap card is added only when the student has selected one or more programming languages, and is promoted first for programming focus.
   - The programming-language panel no longer includes SQL & DBMS as a language; SQL & DBMS remains part of CS Core.
   - Other paths remain available through Explore all paths.
3. **Practice count transparency**
   - The active quiz now displays `Question X of Y available lesson questions` for lesson checkpoints.
   - The result screen reports the actual number attempted against the 20-question target and warns when the available bank is shorter.
   - No unrelated filler questions are added.

## Verification performed
- `node scripts/check-client-content-boundary.mjs` — passed (59 client entry points scanned transitively).
- `node scripts/check-release-dependencies.mjs` — passed.
- `node scripts/check-next-app-directory.mjs` — passed.
- TypeScript transpile/parser syntax diagnostics — passed for all four modified TSX files.
- Source-level acceptance assertions — 9/9 passed.

## Remaining verification limits
- `node_modules` is absent. Full `tsc --noEmit`, ESLint, Vitest and `next build` were not run.
- No running Next.js server was available; Playwright/browser, keyboard execution, mobile viewport, real touch/swipe, auth and database E2E checks were not run.
- The walkthrough is not a moderated study with actual students.
- No live Supabase records, migrations, payment settings or production deployment were changed.

## Manual acceptance scenarios
1. Select Aptitude, deselect every language, and complete onboarding.
2. Select Logical & Verbal, leave languages empty, and confirm the plan summary does not imply a selected language.
3. Select Programming, leave languages empty, and confirm Continue is disabled; select Python and continue.
4. Select Aptitude and confirm Aptitude is first on the dashboard and no programming language panel appears.
5. Select CS Core and confirm CS Core is first; SQL & DBMS is inside CS Core rather than mislabeled as a language.
6. Select Programming + Python and confirm Programming languages is first and Python is available.
7. Open a lesson with fewer than 20 questions; confirm the active quiz shows the actual available count and the result screen reports the same count against the target.
8. Confirm all non-selected learning paths remain reachable through Explore all paths.

## Release recommendation
The source-level issues in the report are addressed and static checks pass. Do not mark the experience browser-verified or launch-ready until dependencies are installed and the manual/browser acceptance scenarios are completed on desktop and mobile.

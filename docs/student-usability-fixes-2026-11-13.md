# StudyBench student usability fixes — 13 November 2026

## Implemented

### 1. Programming language selection is conditional
- Programming-first students must select at least one language to continue.
- Students focused on aptitude, logical/verbal, CS core, or DSA may leave the language selection empty.
- The language step explains that it is optional for non-programming priorities and that languages can be added later.
- The study-plan summary no longer implies that a language was selected when none was chosen.
- The confidence question now names the student's selected focus.

### 2. Dashboard prioritizes the selected learning focus
- Learning path cards are ordered with the student's selected focus first.
- Programming language chips are no longer populated with a default Python path when the student selected no language.
- The programming languages panel is hidden when no language has been selected, reducing irrelevant content for non-programming students.
- Other learning paths remain discoverable through the existing Explore all paths link.

### 3. Practice question count remains visible after completion
- Lesson checkpoint result actions now state how many questions were attempted against the 20-question target.
- When the bank is short, the result clarifies that scoring used only the available reviewed questions.

## Validation

Passed:
- `node scripts/check-client-content-boundary.mjs`
- `node scripts/check-release-dependencies.mjs`
- `node scripts/check-next-app-directory.mjs`

Not completed:
- Full TypeScript typecheck and production build. Global `tsc` is present, but the project dependencies and type declarations are absent (`node_modules` is missing), so typecheck reports missing `next`, `react`, Supabase and other package declarations.
- Vitest, Playwright, real browser/mobile testing, live auth/database testing and moderated student sessions.

No Supabase data, migrations, production deployment, or live user records were changed.

## Manual acceptance scenarios for the next browser run

1. Choose Aptitude, deselect all programming languages, continue through onboarding, and confirm setup completes.
2. Choose Logical & verbal, deselect all programming languages, and confirm the plan summary says no language was selected.
3. Choose Programming, deselect all languages, and confirm Continue is disabled with a clear explanation.
4. Choose Programming and Python, finish onboarding, and confirm Python is visible in the dashboard.
5. Choose Aptitude and no language, finish onboarding, and confirm Aptitude is the first roadmap card and no programming-language panel is shown.
6. Choose CS core and no language, finish onboarding, and confirm CS core is prioritized while other paths remain discoverable.
7. Complete a lesson checkpoint with fewer than 20 questions and confirm the result states the actual attempted count and the target.

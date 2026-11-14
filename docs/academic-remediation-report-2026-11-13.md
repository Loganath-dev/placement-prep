# StudyBench academic remediation report — 13 November 2026

## Scope

This remediation pass used the current `studybench-academic-content-audit-2026-11-13.zip` source archive. It inspected the 50 statically authored general curriculum chapters (103 lesson records), the generated programming-language curriculum, SQL/DBMS chapters and DSA chapters.

This is a source-level content and structure review. It is not an independent subject-matter-expert certification, a full learner usability study, or a production acceptance test.

## Changes made

### 1. Chapter practice bank expansion

- Added **62 original questions** across the 21 thin general-curriculum chapter banks.
- Added **70 original questions** across the 14 DSA chapters (five per chapter).
- The general chapters previously below eight questions now meet the eight-question minimum.
- The DSA chapters previously had three questions each; they now have eight.
- Existing language-path templates already provide eight questions per chapter; SQL/DBMS chapter banks already meet the eight-question minimum.
- New question provenance is recorded as `studybench-original-2026` for general content and `studybench-curriculum` for the DSA set. These are original StudyBench practice items, not official PYQs.

### 2. Lesson explanation improvements

Expanded five short lessons:
- Data pipeline basics
- SDLC and bug reports
- Git and collaboration
- CI/CD and environments
- Scaling vocabulary

Each now includes clearer definitions, practical examples, common mistakes and a recap. The general curriculum's five lessons that were below 60 words now exceed the structural minimum.

### 3. Question-to-lesson mapping integrity

Removed the fallback that borrowed a question from the most populated lesson when another lesson had no match. A question is now assigned only when it has an explicit matching lesson ID or a sufficiently meaningful topic match. Unmatched items remain unassigned so the content gap can be fixed by a content author rather than hiding the mismatch.

### 4. Regression tests

Added coverage assertions:
- General chapter banks must contain at least eight questions.
- General lesson explanations must exceed 60 words.
- Programming/DSA/SQL chapter banks must contain at least eight questions.
- Existing lesson mapping tests continue to verify that unrelated questions are not round-robin distributed.

## Validation performed

- TypeScript parser syntax diagnostics: no parse errors in the changed files.
- Static question structure scan: 1,004 authored general `q()` calls and 164 programming `makeQuestion()` calls inspected; no malformed option counts, duplicate options within an item, or out-of-range answer indexes found. The 70 new DSA items were checked for four distinct options and valid answer indexes.
- The scan identified four repeated prompts already present in the broader general source; they are not newly introduced by this remediation and remain a separate cleanup item.
- ZIP integrity: verified.

## What is not certified

- The automated scan cannot prove every answer is factually correct, every distractor is unambiguously wrong, or every explanation is pedagogically effective.
- The 60-word floor is a structural signal, not proof of clarity. A human reviewer should still check prerequisites, worked examples, accessibility and language level.
- No full Vitest suite, ESLint run, `tsc --noEmit`, Next.js production build, browser-based student usability test or live Supabase integration test was completed in this environment.
- No database migration, live content publication or deployment was performed.

## Academic source and licensing policy

The new questions are independently authored and should be checked against authoritative references before publication. Suggested references include:

- OpenDSA: https://opendsa.org/home/books — DSA concepts and exercise design; verify the exact module and third-party asset licence.
- Python documentation: https://docs.python.org/3/tutorial/ — Python language behaviour and examples.
- PostgreSQL documentation: https://www.postgresql.org/docs/current/tutorial.html — SQL and relational database behaviour.
- OpenStax: https://openstax.org/subjects/math — mathematics explanations; check each book's exact licence.
- Harvard CS50P: https://cs50.harvard.edu/python/license/ — useful teaching sequence, but its non-commercial licence is not suitable for direct adaptation in a paid product without permission.

Do not copy or adapt NC/ND material into StudyBench Premium without permission. Preserve source title, author/publisher, URL, exact licence and access date for any material used. Reference use does not imply permission to reproduce content.

## Release recommendation

This remediation improves the breadth of practice and removes a dangerous question-borrowing behaviour. It is **not** a declaration that all StudyBench content is academically verified. Before marketing the product as fully reviewed, complete a human review pass for each subject and validate every question key and explanation against its source.

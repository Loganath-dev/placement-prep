# StudyBench content-quality progress — V11.1

## Implemented in this iteration

- Expanded the authored SQL/DBMS query-practice bank with schema-based scenarios for filtering, sorting, aggregation, `HAVING`, `INNER JOIN`, `LEFT JOIN`, and anti-join reasoning.
- Added deterministic difficulty labels and explanatory feedback for the practical query questions.
- Extended the content-quality audit to assert that the SQL practice bank contains the practical query families and that authored items have answer options and substantive explanations.
- Clarified that SQL multiple-choice query selection is not equivalent to a query execution judge.
- Preserved the V11 premium delivery and publication workflow changes, and preserved removal of `lib/data/coding-problems.ts`.

## Validation status

- Client/server content boundary script: passed.
- TypeScript syntax transpilation for the changed source and audit test: passed.
- ZIP integrity: verified when packaging this iteration.
- Full TypeScript project check: blocked because project dependencies and type packages are not installed in this workspace. The emitted diagnostics include missing React, Next.js, Supabase and Vitest modules/types; therefore this is not a successful typecheck.
- Vitest suite and production build: not run.
- Supabase migration `0034_content_quality_workflow.sql`: not applied.

## Academic status and remaining work

The new questions are authored StudyBench practice, not verified company questions or previous-year questions. They have not yet received independent subject-matter-expert approval. SQL practice still needs a sandboxed query-execution environment with deterministic datasets and hidden tests before StudyBench can claim practical SQL execution proficiency.

The next review pass should independently solve each question, inspect every distractor, verify dialect assumptions, improve the full lesson explanations with worked datasets, and record reviewer identity and evidence before publication.


## V11.2 academic-depth iteration

- Expanded the SQL/DBMS joins-and-transactions chapter with explicit CTE/subquery reasoning, NULL three-valued logic, `NOT IN` pitfalls, and window-function ranking (`ROW_NUMBER`, `RANK`, `DENSE_RANK`).
- Added PostgreSQL-flavoured worked examples and clarified that CTEs improve query structure but are not inherently faster.
- Added an isolation/concurrency scenario to connect ACID concepts to a real reservation problem.
- Added focused authored questions for `EXISTS`, NULL semantics, `PARTITION BY`, and `DENSE_RANK`, with explanations.
- Added regression assertions requiring the lesson and assessment coverage to remain present.

These remain curriculum-authored learning materials, not SME-approved certification or employer-verified interview questions. No SQL execution sandbox is included in this iteration.

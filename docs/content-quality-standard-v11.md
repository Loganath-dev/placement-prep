# StudyBench V11 — Content Quality Standard

## Release principle

A structurally valid question is not automatically an academically verified question. Content is published only after an independent reviewer checks the actual question, answer key, explanation, difficulty, source/provenance and duplication. Passing automated tests is necessary, never sufficient.

## Question classifications

- `verified_previous_year`: exact exam/company paper, year, and publicly accessible source URL have been checked. The record must include `source_id`, `source_url`, and `source_checked_at`. If the exact paper cannot be verified, do not use this label.
- `company_pattern_practice`: original StudyBench content targeting a documented skill or assessment style. It is not represented as an actual company question.
- `topic_revision`: original concept practice not claiming a company or historical provenance.
- `mock_question`: an original item belonging to a mock assessment.

## Independent review checklist

For every question version, a reviewer other than the recorded author checks:

1. The prompt is unambiguous and tests the stated learning objective.
2. The answer key is independently solved or executed; all valid interpretations are considered.
3. The explanation teaches the underlying method, not merely repeats the answer.
4. Every distractor is plausible and its misconception is understood.
5. Difficulty matches the prerequisite knowledge and expected solving time.
6. Sources support factual claims; no copyrighted question/solution is copied.
7. Duplicate and near-duplicate checks are complete.

An approval record requires all five machine-recorded checks (answer key, explanation, source, difficulty and duplicate review). Human review notes remain mandatory in the operating checklist. A content edit increments the version and invalidates the prior approval; it must be reviewed again.

## SQL/DBMS progression

The SQL path should progress from relational tables and keys to filtering/projection, aggregation, joins, subqueries, CTEs, window functions, normalization, transactions/isolation and query reasoning. Practice should increasingly ask learners to write or reason about queries against a defined schema. The current authored practice layer includes schema-based query selection for filtering, sorting, aggregation, HAVING, INNER/LEFT JOIN and anti-join reasoning, alongside subquery, CTE and window-function concepts. Multiple-choice recall alone is not sufficient evidence of SQL proficiency. Before claiming practical SQL proficiency, add a sandboxed query-execution environment with deterministic datasets, engine-specific expectations, edge-case tests and hidden test cases; do not execute learner SQL against production data.

## Delivery and answer-key security

The question-bank API returns prompt/options/metadata only. Answer keys, explanations and per-option notes are fetched only after an authenticated submission is graded server-side. Premium tier selection is derived from the server-side entitlement, never from a client-supplied flag. Responses are private and non-cacheable. The service-role key is server-only.

## Current maturity statement

The repository contains starter/curated material and automated structural checks. It is not a 5,000-question, independently SME-certified bank. A question must not be advertised as verified or a course as fully SME-reviewed until the review records and source evidence exist for the released content. Seeded rows default to `topic_revision` and remain unreviewed unless explicitly approved. Chapter assessment pools must not be padded with random section-wide questions; expose the actual topic-specific count and maintain an authoring backlog instead.

## Evidence required before launch

- Apply migration `0034_content_quality_workflow.sql` in a reviewed staging environment, then production only after backup and migration review.
- Populate and verify the content datastore; inspect live counts by section/tier/status.
- Record named independent reviewer decisions for each published version.
- Test free/premium access using real authenticated accounts and inspect network responses for answer-key leakage.
- Run unit, type, lint, boundary and production-build checks.
- Conduct a subject-matter review of the complete learner journey and all released explanations.


## V11.1 implementation notes

- Added schema-based SQL query scenarios to the SQL/DBMS authored practice supplement.
- Added regression assertions for practical SELECT, aggregation, HAVING, INNER JOIN, LEFT JOIN and anti-join coverage.
- The authored query-choice exercises are still multiple-choice practice. They are not an SQL execution judge, and they have not been independently SME-certified.
- The SQL path remains a compact curriculum bank. Do not advertise a specific question count or certification level without measuring the actual published inventory and completing independent review.

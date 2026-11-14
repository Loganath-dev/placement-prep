# StudyBench content publication workflow

## Mock-test lifecycle

Mock tests use `publicationStatus` with five explicit states:

- `draft`: authoring only; visible through the MFA-protected admin preview endpoint.
- `in_review`: visible only to authenticated reviewer-role accounts through the review endpoint.
- `approved`: reviewed and ready for an administrator to publish; not student-visible.
- `published`: the only state returned by the student mock API.
- `archived`: retained for audit/admin inspection, never returned for new student attempts.

The student endpoint filters by `publicationStatus === "published"` before selecting an index, checking entitlements, or generating questions. This prevents a draft from leaking through a locked-mock response as well as through a normal response.

Admin preview: `GET /api/content/mock-review` requires an admin identity and AAL2. Reviewer preview requires `app_metadata.role === "reviewer"` and only returns `in_review` items. Student clients must never call the review endpoint.

Current seeded simulations intentionally remain `draft`. They must not be published until a named subject-matter reviewer verifies the question set, answer keys, timing, source notes and assessment claims. Changing a record to `published` is an explicit release decision, not an automatic consequence of passing structural tests.

## Practice-library classification

Every practice question has a `contentKind`:

- `verified_previous_year`: exact paper and year checked against a reliable paper source; `year` is required for this classification.
- `company_pattern_practice`: original question written to practise a company-style skill or assessment pattern.
- `topic_revision`: original topic-focused revision question.
- `mock_question`: question belonging to a published mock.

The current seeded collection contains company-pattern practice and topic revision only. No seeded question is represented as a verified historical PYQ. Programmatic position, seed, or template order must never be used to infer an exam year or frequency.

## Coding answer-key review

A coding problem remains draft until all visible and hidden test cases have been checked against an independently written reference calculation/solution. Regression tests in `lib/coding-answer-regression.test.ts` protect the previously identified digit-sum, diagonal-difference and longest-consecutive examples.

## Progress synchronization

The durable per-user snapshot queue is the recovery source for lesson progress, mistakes, mistake review schedules, mistake deletions, drive outcomes and outcome deletions. It is cleared only after the full sync and remote-ID reconciliation succeed. If browser storage cannot persist the queue, the operation emits a non-recoverable-local-storage error rather than claiming it was safely queued.

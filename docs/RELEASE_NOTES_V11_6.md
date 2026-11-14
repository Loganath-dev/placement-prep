# StudyBench V11.6 release notes

## Added

- MFA-protected `/admin/content` workspace within the existing admin shell.
- Draft, reviewed, live and retired queue filters.
- Prompt/topic/ID search and review-history display.
- Explicit content-author attribution for legacy rows.
- Five-part academic review checklist with reviewer notes.
- Transactional database RPCs for review and publish.
- Separate retirement and restore-to-draft actions.
- Version invalidation trigger: substantive content or author changes increment the version, clear review/publication metadata and return the question to draft.
- Navigation entry from the admin sidebar, mobile admin menu and admin overview.

## Safety rules

- Approval requires all five checks and a recorded author.
- Authors cannot approve their own questions.
- Only draft questions can enter review.
- Only the current reviewed version can be published.
- Only live rows are delivered by the existing server-side question API.
- Existing free/premium delivery and answer-key withholding behavior is retained.
- RPCs are executable only by the Supabase service role; the API independently verifies admin status and MFA AAL2.

## Migration

Apply `0035_content_review_workflow.sql` after `0034_content_quality_workflow.sql`, first on staging. Do not apply automatically or directly to production.

## Scope boundary

This workspace governs the database-backed `content_questions` bank. Static PYQ and mock banks continue to use their own code-level governance and are not represented as reviewed by this feature.

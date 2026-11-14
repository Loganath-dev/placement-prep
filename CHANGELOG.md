# Changelog

## 2026-11-13 — Student-local calendar and streak reliability

- Replaced UTC-derived streak and challenge date keys with browser-timezone calendar keys.
- Aligned daily challenge API seeding and daily/weekly completion indicators with the student's IANA timezone.
- Added strict timezone validation and bounded formatter caching.
- Added regression tests for India/US timezone boundaries, week starts, leap days and date arithmetic.
- Documented student-facing behavior and acceptance criteria; no database migration is required.

## 2026-11-13 — Repository audit and security remediation

- Moved the Next.js App Router from `components/app/` to the framework-recognized root `app/` directory and updated internal aliases.
- Added a CI structural check that prevents the route tree from drifting outside `app/`.
- Added same-origin validation for authentication callback and login redirect destinations, including backslash-based URL authority bypasses.
- Replaced callback referral upsert with insert-first and null-only conditional update behavior to preserve first attribution during concurrent callbacks.
- Added regression coverage for redirect validation and referral attribution races.
- Documented the updated authentication/referral acceptance criteria and audit evidence.

## 2026-11-12 — Affiliate and learning remediation

- See `STUDYBENCH_REPAIR_NOTES_2026-11-12.md` for the prior affiliate payout snapshot, admin resilience and learning-content changes.

## 2026-11-13 — Premium content boundary hardening

- Enforced the current chapter entitlement again when building daily challenges; stale or manipulated completion state can no longer make a Free account eligible for Premium chapter questions.
- Applied the same Free difficulty and question-count restrictions to daily challenges as chapter practice.
- Restricted public company-prep sample questions and JSON-LD to free starter chapters.
- Strengthened the client/server curriculum boundary check to traverse transitive local imports from every client entry point and ignore erased type-only imports.
- Added regression tests for Free/Premium daily challenge question filtering and documented the server authorization model.

## 2026-11-13 — Lesson-scoped learning and checkpoints

- Rebuilt learning cards per authored lesson; card IDs and `lessonId` values are now scoped to the real lesson instead of the synthetic `chapter` ID.
- Reworked the chapter learning screen into a lesson navigator with per-lesson card progress, resume behavior and visible checkpoint scores.
- Added an entitlement-checked lesson-practice endpoint that verifies the requested lesson's cards are complete before returning its question set.
- Persisted lesson checkpoint attempts with their lesson ID without marking the chapter passed or unlocking the next chapter.
- Preserved the separate chapter assessment as the only assessment that can pass a chapter and unlock the next one.
- No SQL migration required; the existing JSON progress structure is extended compatibly.


## 2026-11-13 — Lesson mastery and review flow

- Added a shared 60% lesson-checkpoint mastery rule; card completion alone no longer marks a lesson passed.
- Preserved older learner progress by recovering passed lessons from prior lesson-practice attempts.
- Locked later lessons until the previous checkpoint is passed; passed lessons remain revisitable.
- Kept chapter assessment separate at 70% and require all visible lesson checkpoints to be passed before it opens.
- Removed the inner scroll area from learning cards and split long prose into shorter card screens while retaining stable IDs for the first card in each group.
- Added missed-question explanations to failed practice results and made the 20-question target/content gap visible rather than padding with unrelated questions.
- Moved daily and weekly review sourcing to passed lesson question sets and linked included lessons back into the roadmap.
- Added explicit lesson mapping and topic-tag support for questions, with conservative title matching and a legacy fallback for untagged banks.
- Added the learning-content quality and open-license standard in `docs/learning-content-quality-standard.md`.

Validation note: syntax transpilation passed. Full typecheck, test suite and production build require the project's dependencies; they were not installed in this environment.

## 2026-11-13 — Chapter recall and stricter lesson question mapping

- Added a chapter-wide Recall node after all lesson checkpoints and before the chapter assessment. It generates 1–3 flashcards from the taught lesson content, prioritises formulas/rules/shortcuts, and represents every lesson in the chapter.
- The chapter assessment remains a separate 70% pass gate; recall completion is persisted in chapter progress and enforced by the chapter-practice API, not only by the client UI.
- Removed section-wide random question padding from chapter assessments. Lesson mapping now uses lesson title and body, then allocates an otherwise unmatched item only within its own chapter to prevent an empty lesson checkpoint; no cross-chapter filler is used.
- Removed generic strategy-only lesson nodes and stale "100 practice questions" promises from the roadmap.
- Added source provenance to every database seed question and persisted it to `content_questions.source_id`; corrected an ambiguous syllogism and a C loop-scope example.
- Removed synthetic string distractors, fixed a coding-decoding distractor collision and sampled 70,000 generated questions with no structural failures.
- Added primary technical reference records for C, C++, Java, Python, JavaScript, C#, PHP, DSA and PostgreSQL.
- Runtime-checked 168 chapters, 341 lessons, 1,832 chapter quiz items, 1,786 chapter practice items and 340 recall cards; no lesson checkpoint was left without a question. Identified 34 thin chapter banks for further authoring.
- Added whole-curriculum recall-deck coverage tests and documentation for content review and commercial-use licensing.


## 2026-11-13 — Academic remediation follow-up

- Added 62 original questions to 21 thin general-curriculum chapter banks.
- Added 70 original topic-specific questions across 14 DSA chapters.
- Expanded five short CS-core lessons with definitions, worked context, common mistakes and recaps.
- Removed cross-lesson question borrowing from lesson checkpoint construction.
- Added regression tests for minimum chapter-bank coverage, lesson explanation length and programming/DSA bank coverage.
- Added the academic remediation report and explicit limitations on human SME review and production verification.

# StudyBench V11.3 — academic verification log

## Verified by independent mathematical oracles

- **Percentage change (Data Interpretation):** answer derived independently from old and new values, using the original value as the denominator; the question explicitly asks for two-decimal rounding. The earlier generator rounded the correct answer to an integer without disclosing that approximation.
- **Unit digit (Number System):** independent modular exponentiation oracle checks the generator's answer; explanation now identifies the correct cycle index, including exponents divisible by four.
- Both checks cover multiple deterministic seeds and ensure four distinct displayed options.

## Verification status and limitations

This is a **targeted automated check of two generator families**, not a review of the full question bank. Tests are supplied but should be run in a project environment with dependencies installed. Other quantitative, reasoning, verbal, SQL and CS questions remain **unverified** until independently checked. Do not mark them SME-approved or claim the overall content bank meets 8.5/10. No database migrations were executed.

## Review protocol for the remaining bank

1. Independently solve each question without looking at the recorded answer.
2. Check all distractors for duplicate meanings and multiple valid answers.
3. Validate units, rounding instructions, edge cases, and language ambiguity.
4. Verify explanations with a second method and assign an identifiable reviewer.
5. Record evidence, version, review date, and publish approval in the governance workflow.

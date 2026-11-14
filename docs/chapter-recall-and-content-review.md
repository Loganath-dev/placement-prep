# Chapter recall and academic content review

## Student sequence

1. Complete each lesson's learning cards and pass its lesson checkpoint (60%).
2. Open the **Chapter Recall** node. It contains one to three short retrieval cards selected only from the chapter's taught lesson material. Formula, equation, identity, rule, shortcut and explicit remember blocks are prioritised. The learner reveals and reviews every card.
3. The chapter assessment becomes available after recall is completed in the current chapter visit. The assessment remains a separate assessment and requires **70%** to pass and unlock the next chapter.

Recall is a memory warm-up, not a graded test and not a replacement for lesson learning. The cards are generated from existing lesson text; no unsupported formula or external fact is injected. If a chapter has no authored lesson material, the chapter summary is used as the single fallback recall card and should be flagged for content authoring.

## Review standard for every lesson

- State a measurable learning objective and define unfamiliar terms before using them.
- Explain one idea at a time in plain language, then show a worked example with every important step.
- Include a realistic placement, academic or workplace application where appropriate.
- State assumptions, units, rounding rules, input constraints and edge cases.
- Explain why common distractors or mistakes are wrong.
- End with a concise recap that can become a recall card.
- Keep code runnable and identify language/runtime/version assumptions.

## Review standard for every question

- The question's topic and lesson mapping must match the actual skill being tested, not just share a keyword.
- Solve the item independently; verify the keyed answer, units, options and explanation.
- Make distractors plausible, mutually distinct and unambiguously wrong under the stated conditions.
- Remove duplicates and near-duplicates; vary the scenario and reasoning task, not just names or numbers.
- The explanation must teach the method and address likely misconceptions.
- Tag difficulty based on reasoning demand, not question length.
- Preserve provenance: source title, author/publisher, URL, exact licence, access date and reviewer.
- Keep PYQs distinct from original practice; never label generated or reconstructed items as official PYQs.

## Open-source reference and commercial-use policy

Open resources are references for curriculum review, not permission to copy. StudyBench offers paid plans, so content with a NonCommercial restriction must not be copied, adapted or republished in the paid product without permission. Check the exact licence on each book/resource page and on embedded diagrams, code, assessments and images individually. Prefer independently written explanations and original questions based on general concepts; retain provenance and have a reviewer verify accuracy.

Suggested review references:

- OpenDSA DSA eTextbooks: https://opendsa.org/home/books — useful for algorithm explanations, visualisations and exercise design. Its project licence page identifies the project as MIT-licensed (https://opendsa.org/home/license); verify the licence and attribution for each specific module, image and third-party component before copying it.
- OpenStax *Introduction to Python Programming*: https://openstax.org/books/introduction-python-programming/pages/1-introduction — useful for beginner sequencing and worked examples. The current OpenStax book page states CC BY-NC-SA, so do not reuse or adapt it in StudyBench's paid product without written permission.
- Harvard CS50P licence: https://cs50.harvard.edu/python/license/ — CC BY-NC-SA 4.0; reference for pedagogy, not commercial reuse.
- Official Python documentation: https://docs.python.org/3/tutorial/ — authoritative syntax/runtime reference; check Python documentation terms and third-party marks/assets separately.
- LibreTexts: https://libretexts.org/ — useful when an individual page explicitly states CC BY 4.0; confirm page-level attribution and source provenance rather than assuming every page shares the same licence.

Open resources are references for curriculum review, not blanket permission to copy. StudyBench offers paid plans, so content with a NonCommercial restriction must not be copied, adapted or republished in the paid product without permission. Check the exact licence on each book/resource page and on embedded diagrams, code, assessments and images individually. Prefer independently written explanations and original questions based on general concepts; retain provenance and have a reviewer verify accuracy.

## Spot-check correction made during this pass

A Quantitative Aptitude train-crossing question stated an exact time of 7.2 seconds but keyed 8 seconds by rounding without the prompt requesting approximation. The answer option and explanation were corrected to the exact 7.2 seconds, and a regression test was added so this exact-answer mismatch is not reintroduced.

## Scope and limits of this code change

The chapter recall node and a whole-curriculum structural audit test are added. Existing content-governance and content-quality tests continue to check structural validity, duplicates, provenance and selected topic-specific coverage. Static checks cannot prove that every explanation is understandable to a first-time learner or independently verify every answer in a very large generated bank. Those require a human subject-matter review and learner usability testing; the implementation must not claim that such review has already occurred.

# StudyBench learning platform audit — 13 November 2026

## Scope and evidence

Reviewed the current project archive, the chapter catalogue used by the student routes, the server-side lesson content, the hand-authored chapter banks, the language/DSA/SQL curriculum generator, the 48-row Supabase seed, the chapter-practice selection path, and the question generator. The review also cross-checked selected concepts against official technical documentation and openly licensed reference material.

This is a source-level academic and product audit. It is not a complete independent subject-matter-expert certification or a learner usability study. Full Vitest and Next.js production build were not run because dependencies are not installed in this working copy.

## Curriculum inventory

- Seven company selections plus the general selection currently share the same foundational roadmap data; they are not seven independently authored company-specific curricula.
- The student roadmap exposes five learning areas: Quantitative Aptitude, Logical Reasoning, Verbal Ability, Coding/DSA and CS Core. Communication/interview coaching remains a separate experience.
- The student roadmap catalogue contains 160 chapters and 320 substantive lesson entries after removing generic strategy-only lesson nodes. The same 160 chapter IDs and 320 lesson IDs are reused across company selections. The full server content also includes the separate communication/interview area, bringing the general runtime catalogue to 168 chapters and 341 lessons.
- The source contains 942 hand-authored `q(...)` question entries in `lib/data/content.ts` and 94 `makeQuestion(...)` entries in the programming curriculum, before typed recall and SQL supplemental exercises. Runtime validation of the general catalogue found 1,832 chapter quiz items and 1,786 chapter practice items. These are not 5,000 independently authored questions.
- The separate database seed contains 48 flagship questions. Each now has a registered `sourceId` and the seed script persists it to the existing `source_id` column.

## Important corrections made

1. Removed section-wide random question padding from chapter assessments. A question from the same broad section is not necessarily relevant to a particular chapter. Chapter assessment now uses its authored chapter bank; SQL/DBMS retains its separately authored SQL supplement. The actual count is returned rather than inflated to a target. Lesson mapping now also checks the lesson body, and any unassigned question can only be allocated to an empty lesson within the same chapter; it never imports questions from another chapter.
2. Removed generic "hard-question playbook" and "mock-test transfer" lesson nodes from the live roadmap. They were strategy guidance, not substantive lessons in the chapter topic. The catalogue metadata and lesson-content source now agree on the actual lesson list.
3. Removed unsupported "100 practice questions" promises from chapter summaries and rewrote several marketing-style summaries as specific learning outcomes.
4. Added registered technical references for C, C++, Java, Python, JavaScript, C#, PHP, DSA and PostgreSQL/SQL lesson paths. These sources are for fact-checking and attribution, not permission to copy material.
5. Added `sourceId` to every seed question and persisted `source_id` when seeding Supabase.
6. Corrected a syllogism seed item by making the existence assumption explicit. Without that premise, the conclusion that some books are pens is not guaranteed under modern first-order logic.
7. Corrected a C output seed question by declaring the loop variable outside the `for` statement; the original snippet used the variable after a loop scope where it might not exist.
8. Removed unverified employer labels from sample pattern questions so original practice is not mistaken for an official TCS/Infosys/Zoho/etc. paper.
9. Tightened string distractor generation so it fails rather than inventing fake choices such as `answer (1)`. Fixed a coding-decoding generator case that could repeat the correct answer as a distractor.
10. Kept the Chapter Recall node in the student sequence. It reviews 1–3 short cards selected from the chapter's lesson material before the assessment. Recall completion is now persisted in chapter progress and the chapter-practice API enforces it server-side. The assessment pass mark remains 70%; recall completion itself is not a graded pass.

## Question-bank integrity findings

- The previous chapter expansion added randomly selected questions from the entire section and prefixed the chapter title. That created false topic alignment. This padding is removed.
- Some authored chapter banks are small. Runtime validation found 34 chapters with fewer than eight chapter-practice questions (including 14 DSA chapters, several core aptitude/reasoning/verbal/CS chapters and communication chapters). These chapters are exposed with their real counts; they remain a content-authoring backlog, not a reason to reintroduce unrelated filler.
- A 70% threshold is a StudyBench progression rule, not a universal employer cutoff.
- Company selections currently share the same core lesson and question content. Company-specific assessment patterns, eligibility and hiring stages must be maintained separately with current official sources; do not market the shared core bank as a verified company-specific question bank.
- A question marked with a source reference is not automatically a verified PYQ or independently reviewed item. Historical questions require exact paper/year/source evidence; otherwise label them as original topic revision or company-pattern practice.

## Teaching quality standard applied

Each lesson should:
- state a measurable learning objective and define unfamiliar terms;
- explain one concept at a time in plain language;
- show a complete worked example with units, assumptions and intermediate steps;
- include a realistic application or code trace;
- call out a common misconception;
- finish with a short recap suitable for the Chapter Recall node.

Each question should:
- test the lesson/chapter objective, not merely share a broad section label;
- have one defensible answer (or a clearly defined accepted-answer set);
- be independently solved or executed;
- use plausible, distinct distractors;
- explain the reasoning and likely misconception;
- have an honest difficulty label and source/provenance record;
- be checked for duplicates and semantic near-duplicates.


### Thin chapter banks requiring authoring


| Section | Chapter | Current questions |
|---|---|---:|
| quant | `quant-data-interpretation` — Data Interpretation & Tables | 5 |
| quant | `quant-mensuration` — Mensuration: Areas, Perimeters & Volumes | 6 |
| quant | `quant-algebra` — Algebra, Equations & Word Problems | 6 |
| reasoning | `reason-seating-puzzles` — Seating Arrangement & Puzzles | 5 |
| reasoning | `reason-input-output` — Input-Output & Machine Operations | 5 |
| reasoning | `reason-statements` — Statement-Assumption & Statement-Argument | 5 |
| verbal | `verbal-rc` — Reading Comprehension | 5 |
| verbal | `verbal-written-english` — Essay, Email & Cloze Test | 5 |
| verbal | `verbal-critical` — Critical Reasoning: Inference & Conclusion | 5 |
| coding | `dsa-arrays-complexity` — Arrays and time complexity | 4 |
| coding | `dsa-strings-two-pointers` — Strings and two-pointer patterns | 3 |
| coding | `dsa-searching-sorting` — Searching and sorting | 4 |
| coding | `dsa-hashing-frequency-maps` — Hashing, maps and frequency counting | 4 |
| coding | `dsa-recursion-backtracking` — Recursion and backtracking | 4 |
| coding | `dsa-linked-lists` — Linked lists and pointer/reference reasoning | 4 |
| coding | `dsa-stacks-queues` — Stacks, queues and monotonic structures | 4 |
| coding | `dsa-trees-bst-traversal` — Trees, traversals and binary search trees | 4 |
| coding | `dsa-heaps-priority-queues` — Heaps and priority queues | 4 |
| coding | `dsa-graphs-bfs-dfs` — Graphs, BFS and DFS | 4 |
| coding | `dsa-greedy-algorithms` — Greedy algorithms and proof intuition | 3 |
| coding | `dsa-dynamic-programming` — Dynamic programming and state design | 4 |
| coding | `dsa-bit-manipulation` — Bit manipulation and integer representation | 4 |
| coding | `dsa-mixed-problem-solving` — Mixed problem solving and interview-style practice | 3 |
| cs-core | `cs-sql` — Practical SQL | 5 |
| cs-core | `cs-fundamentals` — Computer Fundamentals & Number Systems | 5 |
| cs-core | `cs-cloud-web-apis` — Cloud, Web & API Basics | 5 |
| cs-core | `cs-security-basics` — Cybersecurity & Access Control | 5 |
| cs-core | `cs-ai-data-basics` — AI, Data & Analytics Basics | 5 |
| cs-core | `cs-testing-sdlc` — Software Testing & SDLC | 5 |
| cs-core | `cs-devops-basics` — Git, Deployment & DevOps Basics | 5 |
| cs-core | `cs-system-design-basics` — System Design for Freshers | 5 |
| comm-interview | `comm-resume-projects` — Resume, Projects & Proof of Work | 6 |
| comm-interview | `comm-applications-drive` — Applications, Drive Tracking & Recruiter Follow-up | 6 |
| comm-interview | `comm-interview-capstone` — Mock Interview Capstone & Offer Conversion | 6 |

## Open-resource and book review policy

- OpenDSA is used as a DSA topic and concept reference. Its project licence page identifies MIT licensing for the project; check the specific module and third-party asset before reusing anything.
- OpenStax College Algebra is identified on its book page as CC BY 4.0. Attribute any reused material. Do not assume every OpenStax book has the same licence.
- OpenStax materials generally include CC BY-NC-SA works; non-commercial material must not be copied or adapted into StudyBench's paid product without written permission.
- Python, MDN JavaScript and PostgreSQL official documentation are used to check technical facts and version-sensitive behaviour. StudyBench examples and questions should remain independently authored.
- R.S. Aggarwal and grammar books are concept-sequencing references only. Do not reproduce their exercises or explanations.

## Validation performed in this pass

- ZIP integrity was checked before extraction.
- TypeScript syntax parsing passed for the modified curriculum, generator, source registry and test files.
- The question generator was sampled for 10,000 generated questions per section (`quant`, `reasoning`, `verbal`, `coding`, `cs-core`, `comm-interview`, `mixed`): 70,000 generated items total; all sampled sets had four distinct options and valid answer indices after the distractor correction.
- Runtime validation of the full general curriculum found 168 chapters, 341 lessons, 1,832 chapter quiz items and 1,786 chapter practice items; no lesson checkpoint had an empty practice set after the chapter-local allocation fix.
- All runtime question source IDs resolved to registered sources; no missing lesson bodies, invalid answer indexes or malformed four-option MCQs were found in the structural pass. A lesson-length scan found 79 of 341 lesson bodies under 60 words (median 94 words); many are short application prompts, but they need a human review for enough explanation and worked examples.
- The 48 seed rows were checked for a registered source ID, four option notes and a valid answer index.
- Full Vitest, lint, typecheck and production build remain unverified in this environment because dependencies are absent. No live Supabase migration, seed operation or deployment was performed.

## Remaining academic work — do not mark complete

1. Independently review every answer key and explanation in all 160 student-roadmap chapters, including code execution in the stated language/runtime.
2. Rewrite the 79 short lesson bodies where they lack a worked example or clear explanation; short flashcard copy should not be mistaken for a complete teaching explanation.
3. Increase the 34 thin topic-specific chapter banks to a useful size without padding; author original, reviewed questions for each weak chapter. A 70% pass threshold is mathematically coarse on a 3–6 question assessment (for example, 2/3 is only 66.7%), so these banks should be expanded before high-stakes chapter progression.
4. Perform a semantic duplicate and near-duplicate audit across company and general selections.
5. Add real learner comprehension testing: first-time learners should be able to explain the concept after the cards without relying on answer recognition.
6. Add executable SQL and programming exercises with isolated sandboxes and hidden tests; MCQs alone cannot certify practical coding/SQL skill.
7. Create genuinely company-specific practice only when a current official assessment source supports the format; otherwise label it as general placement practice.
8. Run the complete test suite, lint, typecheck and production build after installing dependencies, then test the live learning flow with free and premium accounts.

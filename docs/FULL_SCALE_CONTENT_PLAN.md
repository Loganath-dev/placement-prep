# Full-Scale Content Plan

This document converts the current seeded StudyBench content into an execution plan for a full-scale placement app.

The current app is a strong starter/MVP content build. To become a serious placement preparation product, the next work is not only "add more questions"; it is to add the right volume, company specificity, timed mocks, coding execution, communication drills, and review metadata.

## Current Inventory

| Area | Current count | Current status |
|---|---:|---|
| Tracks | 7 | TCS, Infosys, Wipro, Accenture, Zoho, Cognizant, General |
| Sections per track | 6 | Quant, Reasoning, Verbal, Coding, CS Core, Communication & Interview |
| Learning chapters | 37 | Shared across tracks, with Zoho coding extra |
| Lessons | 69 | Good MVP foundation |
| Static chapter quiz questions | 167 | Good starter, not enough for full scale |
| PYQ-style questions | 169 | Good demo bank, needs major expansion |
| Interview questions | 45 | Good starter, needs 80+ per company |
| Drill generators | 22 | Useful for scalable MCQ practice |
| Mocks | Basic app-level mock from lesson questions | Needs company-pattern timed mocks |
| Coding execution | Not present as a real judge | Needed before claiming coding readiness |
| Communication speaking drills | Not present as active speaking practice | Needed for Accenture, Wipro, HR rounds |

## Current Learning Coverage

| Section | Current chapters | Current strength | Main gap |
|---|---:|---|---|
| Quantitative Aptitude | 7 | Strong foundation coverage | Needs more DI, algebra, mixtures, time-bound sets |
| Logical Reasoning | 6 | Good common reasoning coverage | Needs seating, puzzles, input-output, data sufficiency |
| Verbal Ability | 4 | Good basics | Needs more RC passages, para jumbles, error spotting, cloze tests |
| Coding & DSA | 8 | Good concept base | Needs real coding problems, tests, editor, difficulty ladders |
| CS Core | 6 | Good DBMS/OS/CN/OOP basics | Needs deeper topic banks and company-specific technical MCQs |
| Communication & Interview | 6 | Good teaching flow | Needs recorded/speaking drills, rubrics, GD topics, essay prompts |

## Current PYQ-Style Bank

| Company | Total | Quant | Reasoning | Verbal | Coding | CS Core | Main gap |
|---|---:|---:|---:|---:|---:|---:|---|
| TCS | 32 | 13 | 7 | 6 | 6 | 0 | Add programming logic, advanced aptitude, CS basics |
| Infosys | 25 | 9 | 6 | 3 | 7 | 0 | Add pseudocode, DBMS/OOP, verbal |
| Wipro | 21 | 7 | 3 | 7 | 4 | 0 | Add essay/written communication and coding |
| Accenture | 22 | 5 | 4 | 1 | 2 | 10 | Add cognitive, pseudocode, communication assessment |
| Zoho | 23 | 0 | 0 | 0 | 23 | 0 | Add many coding levels, debugging, machine-round tasks |
| Cognizant | 19 | 5 | 4 | 4 | 4 | 2 | Add automata/debugging and technical basics |
| General | 26 | 7 | 7 | 5 | 4 | 3 | Add broad foundation practice |

## Current Interview Bank

| Company | Total | Technical | Coding | Domain | HR | Managerial | Main gap |
|---|---:|---:|---:|---:|---:|---:|---|
| TCS | 8 | 3 | 1 | 1 | 2 | 1 | Needs more project, DBMS, OOP, CN, HR variants |
| Infosys | 8 | 3 | 1 | 1 | 2 | 1 | Needs InfyTQ, pseudocode, Java/Python, project questions |
| Wipro | 7 | 2 | 1 | 1 | 2 | 1 | Needs essay follow-up, service agreement, behavioral bank |
| Accenture | 6 | 2 | 1 | 1 | 1 | 1 | Needs cloud, communication, scenario questions |
| Zoho | 8 | 1 | 5 | 1 | 0 | 1 | Needs HR/domain plus deeper DSA/machine-round questions |
| Cognizant | 7 | 2 | 1 | 1 | 2 | 1 | Needs GenC, automata, project, CS fundamentals |
| General | 0 | 0 | 0 | 0 | 0 | 0 | Add general HR, project, communication readiness bank |

## Full-Scale Targets

These are the targets to treat each track as placement-ready.

| Content type | MVP-ready target | Full-scale target |
|---|---:|---:|
| Lessons per section | 8-12 | 15-25 |
| Quiz questions per chapter | 8-12 | 15-25 |
| PYQ-style questions per service company | 200 | 500+ |
| PYQ-style questions for Zoho | 250 | 600+ |
| Coding problems per service company | 80 | 150 |
| Coding problems for Zoho | 200 | 400 |
| Debugging/fix-code problems | 50 | 150 |
| Machine-round tasks | 10 | 30-50 |
| Interview questions per company | 80 | 200 |
| Communication drills | 100 | 300 |
| Essay prompts | 50 | 100 |
| Full mocks per company | 8 | 20 |
| Daily challenge pool | 500 | 1500+ |

## What To Build Next

### 1. Content Data Model Upgrade

Move from code-only seed content toward importable structured content.

Required fields for every question:

| Field | Purpose |
|---|---|
| id | Stable identifier |
| companyId | Company or general |
| sectionId | Quant, reasoning, verbal, coding, cs-core, comm-interview |
| topic | Broad topic |
| subtopic | Specific tested skill |
| difficulty | easy, medium, hard |
| prompt | Original question |
| options | Four options for MCQ |
| answer | Correct option index |
| explanation | Short solution |
| estimatedSeconds | Speed target |
| sourceId | Provenance |
| originalStatus | original, licensed, reconstructed |
| reviewedBy | SME reviewer |
| lastReviewed | Date |
| status | draft, reviewed, live, needs_revision |

### 2. Section Expansion Plan

#### Quantitative Aptitude

Add these chapters:

| Priority | Topic |
|---|---|
| P0 | Percentages, Profit-Loss, SI/CI, Ratio-Proportion |
| P0 | Time-Speed-Distance, Time & Work, Averages |
| P1 | Number System, HCF-LCM, Ages, Mixtures |
| P1 | Permutation-Combination, Probability |
| P1 | Data Interpretation: tables, bars, pie charts |
| P2 | Algebra, logarithms, mensuration, pipes-cisterns |

Next content batch:

| Item | Quantity |
|---|---:|
| New quant MCQs | 300 |
| DI sets | 40 sets, 5 questions each |
| Formula lessons | 20 |
| Timed speed drills | 30 |

#### Logical Reasoning

Add these chapters:

| Priority | Topic |
|---|---|
| P0 | Series, coding-decoding, directions, blood relations |
| P1 | Syllogism, seating arrangement, ranking/order |
| P1 | Puzzles, calendars/clocks, analogy/classification |
| P2 | Data sufficiency, input-output, statement-assumption |

Next content batch:

| Item | Quantity |
|---|---:|
| New reasoning MCQs | 300 |
| Puzzle sets | 50 sets |
| Seating arrangement sets | 40 sets |
| Timed reasoning drills | 30 |

#### Verbal Ability

Add these chapters:

| Priority | Topic |
|---|---|
| P0 | Grammar, subject-verb agreement, tenses |
| P0 | Vocabulary, synonyms, antonyms |
| P1 | Reading comprehension |
| P1 | Sentence correction, error spotting |
| P1 | Para jumbles, cloze tests |
| P2 | Critical reasoning, tone/inference |

Next content batch:

| Item | Quantity |
|---|---:|
| Verbal MCQs | 300 |
| RC passages | 60 passages, 5 questions each |
| Para-jumble sets | 80 |
| Cloze passages | 40 |

#### Coding & DSA

Add a real coding ladder:

| Level | Topics |
|---|---|
| Beginner | input/output, loops, conditions, arrays, strings |
| Easy | number logic, pattern printing, searching, sorting basics |
| Medium | hashing, two pointers, stack, queue, linked list, recursion |
| Advanced | trees, graphs, DP, greedy, backtracking |
| Company | TCS/Infosys/Wipro/Cognizant service-style coding, Zoho product-style coding |

Next content batch:

| Item | Quantity |
|---|---:|
| Coding problems | 300 |
| Test cases per problem | 8-15 |
| Editorials | 300 |
| Debugging problems | 100 |
| Zoho machine-round tasks | 30 |

#### CS Core

Add deeper coverage:

| Subject | Topics |
|---|---|
| DBMS | keys, normalization, joins, transactions, indexing, SQL |
| OS | processes, threads, deadlock, scheduling, memory management |
| CN | OSI, TCP/UDP, DNS, HTTP/HTTPS, IP, routing basics |
| OOP | encapsulation, inheritance, polymorphism, abstraction, interfaces |
| Web/Cloud | REST, status codes, SaaS/PaaS/IaaS, security basics |

Next content batch:

| Item | Quantity |
|---|---:|
| CS Core MCQs | 400 |
| Interview explanation cards | 120 |
| SQL practice questions | 80 |
| Company technical MCQs | 250 |

#### Communication & Interview

Turn the current teaching section into active practice.

Add these modules:

| Module | Needed practice |
|---|---|
| Self introduction | 30s, 60s, 90s versions |
| HR answers | strengths, weakness, relocation, salary, failures, goals |
| Project explanation | problem, architecture, role, trade-offs, improvement |
| Group discussion | openings, counterpoints, summaries |
| Written communication | email, essay, concise writing |
| Communication assessment | reading aloud, sentence repeat, listening, grammar speaking |
| Interview capstone | final-round scorecard and rubric |

Next content batch:

| Item | Quantity |
|---|---:|
| HR/interview prompts | 500 total |
| Company-specific interview prompts | 80 per company |
| GD topics | 100 |
| Essay prompts | 100 |
| Spoken communication drills | 150 |
| Project explanation rubrics | 20 templates |

## Company-Specific Scale Plan

### TCS

Target focus: NQT aptitude, verbal, reasoning, programming logic, basic coding, technical interview.

Next batch:

| Content | Quantity |
|---|---:|
| Aptitude/reasoning/verbal PYQs | 250 |
| Programming logic MCQs | 100 |
| Coding problems | 80 |
| CS/interview questions | 80 |
| Full mocks | 8 |

### Infosys

Target focus: aptitude, reasoning, verbal, pseudocode, coding, InfyTQ-style fundamentals.

Next batch:

| Content | Quantity |
|---|---:|
| Aptitude/reasoning/verbal PYQs | 250 |
| Pseudocode MCQs | 120 |
| Coding problems | 100 |
| DBMS/OOP/Java/Python interview questions | 80 |
| Full mocks | 8 |

### Wipro

Target focus: aptitude, verbal, written communication/essay, coding, HR.

Next batch:

| Content | Quantity |
|---|---:|
| Aptitude/reasoning/verbal PYQs | 250 |
| Essay prompts | 50 |
| Coding problems | 80 |
| HR/behavioral questions | 80 |
| Full mocks | 8 |

### Accenture

Target focus: cognitive, technical MCQs, pseudocode, coding, communication assessment.

Next batch:

| Content | Quantity |
|---|---:|
| Cognitive questions | 250 |
| Technical MCQs | 150 |
| Coding problems | 80 |
| Communication drills | 100 |
| Full mocks | 8 |

### Cognizant

Target focus: aptitude, communication, automata/debugging, CS basics, project interview.

Next batch:

| Content | Quantity |
|---|---:|
| Aptitude/reasoning/verbal PYQs | 250 |
| Technical MCQs | 100 |
| Debugging/fix-code problems | 60 |
| Interview questions | 80 |
| Full mocks | 8 |

### Zoho

Target focus: coding-heavy rounds, debugging, pattern printing, DSA, machine-round tasks.

Next batch:

| Content | Quantity |
|---|---:|
| Coding problems | 200 |
| Debugging problems | 50 |
| Machine-round tasks | 30 |
| Technical interview questions | 80 |
| Zoho-style coding mocks | 10 |

### Placement Foundation

Target focus: broad foundation for early-year students and company recommendation.

Next batch:

| Content | Quantity |
|---|---:|
| Foundation aptitude questions | 200 |
| Foundation coding questions | 100 |
| CS basics questions | 150 |
| Communication drills | 100 |
| Diagnostic test bank | 150 |

## Feature Work Needed For Scaling

| Priority | Feature | Why it matters |
|---|---|---|
| P0 | Content import pipeline | Avoid editing huge TypeScript files manually |
| P0 | Content validation tests | Catch invalid answers, duplicate options, missing sources |
| P0 | Real coding editor + test runner | Coding readiness cannot be MCQ-only |
| P0 | Timed company-pattern mocks | Placement tests are time-pressure exams |
| P0 | Report-error button | Needed for content trust |
| P1 | Speaking/writing drill UI | Communication requires active practice |
| P1 | Admin/CMS workflow | SME review and monthly refresh |
| P1 | Question tagging and analytics | Weak topic recommendations need structured tags |
| P1 | Mock analytics | Section cutoffs, time usage, and weak topics |
| P2 | Adaptive recommendations | Personalized 30-day plans |

## Immediate Next Sprint

Do these before adding thousands of items.

1. Create structured content schema for `lessons`, `questions`, `pyqs`, `interviewQuestions`, `codingProblems`, `mocks`, and `communicationDrills`.
2. Add validation tests for all content files:
   - four unique options for MCQs
   - answer index in range
   - non-empty explanation
   - sourceId present
   - no duplicate IDs
   - each company has minimum counts per section
3. Add `codingProblems` data model with:
   - prompt
   - input/output format
   - constraints
   - starter code
   - hidden and visible test cases
   - editorial
   - tags
4. Add `mockTests` data model with:
   - companyId
   - sections
   - timers
   - question pools
   - scoring/cutoff rules
5. Add communication drill model with:
   - prompt
   - mode: spoken, written, GD, HR, essay
   - rubric
   - ideal structure
   - common mistakes
6. Expand content in batches, not random bulk:
   - Batch 1: TCS + Infosys + General
   - Batch 2: Wipro + Accenture
   - Batch 3: Cognizant + Zoho
7. Add content quality status:
   - draft
   - reviewed
   - live
   - needs_revision

### Sprint 1 Implementation Status

Completed in the current codebase:

- Structured domain models for `CodingProblem`, `MockTest`, `MockSection`, and `CommunicationDrill` in `lib/types.ts`.
- Source-backed starter banks in `lib/data/coding-problems.ts`, `lib/data/mocks.ts`, and `lib/data/communication.ts`.
- Validation tests for scalable content IDs, sources, coding test cases, communication rubrics, and mock question construction in `lib/content-governance.test.ts`.
- Student-facing routes for `/coding` and `/communication`.
- Structured company-pattern mocks powering `/mock`.
- Deterministic chapter quiz expansion: every chapter now has at least 12 quiz questions.
- Deterministic PYQ-style expansion: every company now has 200+ source-tagged original PYQ-style practice items.

Still pending before calling the app full scale:

- Real browser coding editor and server-side/worker-based judge.
- Bulk import pipeline for SME-authored JSON/CSV content.
- Admin review workflow and legal sign-off records.
- Large reviewed batches for each company target.
- Speaking/audio capture and writing feedback workflow.

## Recommended Batch 1

Batch 1 should make the app feel meaningfully deeper without waiting for full scale.

| Area | Add now |
|---|---:|
| TCS PYQs | 100 |
| Infosys PYQs | 100 |
| General foundation questions | 150 |
| Coding problems | 75 |
| Interview questions | 100 |
| Communication drills | 50 |
| Mocks | 2 each for TCS, Infosys, General |

## Launch Readiness Rule

Do not call a company track "placement-ready" until it has:

- 200+ company-specific practice questions.
- 8+ timed mocks.
- 80+ interview questions.
- Company eligibility verified in the current cycle.
- Coding practice that matches that company's round.
- Communication/interview capstone.
- SME review and source metadata.

Until then, label it as a starter track or beta track.


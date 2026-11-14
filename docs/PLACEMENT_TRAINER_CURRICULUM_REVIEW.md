# StudyBench Placement Learning Curriculum — Senior Faculty & Training Officer Review

**Purpose:** Make StudyBench a learning-first placement preparation platform. The product should help a student understand fundamentals, apply them to unfamiliar problems, practise under realistic constraints and explain their reasoning. It must not promise a job, placement, shortlist or company-specific outcome.

## 1. Review findings

### What is already useful
- Aptitude, logical reasoning and verbal content already contains worked explanations and assessment-style examples.
- CS Core has coverage of DBMS, operating systems, OOP, networks, software engineering, testing, security, cloud/web fundamentals and system design basics.
- The programming area has independent language tracks and an established chapter/lesson progression.
- DSA includes complexity, arrays, strings, searching/sorting, linear data structures, trees/graphs and dynamic programming/greedy topics.
- Existing progress, XP, mistake review and chapter unlocking provide a foundation for a guided path.

### What needed correction
1. Some lessons made exact claims about how many questions a named employer asks, or how quickly a student should solve them, without a dated official assessment source. Those claims have been removed or rewritten as general skill relevance.
2. A 70% StudyBench pass threshold must be described as an internal learning milestone, never as a universal employer cutoff.
3. Repeated generic questions such as “what should you do before optimising?” do not prove mastery of the chapter topic. Questions should be tied to the actual concept and use plausible distractors.
4. The previous language roadmap was uneven: Python had more specific instruction, while other languages shared generic explanations. The syllabus must require language-specific syntax, runtime, type, memory, collection and error-handling differences before those lessons are marked publish-ready.
5. A quiz consisting only of multiple-choice questions rewards recognition. Students also need typed recall, code tracing, output prediction, debugging, ordering, and practical problem tasks.
6. Reading a long explanation is not a learning interaction. Each lesson needs a small outcome, a worked example, a learner action, feedback and a retrieval check.

## 2. Product learning loop

Use the learning mechanics that make Duolingo effective as a reference, not its brand or copied screens:
- Start with an actionable exercise, not a long lecture.
- Introduce one small learning objective at a time.
- Move from recognition to recall, then application and transfer.
- Give immediate, explanatory feedback.
- Revisit earlier skills through spaced practice.
- Make the next step visible on a connected roadmap.
- Reward demonstrated progress, not time spent clicking.

StudyBench's own identity, layout, copy, icons, colours and curriculum must remain original.

## 3. Website learning areas and curriculum

### A. Aptitude
**Outcome:** Solve quantitative problems accurately, select an efficient method and explain the calculation.

Recommended sequence:
1. Number system, divisibility, factors, HCF and LCM
2. Fractions, decimals, percentages and percentage change
3. Ratio, proportion, partnership and mixtures
4. Averages, weighted averages and ages
5. Profit, loss, discount and marked price
6. Simple and compound interest
7. Time and work, work rates, pipes and cisterns
8. Speed, distance, time, trains and boats
9. Algebra, equations and inequalities
10. Permutations, combinations and probability
11. Data interpretation: tables, bar charts, line charts and pie charts
12. Mensuration and geometry fundamentals
13. Mixed aptitude sets and timed sectional practice

Every topic should include a concept explanation, a fully worked example, a mental-math or formula insight where appropriate, a common misconception, untimed practice, then timed practice.

### B. Logical Reasoning
**Outcome:** Represent information, identify constraints, eliminate impossible cases and justify conclusions.

Recommended sequence:
1. Number and letter series
2. Analogy and classification
3. Coding-decoding and input-output patterns
4. Blood relations and family trees
5. Directions, distance and orientation
6. Ranking, ordering and comparisons
7. Linear and circular seating arrangements
8. Constraint-based puzzles
9. Syllogisms and Venn-diagram reasoning
10. Statements, assumptions, arguments and conclusions
11. Clocks and calendars
12. Data sufficiency and mixed reasoning sets

Teach a repeatable method: translate the wording, draw a representation, list constraints, eliminate contradictions, verify every condition and only then select an answer.

### C. Verbal Ability
**Outcome:** Read accurately, understand meaning and communicate in clear professional English.

Recommended sequence:
1. Parts of speech and sentence structure
2. Subject-verb agreement
3. Tenses, articles and prepositions
4. Pronouns, modifiers and parallel structure
5. Error spotting and sentence correction
6. Vocabulary through roots, context and word families
7. Synonyms, antonyms, idioms and phrasal verbs
8. Sentence completion and cloze tests
9. Para jumbles and logical flow
10. Reading comprehension: main idea, detail and inference
11. Tone, purpose and argument evaluation
12. Professional email and concise written communication

Do not teach vocabulary as isolated memorisation only. Use words in context, ask students to infer meaning, then require them to use the word correctly in a sentence.

### D. CS Core
**Outcome:** Explain core computing concepts, compare alternatives and reason about real systems.

Recommended sequence:
1. Computer and programming fundamentals: source, compiler/interpreter, runtime, memory and data representation
2. OOP: abstraction, encapsulation, inheritance, polymorphism, composition and interfaces
3. DBMS: relational model, keys, constraints and normalization
4. SQL: SELECT, filtering, joins, grouping, subqueries and window-function fundamentals
5. Transactions, ACID, isolation and indexing
6. Operating systems: processes, threads, scheduling and context switching
7. Synchronization, race conditions, deadlocks and memory management
8. Computer networks: OSI/TCP-IP, addressing, DNS, HTTP/HTTPS and TCP/UDP
9. Data structures fundamentals and complexity
10. Software engineering: requirements, modularity, version control and code review
11. Testing: unit, integration, regression and test design
12. Web and API fundamentals: client/server, REST, status codes, authentication and sessions
13. Security fundamentals: least privilege, hashing vs encryption, input validation and common web risks
14. Cloud and DevOps fundamentals: deployment, CI/CD, containers and observability
15. System design fundamentals: requirements, components, data flow, caching and trade-offs

Keep SQL & DBMS in the CS Core learning area rather than presenting it as another programming language.

### E. Programming Languages
**Outcome:** Write, debug, test and explain small-to-medium programs in a chosen language.

Independent tracks:
- C
- C++
- Java
- Python
- JavaScript
- C#
- PHP

Each live language track has 15 chapters (foundations plus deeper application, reliability, design and project chapters). Each chapter currently has two substantive authored lessons; generic strategy-only lesson nodes were removed because they did not teach the chapter topic.

Each language should have its own language-specific examples and notes. Shared learning objectives are acceptable; copied generic explanations are not. Explain language-specific behaviour, such as C pointers and memory, C++ RAII/STL, Java JVM and collections, Python object model and exceptions, JavaScript coercion/event loop, C# value/reference types and .NET, PHP arrays/types and web request handling.

Required progression:
1. Program structure, execution model and problem decomposition
2. Variables, types, operators, conversion and numeric precision
3. Strings, formatting, searching and parsing
4. Boolean logic and decision structures
5. Loops, nested iteration and control flow
6. Arrays/collections, maps, sets and data modelling
7. Functions, parameters, return values, scope and recursion
8. Exceptions, input validation, debugging and automated tests
9. Files, modules, standard libraries and package management
10. OOP, composition, interfaces and design trade-offs
11. Complexity, memory, iterators and concurrency/asynchronous model
12. Capstone projects and professional development workflow

Each language should include at least two beginner-friendly projects and one integrated capstone. Examples: calculator with validation, grade/result analyser, expense tracker, inventory/record manager, quiz application or a small API client. Projects must include acceptance criteria, test cases, README/setup instructions and a short explanation of design decisions.

### F. Data Structures & Algorithms
**Outcome:** Choose an appropriate data structure, design an algorithm, prove its behaviour with tests and analyse complexity.

Recommended sequence:
1. Arrays, indexing, traversal and time/space complexity
2. Strings, two pointers and sliding windows
3. Searching and sorting, including binary search invariants
4. Hashing, maps, sets and frequency counting
5. Recursion and backtracking
6. Linked lists and pointer/reference reasoning
7. Stacks, queues, monotonic stacks and deques
8. Trees, traversals and binary search trees
9. Heaps and priority queues
10. Graph representations, BFS, DFS, cycle detection and shortest paths
11. Greedy algorithms and correctness arguments
12. Dynamic programming: states, transitions, memoization and tabulation
13. Bit manipulation and integer representation
14. Mixed problem solving, timed practice and solution communication

Do not teach DSA as a catalogue of definitions. Every structure needs implementation, operation costs, when to use it, common failure cases and a problem that demonstrates its value.

### G. Company Tracks
Company tracks should be a later application layer, not a substitute for fundamentals. They should map shared skills to a verified assessment pattern, explain what is known and unknown, and offer mixed practice. Employer formats change; attach source, retrieval date and review date to every company-specific claim. Do not state exact question counts or cutoffs without current official evidence.

## 4. Lesson template

Every lesson should use the following structure:

1. **One outcome:** “After this lesson, you can…”
2. **Quick recall:** one short prompt from an earlier lesson.
3. **Explain:** a concise concept explanation in plain language.
4. **Worked example:** show the reasoning step by step.
5. **Try together:** a partially completed example or guided prompt.
6. **Independent practice:** the student solves without seeing the answer.
7. **Feedback:** explain why the answer is correct or why a distractor is wrong.
8. **Common mistake:** identify the misconception and how to avoid it.
9. **Exit check:** one recall or transfer question.
10. **Next step:** continue, retry a prerequisite or review a weak skill.

Keep a normal lesson to roughly 5–12 minutes, but allow longer practice and project sessions when the task genuinely needs them.

## 5. Exercise formats

**Implemented in this update:** multiple-choice and typed fill-in-the-blank. Typed answers are saved to the Mistake Notebook, including across devices after migration `0023_typed_mistake_answers.sql` is applied.

**Next exercise formats to build:**
- Multiple choice: concept discrimination and realistic distractors.
- Fill in the blank: typed recall of a term, value, operator or missing code token.
- Predict the output: trace a short code sample line by line.
- Find the bug: identify a faulty line or incorrect assumption.
- Order the steps: arrange an algorithm or debugging workflow.
- Match pairs: connect terms, definitions, formulas or outputs.
- Short numeric response: calculate and enter a value with explicit tolerance rules.
- Scenario question: choose and justify a method for a practical problem.
- Timed mixed set: apply concepts under assessment conditions.

Never rely only on multiple choice. Recognition is easier than recalling or producing an answer independently.

## 6. Mastery and review

Recommended default mastery policy:
- Lesson practice: 80% target to mark the lesson secure.
- Chapter checkpoint: 75% target, with a minimum number of questions across the chapter's key outcomes.
- Below threshold: show the exact concepts missed, link to the relevant lesson and offer a fresh practice set.
- Passed: unlock the next node, but keep the skill eligible for spaced review.
- Review schedule: bring missed/new concepts back soon, then increase the interval after successful recall.
- Mixed checkpoint: combine current and previously learned skills so students must retrieve knowledge in context.

These are proposed StudyBench learning targets, not employer cutoffs; reconcile them with the existing scoring configuration before changing live pass thresholds. Do not erase progress when a student retries.

## 7. Placement preparation outcomes

For each completed topic, students should be able to:
- Explain the concept in their own words.
- Solve a straightforward question without hints.
- Solve a changed or unfamiliar example.
- Recognise a common trap and explain why it is wrong.
- Complete a timed question with reasonable accuracy.
- Connect the concept to a coding, CS or workplace scenario where relevant.

For each language and DSA path, add a project checkpoint and a code-reading/debugging checkpoint. The platform can help students prepare; selection depends on the employer, role, assessment, communication, eligibility and many factors outside StudyBench.

## 8. Content governance and release checklist

A lesson is not ready to publish until:
- A subject-matter reviewer has checked the explanation and answer key.
- Every code sample has been run using the stated language/runtime version.
- Every question has one unambiguous answer or a clearly defined accepted-answer set.
- Distractors are plausible and the explanation addresses the misconception.
- The difficulty label matches the reasoning required.
- The content has a source/provenance record where it uses external facts or company-specific information.
- The question is original, licensed or otherwise cleared for use.
- The lesson has keyboard-accessible interactions and readable mobile layout.
- No job guarantee, invented hiring statistic or universal employer cutoff is implied.

## 9. Implementation priority

**P0 — Learning correctness**
- Remove unsupported company question-frequency and speed claims.
- Correct the 70% label so it is an internal mastery threshold.
- Add fill-in-the-blank support and preserve the response in the mistake notebook (migration 0023 must be applied before deployment).
- Ensure language-specific fill blanks are validated case-insensitively and with whitespace normalization.
- Review all answer keys and generated questions for ambiguity.

**P1 — Curriculum completeness**
- Expand Python and the other language tracks with language-specific examples.
- Add the missing progression topics in aptitude, reasoning, verbal, CS Core and DSA.
- Ensure SQL & DBMS is grouped with CS Core in the Learn interface.
- Add a project and mixed checkpoint at the end of each major path.

**P2 — Adaptive learning**
- Recommend lessons based on repeated mistakes.
- Schedule spaced reviews.
- Add mixed retrieval practice across previously completed chapters.
- Show mastery by skill, not only a single overall progress percentage.

**Release gate:** run lint, type-check, unit tests and a production build; manually complete a beginner-to-capstone path on desktop and mobile; verify progress persistence and mistake review. Do not claim these checks passed until they have actually run.


## Reference basis
- Duolingo, *What Is the Duolingo Teaching Method?*: https://blog.duolingo.com/duolingo-teaching-method/
- Duolingo, *What Is Spaced Repetition, and Why Is It Good for Learning?*: https://blog.duolingo.com/spaced-repetition-for-learning/
- Employer-specific claims must be checked against the relevant current official careers/assessment page; StudyBench should record the source and verification date rather than infer a fixed pattern from coaching material.

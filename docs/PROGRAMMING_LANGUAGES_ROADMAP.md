# StudyBench Programming Languages — Curriculum Blueprint

## Learning promise
Every language track takes a student from first principles to independent project work. Students learn to reason about a problem, implement it, test it, debug it, improve it and explain their decisions. Reading a definition alone never counts as mastery.

## Independent language tracks
C, C++, Java, Python, JavaScript, C#, and PHP. Students can choose any language independently.

## Progression in each language
Each live language path contains 15 chapters: three opening foundations followed by the 12 deeper stages below.

1. Program design, execution and debugging
2. Numbers, operators, conversions and precision
3. Strings and real-world text processing
4. Boolean logic and decision systems
5. Loops, nested iteration and control flow
6. Collections and data modelling
7. Functions, scope and modularity
8. Exceptions, validation and automated testing
9. Files, modules, APIs and dependency management
10. Object-oriented programming and software design
11. Performance, memory and asynchronous programming
12. Capstone projects and professional workflow

The existing foundations remain as the opening lessons; these chapters extend them into practical and advanced work.

## Python-specific sequence informed by the supplied course
- Introduction: programming, execution, print, comments, escape sequences, variables, input and data types
- Numbers: integer/float/complex, arithmetic, assignment operators, conversion, rounding, math and random
- Strings: formatting, concatenation, replace, split, indexing, slicing, strip, case conversion, search and validation
- Conditions: comparisons, Boolean operators, if/elif/else, nested conditions and conditional expressions
- Control flow: break, continue, loop-else and nested loops
- Iteration: for/range, while, counters, sentinels, bounded retries and pattern problems
- Collections: lists, tuples, sets, dictionaries and comprehensions
- Functions: parameters, return values, scope, recursion and reusable modules
- Errors/testing: exceptions, validation, tracebacks, debugging and tests
- Files/data: paths, text, CSV and JSON
- OOP: classes, objects, methods, encapsulation and composition
- Advanced practice: complexity, iterators/generators, packages, environments and asynchronous work
- Capstones: expense tracker, student result analyser, file-based record manager and a tested CLI project

## Lesson design contract
Each chapter includes a learning outcome, worked explanation, code example, practical task, common mistakes and checkpoint. Chapter quizzes test application, not only vocabulary. Projects require a working result and explanation of design decisions.

## Mastery and unlocking
- Lessons unlock in a deliberate sequence within each language.
- Chapter assessments determine mastery; failed attempts recommend a lesson and targeted retry without erasing progress.
- Track lesson completion, quiz attempts, best score and topics needing review.
- Keep free/Premium enforcement in the existing server-side access-control layer.
- Coding judge execution is not required to complete a lesson.

## Content quality
Examples must be runnable in the named language and version. Explain why a technique is used, its trade-offs and failure modes. Do not label syntax memorisation as advanced learning.


## Exercise formats and mastery
The platform supports multiple-choice and typed fill-in-the-blank questions. Programming language lessons should progressively add code-output prediction, debugging, step ordering, short numeric/text responses and integrated projects. Each new format must be implemented as a first-class exercise type, scored consistently, accessible by keyboard and represented in mistake review.

A correct answer is not enough by itself: students should see an explanation. Incorrect responses should show the misconception, the accepted response and a direct route back to the lesson. Review should preserve typed responses where applicable.

Recommended StudyBench learning targets (not employer cutoffs): 80% for lesson practice and 75% for a chapter checkpoint. Use a fresh retry set after a failed attempt, retain prior progress, and schedule missed concepts for spaced review.

## Language-specific publish gate
Before any language chapter is published, its examples must be checked against that language's runtime/compiler version. Add language-specific notes for types, input/output, strings, collections, errors, memory/resource management, modules/packages, OOP and concurrency. Shared outcomes are useful; copied explanations and identical examples across all languages are not sufficient.

## Assessment quality
Avoid repeating generic questions in every chapter. Questions must test the actual chapter outcome and include plausible distractors, a clear answer key, an explanation and a source/provenance record when appropriate. Add code tracing and bug-finding tasks where relevant. Never present generated volume as expert-reviewed content.


## DSA roadmap alignment
The live DSA path is maintained separately from programming-language syntax and contains 14 chapters: arrays/complexity; strings/two pointers; searching/sorting; hashing; recursion/backtracking; linked lists; stacks/queues; trees/BST; heaps/priority queues; graphs; greedy algorithms; dynamic programming; bit manipulation; and mixed problem solving. Each chapter has two concept lessons and an authored checkpoint, followed by generated lesson practice. Avoid reintroducing a separate company-specific Coding section or duplicating the same DSA chapter under two path IDs.


## Runtime baselines
Proposed versions for authored examples (verify against the project's supported runtime before publication):
- C: ISO C17
- C++: C++20
- Java: Java 17
- Python: Python 3.12
- JavaScript: ECMAScript 2022 with Node.js 20 for server-side examples; clearly label browser-only APIs
- C#: C# 12 / .NET 8
- PHP: PHP 8.3

Do not mix syntax from different versions in one lesson without explaining the version requirement.

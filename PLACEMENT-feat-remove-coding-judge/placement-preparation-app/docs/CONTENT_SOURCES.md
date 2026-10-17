# Content Sources & IP Governance

This file backs PRD section 13.3. Every lesson, question, interview prompt and PYQ in StudyBench must be either:

1. original content we author,
2. content we license, or
3. factual data from an official/public page with citation.

We never paste verbatim from copyrighted books, third-party articles, private coaching material, or proprietary/leaked test papers.

## How Citation Works In The Codebase

- Each source is registered in [`lib/data/sources.ts`](../lib/data/sources.ts) with an `id`, publisher, kind, note and, for official sources, a citation URL.
- Lessons carry `sourceIds`; questions, PYQs and interview questions carry `sourceId`.
- Source records are kept internally for governance and legal review; the student UI does not show source lines.
- PYQs (`lib/data/pyqs.ts`) are original reconstructions in each company's test pattern. The `year` marks the pattern era, not a real paper.
- `lib/content-governance.test.ts` fails if seeded lessons, questions, PYQs, interview questions, company eligibility cards or official sources lose their source record.

## Approved Source Kinds

| Kind | Allowed use | Not allowed |
|---|---|---|
| `official` | Eligibility, test pattern, round structure, dates; quoted as facts with link plus "last verified" date | Copying copyrighted prep material |
| `book` | Concepts/methods as a reference only | Reproducing the book's exact problems or text |
| `reference` | Concept validation and original in-house material | Copy-pasting articles, examples or solutions |
| `youtube` | Checking coverage/common patterns | Copying transcripts, slides or phrasing |

## Current Registered Sources

| id | Publisher | Kind | Used for |
|---|---|---|---|
| `tcs-nqt-official` | Tata Consultancy Services / TCS iON | official | TCS pattern and eligibility |
| `infosys-careers` | Infosys | official | Infosys eligibility and process |
| `wipro-careers` | Wipro | official | Wipro pattern and eligibility |
| `accenture-careers` | Accenture | official | Accenture assessment structure |
| `zoho-careers` | Zoho Corporation | official | Zoho hiring rounds |
| `cognizant-careers` | Cognizant | official | Cognizant eligibility and rounds |
| `rs-aggarwal-quant` | StudyBench curriculum | book | Quant concepts only; problems authored originally |
| `rs-aggarwal-reasoning` | StudyBench curriculum | book | Reasoning concepts only; questions authored originally |
| `high-agg-verbal` | StudyBench curriculum | book | Grammar concepts only; sentences authored originally |
| `gfg-dsa` | StudyBench curriculum | reference | DSA concepts; explanations rewritten |
| `gfg-cs-core` | StudyBench curriculum | reference | DBMS, OS, CN and OOP concepts; explanations rewritten |
| `careerride-yt` | StudyBench curriculum | youtube | Pattern/coverage validation only |
| `studybench-curriculum` | StudyBench curriculum | reference | Original trainer-authored lessons, PYQ reconstructions and interview guidance |
| `indiabix-aptitude` | StudyBench curriculum | reference | Practice-pattern validation only; all questions authored originally |
| `hackerrank-interview-kit` | HackerRank | reference | Coding-interview topic coverage; problems authored originally |
| `codechef-placement-prep` | CodeChef | reference | Beginner/intermediate DSA progression; problems authored originally |
| `mdn-http` | MDN Web Docs | reference | HTTP/web fundamentals validation |
| `python-docs-data-structures` | Python Software Foundation | reference | Python data-structure fundamentals validation |

## Before A Track Goes Live

- [ ] Every item authored by an SME and reviewed by a second SME.
- [ ] Eligibility facts re-verified against the official page this drive cycle; `lastVerified` updated.
- [ ] No verbatim copyrighted text, third-party solution text or proprietary paper content.
- [ ] Source record present for each item.
- [ ] Legal sign-off recorded.

> The seeded content shipped in this repo is a starter set to make the product functional end-to-end. It is not a complete, SME-reviewed bank and must pass the checklist above before any track is marketed as "live".



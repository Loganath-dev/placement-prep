import type { ContentSource } from "@/lib/types"

/**
 * Approved content sources for internal provenance checks.
 *
 * Internal provenance registry. A sourceId records the reference used for
 * coverage or concept validation; it does not certify independent review.
 * Content must be written in StudyBench's own words, must not reproduce
 * copyrighted passages or proprietary papers, and must be reviewed before it
 * is marketed as SME-verified.
 */
export const SOURCES: Record<string, ContentSource> = {
  "tcs-nqt-official": {
    id: "tcs-nqt-official",
    title: "Official recruiter assessment page (national qualifier test)",
    publisher: "Tata Consultancy Services / TCS iON",
    url: "https://www.tcs.com/who-we-are/tcs-way/article/tcs-national-qualifier-test-nqt-reimagine-talent-acquisition",
    kind: "official",
    note: "Test structure, sections and eligibility taken from the recruiter's official careers page; verify each drive cycle.",
  },
  "tcs-careers": {
    id: "tcs-careers",
    title: "Official recruiter careers page",
    publisher: "Tata Consultancy Services",
    url: "https://www.tcs.com/careers",
    kind: "official",
    note: "Company research prompts and employer-brand references taken from the recruiter's official careers pages.",
  },
  "infosys-careers": {
    id: "infosys-careers",
    title: "Official recruiter careers / assessment page",
    publisher: "Infosys",
    url: "https://www.infosys.com/careers/graduates.html",
    kind: "official",
    note: "Eligibility and selection process from the recruiter's official careers page.",
  },
  "wipro-careers": {
    id: "wipro-careers",
    title: "Official recruiter careers / talent-hunt page",
    publisher: "Wipro",
    url: "https://careers.wipro.com/",
    kind: "official",
    note: "Pattern and eligibility from the recruiter's official careers page.",
  },
  "accenture-careers": {
    id: "accenture-careers",
    title: "Official recruiter careers / assessment page",
    publisher: "Accenture",
    url: "https://www.accenture.com/in-en/careers",
    kind: "official",
    note: "Cognitive + technical assessment and coding round structure from the recruiter's official careers page.",
  },
  "zoho-careers": {
    id: "zoho-careers",
    title: "Official recruiter careers / hiring-rounds page",
    publisher: "Zoho Corporation",
    url: "https://www.zoho.com/careers/",
    kind: "official",
    note: "Multi-round programming-heavy process referenced from the recruiter's official careers page.",
  },
  "cognizant-careers": {
    id: "cognizant-careers",
    title: "Official recruiter careers / graduate-hiring page",
    publisher: "Cognizant",
    url: "https://careers.cognizant.com/india-en/pathways-to-cognizant/genc-program/",
    kind: "official",
    note: "Graduate hiring eligibility and rounds from the recruiter's official careers page.",
  },

  "rs-aggarwal-quant": {
    id: "rs-aggarwal-quant",
    title: "Quantitative Aptitude for Competitive Examinations",
    publisher: "R. S. Aggarwal / S. Chand (concept reference)",
    kind: "book",
    note: "Concept-sequencing reference only. StudyBench must independently author every explanation, example and question; no book text or exercise is reproduced.",
  },
  "rs-aggarwal-reasoning": {
    id: "rs-aggarwal-reasoning",
    title: "A Modern Approach to Verbal & Non-Verbal Reasoning",
    publisher: "R. S. Aggarwal / S. Chand (concept reference)",
    kind: "book",
    note: "Concept-sequencing reference only. StudyBench independently authors explanations and questions; no book exercise is reproduced.",
  },
  "gfg-dsa": {
    id: "gfg-dsa",
    title: "Data structures & algorithms - standard concepts",
    publisher: "GeeksforGeeks",
    kind: "reference",
    note: "Used as a topic-coverage reference only; StudyBench explanations must be independently written and checked against primary technical documentation.",
  },
  "gfg-cs-core": {
    id: "gfg-cs-core",
    title: "CS fundamentals (DBMS / OS / CN / OOP) - standard concepts",
    publisher: "GeeksforGeeks",
    kind: "reference",
    note: "Used as a topic-coverage reference only; StudyBench explanations must be independently written and checked against primary technical documentation.",
  },
  "high-agg-verbal": {
    id: "high-agg-verbal",
    title: "English grammar & composition - standard concepts",
    publisher: "StudyBench curriculum",
    kind: "book",
    note: "Grammar concepts; all sentences authored originally.",
  },
  "careerride-yt": {
    id: "careerride-yt",
    title: "Aptitude & placement prep - pattern references (video)",
    publisher: "StudyBench curriculum",
    url: "https://www.careerride.com/video-search.aspx?vCategoryId=13&vSubCategoryId=188",
    kind: "youtube",
    note: "Used to validate common patterns and coverage; no transcripts or third-party text copied.",
  },
  "studybench-original-2026": {
    id: "studybench-original-2026",
    title: "StudyBench original academic remediation question set (2026-11-13)",
    publisher: "StudyBench curriculum team",
    kind: "reference",
    note: "New questions authored independently for thin chapter banks. They are original practice items, not official PYQs; verify against the documented concept references before publication.",
  },
  "studybench-curriculum": {
    id: "studybench-curriculum",
    title: "StudyBench curriculum - original trainer-authored content",
    publisher: "StudyBench curriculum",
    kind: "reference",
    note: "Original concepts, model interview answers, communication guidance and roadmaps authored in-house.",
  },
  "indiabix-aptitude": {
    id: "indiabix-aptitude",
    title: "Aptitude practice-pattern reference",
    publisher: "IndiaBix",
    url: "https://www.indiabix.com/aptitude/questions-and-answers/",
    kind: "reference",
    note: "Used only to understand common practice formats. Do not copy prompts, answer options or explanations; all StudyBench questions must be independently authored.",
  },
  "hackerrank-interview-kit": {
    id: "hackerrank-interview-kit",
    title: "Interview preparation topic map",
    publisher: "HackerRank",
    url: "https://www.hackerrank.com/interview/interview-preparation-kit/",
    kind: "reference",
    note: "Used to verify common coding-interview topic coverage such as arrays, hashmaps, sorting, strings, stacks, graphs and DP. Problems are authored originally.",
  },
  "codechef-placement-prep": {
    id: "codechef-placement-prep",
    title: "Placement preparation for product companies",
    publisher: "CodeChef",
    url: "https://www.codechef.com/learn/course/college-placement-prep",
    kind: "reference",
    note: "Used to validate beginner/intermediate DSA progression and debugging coverage. No problem statements copied.",
  },
  "mdn-http": {
    id: "mdn-http",
    title: "HTTP reference",
    publisher: "MDN Web Docs",
    url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status",
    kind: "reference",
    note: "Used to validate web fundamentals such as HTTP status-code classes for CS-core practice.",
  },
  "c-language-reference": {
    id: "c-language-reference",
    title: "C language reference",
    publisher: "cppreference contributors",
    url: "https://en.cppreference.com/w/c",
    kind: "reference",
    note: "Technical cross-check for C language syntax and library behaviour. Independently author explanations and verify compiler-version assumptions.",
  },
  "cpp-language-reference": {
    id: "cpp-language-reference",
    title: "C++ language reference",
    publisher: "cppreference contributors",
    url: "https://en.cppreference.com/w/cpp",
    kind: "reference",
    note: "Technical cross-check for C++ language and standard-library behaviour. Independently author explanations and identify the C++ standard used.",
  },
  "java-language-reference": {
    id: "java-language-reference",
    title: "Dev.java learning and language documentation",
    publisher: "Oracle / OpenJDK community",
    url: "https://dev.java/learn/",
    kind: "reference",
    note: "Reference for Java syntax, object model, collections and runtime concepts. Independently author examples and identify the Java version.",
  },
  "csharp-language-reference": {
    id: "csharp-language-reference",
    title: "C# documentation",
    publisher: "Microsoft Learn",
    url: "https://learn.microsoft.com/en-us/dotnet/csharp/",
    kind: "reference",
    note: "Primary language documentation for C# syntax, types, collections and .NET behaviour. Independently author examples and identify the target .NET version.",
  },
  "php-language-reference": {
    id: "php-language-reference",
    title: "PHP manual",
    publisher: "PHP Documentation Group",
    url: "https://www.php.net/manual/en/",
    kind: "reference",
    note: "Primary reference for PHP syntax, types, arrays, exceptions and request handling. Independently author examples and identify the supported PHP version.",
  },
  "python-docs-tutorial": {
    id: "python-docs-tutorial",
    title: "The Python Tutorial",
    publisher: "Python Software Foundation",
    url: "https://docs.python.org/3/tutorial/",
    kind: "reference",
    note: "Primary reference for Python syntax, control flow and data structures. Use to verify facts; author original StudyBench explanations and exercises.",
  },
  "mdn-javascript-guide": {
    id: "mdn-javascript-guide",
    title: "JavaScript Guide",
    publisher: "MDN Web Docs",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
    kind: "reference",
    note: "Reference for JavaScript grammar, control flow, functions, collections and asynchronous behaviour. Do not copy lesson prose.",
  },
  "postgresql-tutorial": {
    id: "postgresql-tutorial",
    title: "PostgreSQL Tutorial and SQL Language Reference",
    publisher: "PostgreSQL Global Development Group",
    url: "https://www.postgresql.org/docs/current/tutorial.html",
    kind: "reference",
    note: "Primary technical reference for relational concepts, SQL, joins, aggregates, transactions and window functions. Examples in StudyBench are independently authored.",
  },
  "opendsa-reference": {
    id: "opendsa-reference",
    title: "OpenDSA Data Structures and Algorithms",
    publisher: "OpenDSA Project",
    url: "https://opendsa.org/home/books",
    kind: "reference",
    note: "Use for DSA topic coverage and concept cross-checking. The project identifies its software/content project as MIT-licensed; verify module-level and third-party asset terms before reuse.",
  },
  "openstax-college-algebra": {
    id: "openstax-college-algebra",
    title: "College Algebra",
    publisher: "OpenStax, Rice University",
    url: "https://openstax.org/books/college-algebra/pages/preface",
    kind: "book",
    note: "Concept reference only. This edition is CC BY 4.0 according to its book page; retain attribution for any reused material and check component-level rights. Do not assume other OpenStax books share this licence.",
  },
  "python-docs-data-structures": {
    id: "python-docs-data-structures",
    title: "Python data structures tutorial",
    publisher: "Python Software Foundation",
    url: "https://docs.python.org/3/tutorial/datastructures.html",
    kind: "reference",
    note: "Used to validate Python list, dictionary and set fundamentals for coding practice. Questions and examples are original.",
  },
}

export function sourceById(id?: string): ContentSource | undefined {
  return id ? SOURCES[id] : undefined
}



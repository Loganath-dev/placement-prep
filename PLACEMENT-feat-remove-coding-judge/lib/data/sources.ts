import type { ContentSource } from "@/lib/types"

/**
 * Approved content sources for internal provenance checks.
 *
 * IP rule: every seeded lesson/question is ORIGINAL, authored in our own words by
 * the StudyBench curriculum team, or factual data from an official/public page.
 * We do NOT reproduce any third-party book, paper or proprietary material, and we
 * do not display third-party book or author names. Each item references a
 * sourceId below only for internal provenance.
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
  "capgemini-careers": {
    id: "capgemini-careers",
    title: "Official recruiter careers page",
    publisher: "Capgemini",
    url: "https://www.capgemini.com/in-en/careers/",
    kind: "official",
    note: "Pattern and eligibility from the recruiter's official careers page.",
  },
  "epam-careers": {
    id: "epam-careers",
    title: "Official recruiter careers page",
    publisher: "EPAM Systems",
    url: "https://careers.epam.com/",
    kind: "official",
    note: "Pattern and eligibility from the recruiter's official careers page.",
  },
  "ibm-careers": {
    id: "ibm-careers",
    title: "Official recruiter careers page",
    publisher: "IBM",
    url: "https://www.ibm.com/careers",
    kind: "official",
    note: "Pattern and eligibility from the recruiter's official careers page.",
  },
  "unisys-careers": {
    id: "unisys-careers",
    title: "Official recruiter careers page",
    publisher: "Unisys",
    url: "https://www.unisys.com/careers/",
    kind: "official",
    note: "Pattern and eligibility from the recruiter's official careers page.",
  },
  "techmahindra-careers": {
    id: "techmahindra-careers",
    title: "Official recruiter careers page",
    publisher: "Tech Mahindra",
    url: "https://careers.techmahindra.com/",
    kind: "official",
    note: "Pattern and eligibility from the recruiter's official careers page.",
  },
  "hcltech-careers": {
    id: "hcltech-careers",
    title: "Official recruiter careers page",
    publisher: "HCLTech",
    url: "https://www.hcltech.com/careers",
    kind: "official",
    note: "Pattern and eligibility from the recruiter's official careers page.",
  },
  "rs-aggarwal-quant": {
    id: "rs-aggarwal-quant",
    title: "Quantitative aptitude - standard concepts",
    publisher: "StudyBench curriculum",
    kind: "book",
    note: "Concepts only. All examples and questions are originally authored by the StudyBench team.",
  },
  "rs-aggarwal-reasoning": {
    id: "rs-aggarwal-reasoning",
    title: "Logical & verbal reasoning - standard concepts",
    publisher: "StudyBench curriculum",
    kind: "book",
    note: "Concepts only; all questions are originally authored.",
  },
  "gfg-dsa": {
    id: "gfg-dsa",
    title: "Data structures & algorithms - standard concepts",
    publisher: "StudyBench curriculum",
    kind: "reference",
    note: "Public DSA concepts, explained and re-authored in our own words.",
  },
  "gfg-cs-core": {
    id: "gfg-cs-core",
    title: "CS fundamentals (DBMS / OS / CN / OOP) - standard concepts",
    publisher: "StudyBench curriculum",
    kind: "reference",
    note: "Public CS fundamentals, explained and re-authored in our own words.",
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
    kind: "youtube",
    note: "Used to validate common patterns and coverage; no transcripts or third-party text copied.",
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
    title: "Aptitude & technical patterns - practice references",
    publisher: "StudyBench curriculum",
    kind: "reference",
    note: "Used to confirm common question patterns only; every question here is originally authored.",
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





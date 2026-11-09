/**
 * Frequently asked questions. Answers are written "answer-first" and self-
 * contained for AEO (Answer Engine Optimization) - each answer can stand alone
 * as a direct response in a search/AI snippet. No third-party company names are
 * used; recruiters are described generically.
 */
export interface FaqItem {
  id: string
  question: string
  /** Plain-text answer (supports **bold**). Kept concise and self-contained. */
  answer: string
  category: "Getting started" | "Preparation" | "Pricing" | "Content & data"
}

export const FAQS: FaqItem[] = [
  {
    id: "what-is-studybench",
    category: "Getting started",
    question: "What is StudyBench?",
    answer:
      "StudyBench is an all-in-one campus placement preparation platform for Indian students and freshers. It brings together company-pattern learning tracks, aptitude and coding practice, previous-year-pattern questions, mock tests, interview and communication prep, and an honest Placement Readiness Index (PRI) that shows how prepared you are and exactly what to do next.",
  },
  {
    id: "how-pri-works",
    category: "Preparation",
    question: "How does the Placement Readiness Index (PRI) work?",
    answer:
      "The PRI is a 0-100 readiness score per company. It combines your mastery across quantitative aptitude, logical reasoning, verbal ability, coding and DSA, CS core and communication/interview, along with your mock-test performance. It is honest by design - only chapters you actually pass (60% or higher) count, so skipping content never inflates your score.",
  },
  {
    id: "is-probability-guarantee",
    category: "Preparation",
    question: "Is the estimated placement probability a guarantee of a job?",
    answer:
      "No. The placement probability is an estimate based on your in-app performance, shown to help you gauge progress and prioritise your effort. It is not a guarantee of selection, an interview call, or a job offer. Final hiring decisions rest entirely with the employers.",
  },
  {
    id: "which-companies",
    category: "Getting started",
    question: "Which companies and tests can I prepare for on StudyBench?",
    answer:
      "StudyBench covers the six recruiters that most Indian students target - the largest IT services firms and leading product/SaaS companies - plus core skill practice for early-year students. Each track mirrors that recruiter's known pattern, including aptitude, coding, written/communication and interview rounds.",
  },
  {
    id: "is-it-free",
    category: "Pricing",
    question: "Is StudyBench free? What does Premium include?",
    answer:
      "StudyBench has a free tier that opens every company track with starter chapters, sample practice and a mock baseline. Premium costs ₹249 for a lifetime and unlocks every section, every chapter, the full previous-year question bank, every mock test, the complete interview question bank with trainer guidance, and detailed analytics.",
  },
  {
    id: "seventy-percent-gate",
    category: "Preparation",
    question: "How does the 60% chapter-unlock system work?",
    answer:
      "Chapters unlock in sequence: you must score at least 60% on a chapter's quiz before the next chapter opens. This builds job-ready skill step by step instead of letting you skip ahead - the same discipline that helps you clear real placement tests under pressure.",
  },
  {
    id: "content-original",
    category: "Content & data",
    question: "Where does the learning content come from? Is it copied?",
    answer:
      "All content is original. It is authored in-house by our trainers and reconstructed from publicly available concepts, standard reference books and officially published eligibility information. We never copy proprietary or leaked test papers - previous-year questions are original reconstructions written in each recruiter's question pattern.",
  },
  {
    id: "topics-covered",
    category: "Preparation",
    question: "What topics and sections does StudyBench cover?",
    answer:
      "Every company track has six sections: Quantitative Aptitude, Logical Reasoning, Verbal Ability, Coding & DSA, CS Core (DBMS, OS, Computer Networks, OOP and SQL), and Communication & Interview. Core Prep helps you strengthen these skills before moving deeper into company-specific practice.",
  },
  {
    id: "daily-challenges",
    category: "Preparation",
    question: "How do daily challenges, streaks and XP work?",
    answer:
      "Daily challenges give you a quick set of questions each day across Mixed, Aptitude and Coding categories. Completing them earns XP and keeps your streak alive, with bonus XP at 7-, 30- and 100-day milestones. Consistent daily practice is one of the strongest predictors of placement success.",
  },
  {
    id: "data-protection",
    category: "Content & data",
    question: "How is my personal data protected?",
    answer:
      "We follow India's Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000. Passwords are hashed, data is encrypted in transit and at rest, and we never store your card details - payments run on a PCI-DSS-compliant gateway. You can access, correct or delete your data at any time. See our Privacy Policy for full details.",
  },
]

/** FAQPage JSON-LD for SEO/AEO rich results. */
export function faqJsonLd(items: FaqItem[] = FAQS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        // Strip the lightweight **bold** markers for the plain-text schema value.
        text: f.answer.replace(/\*\*/g, ""),
      },
    })),
  }
}

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
      "StudyBench is a structured learning platform for students. It brings together guided paths for aptitude, logical and verbal ability, CS Core, programming languages and data structures, with lessons, practice questions, mock tests and progress tracking.",
  },
  {
    id: "how-progress-works",
    category: "Preparation",
    question: "How is my learning progress tracked?",
    answer:
      "StudyBench tracks completed lessons, chapter practice and mock-test attempts so you can see what you have finished and which concepts may need another review. Progress is shown as learning activity, not as a prediction of academic or placement outcomes.",
  },
  {
    id: "which-companies",
    category: "Getting started",
    question: "Which companies and tests can I prepare for on StudyBench?",
    answer:
      "StudyBench offers company-specific learning tracks alongside shared foundations. Students can choose a track and practise relevant aptitude, reasoning, verbal ability, CS Core and assessment topics.",
  },
  {
    id: "is-it-free",
    category: "Pricing",
    question: "Is StudyBench free? What does Premium include?",
    answer:
      "StudyBench has a free tier with introductory lessons and sample practice. Premium unlocks the complete learning curriculum, the full previous-year question bank, additional mock tests and detailed learning analytics.",
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
      "StudyBench lessons and practice items are written or reconstructed in our own words using registered public, official and standard learning references. Source records track provenance. We do not reproduce proprietary or leaked test papers. Question banks are published as reviewed only after the relevant content-review checks are completed.",
  },
  {
    id: "topics-covered",
    category: "Preparation",
    question: "What topics and sections does StudyBench cover?",
    answer:
      "StudyBench covers Quantitative Aptitude, Logical Reasoning, Verbal Ability, CS Core (DBMS, OS, Computer Networks, OOP and SQL), programming-language fundamentals and Data Structures & Algorithms. Company tracks let you apply these foundations to specific assessment patterns.",
  },
  {
    id: "daily-challenges",
    category: "Preparation",
    question: "How do daily challenges, streaks and XP work?",
    answer:
      "Daily challenges give you short practice sets across learning topics. Completing them earns XP and keeps your streak active, with bonus XP at milestone intervals. Consistent practice helps reinforce what you learn.",
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

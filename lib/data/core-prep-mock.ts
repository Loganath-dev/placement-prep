import type { MockTest, Question } from "@/lib/types"

export const CORE_PREP_MOCK: MockTest = {
  id: "core-prep-readiness-20",
  companyId: "general",
  title: "General Placement Readiness Mock (20 questions)",
  description:
    "A 25-minute StudyBench practice simulation covering quantitative aptitude, reasoning, verbal ability and computer science fundamentals. This original practice set is not an official employer paper or hiring benchmark.",
  sections: [
    {
      id: "quant",
      label: "Quantitative Aptitude",
      questionCount: 5,
      durationMinutes: 6,
      source: "lesson-quiz",
    },
    {
      id: "reasoning",
      label: "Logical Reasoning",
      questionCount: 5,
      durationMinutes: 6,
      source: "lesson-quiz",
    },
    {
      id: "verbal",
      label: "Verbal Ability",
      questionCount: 5,
      durationMinutes: 6,
      source: "lesson-quiz",
    },
    {
      id: "cs-core",
      label: "Computer Science Fundamentals",
      questionCount: 5,
      durationMinutes: 7,
      source: "lesson-quiz",
    },
  ],
  cutoffPercent: 70,
  sourceId: "studybench-curriculum",
  originalStatus: "original",
  status: "reviewed",
  publicationStatus: "published",
}

export const CORE_PREP_MOCK_QUESTIONS: Question[] = [
  {
    id: "core-prep-quant-discount",
    topic: "Percentages",
    difficulty: "easy",
    prompt:
      "A bag is marked at ₹1,500 and sold at a 20% discount. What is its selling price?",
    options: ["₹1,100", "₹1,200", "₹1,250", "₹1,300"],
    answer: 1,
    explanation:
      "20% of ₹1,500 is ₹300. Subtract the discount from the marked price: ₹1,500 − ₹300 = ₹1,200.",
  },
  {
    id: "core-prep-quant-ratio",
    topic: "Ratios",
    difficulty: "easy",
    prompt: "The ratio A:B is 3:5. If A and B together equal 64, what is A?",
    options: ["18", "21", "24", "40"],
    answer: 2,
    explanation:
      "The ratio has 8 equal parts. Each part is 64 ÷ 8 = 8, so A is 3 × 8 = 24.",
  },
  {
    id: "core-prep-quant-work",
    topic: "Work and time",
    difficulty: "medium",
    prompt:
      "Six workers finish a job in 10 days. At the same rate, how many days would 12 workers take?",
    options: ["4 days", "5 days", "8 days", "20 days"],
    answer: 1,
    explanation:
      "The job requires 6 × 10 = 60 worker-days. With 12 workers, it takes 60 ÷ 12 = 5 days.",
  },
  {
    id: "core-prep-quant-average",
    topic: "Averages",
    difficulty: "medium",
    prompt:
      "The average of five numbers is 18. Replacing one number, 14, with 24 changes the average to what?",
    options: ["19", "20", "21", "22"],
    answer: 1,
    explanation:
      "The original total is 5 × 18 = 90. Replacing 14 with 24 adds 10, making the new total 100. The new average is 100 ÷ 5 = 20.",
  },
  {
    id: "core-prep-quant-speed",
    topic: "Speed, distance and time",
    difficulty: "medium",
    prompt:
      "A train 120 metres long passes a stationary pole in 6 seconds. What is its speed?",
    options: ["60 km/h", "66 km/h", "72 km/h", "80 km/h"],
    answer: 2,
    explanation:
      "Speed is 120 ÷ 6 = 20 metres per second. Converting to kilometres per hour gives 20 × 3.6 = 72 km/h.",
  },
  {
    id: "core-prep-reasoning-sequence",
    topic: "Number patterns",
    difficulty: "easy",
    prompt: "What number comes next: 2, 6, 12, 20, 30, __?",
    options: ["36", "40", "42", "44"],
    answer: 2,
    explanation:
      "The differences are 4, 6, 8 and 10. The next difference is 12, so the next number is 30 + 12 = 42.",
  },
  {
    id: "core-prep-reasoning-syllogism",
    topic: "Syllogisms",
    difficulty: "medium",
    prompt:
      "All analysts are careful. No careful person is careless. Which conclusion must be true?",
    options: [
      "Some analysts are careless.",
      "No analyst is careless.",
      "All careful people are analysts.",
      "No careless person is an analyst.",
    ],
    answer: 1,
    explanation:
      "Every analyst is careful, and no careful person is careless. Therefore, no analyst can be careless.",
  },
  {
    id: "core-prep-reasoning-directions",
    topic: "Direction sense",
    difficulty: "easy",
    prompt:
      "Mira faces north, turns right and walks 4 metres, then turns left and walks 3 metres. Where is she relative to her starting point?",
    options: ["North-west", "South-east", "North-east", "South-west"],
    answer: 2,
    explanation:
      "She first moves 4 metres east. Turning left from east points north, so she then moves 3 metres north. Her final position is north-east of where she started.",
  },
  {
    id: "core-prep-reasoning-letters",
    topic: "Letter patterns",
    difficulty: "medium",
    prompt:
      "Using the English alphabet with Z followed by A, what letter comes next: B, E, I, N, T, __?",
    options: ["A", "B", "C", "D"],
    answer: 0,
    explanation:
      "The forward steps increase by one: +3, +4, +5 and +6. The next step is +7; moving seven letters forward from T wraps around to A.",
  },
  {
    id: "core-prep-reasoning-code",
    topic: "Coding patterns",
    difficulty: "easy",
    prompt:
      "A code shifts each letter one place forward in the alphabet (A becomes B). How is MIND written?",
    options: ["NJOD", "NJME", "NJOE", "MJOE"],
    answer: 2,
    explanation:
      "Move each letter forward once: M→N, I→J, N→O and D→E. The result is NJOE.",
  },
  {
    id: "core-prep-verbal-agreement",
    topic: "Subject–verb agreement",
    difficulty: "easy",
    prompt: "Choose the grammatically correct sentence.",
    options: [
      "Each of the applicants have submitted the form.",
      "Each of the applicants has submitted the form.",
      "Each of the applicant have submitted the form.",
      "Each applicants has submitted the form.",
    ],
    answer: 1,
    explanation:
      "“Each” is singular, so it takes the singular verb “has,” even though “applicants” is plural.",
  },
  {
    id: "core-prep-verbal-vocabulary",
    topic: "Vocabulary",
    difficulty: "easy",
    prompt: "Which word is the clearest antonym of “concise”?",
    options: ["Brief", "Precise", "Wordy", "Direct"],
    answer: 2,
    explanation:
      "“Concise” means brief and economical with words. “Wordy” is its clearest opposite among these options.",
  },
  {
    id: "core-prep-verbal-comprehension",
    topic: "Reading comprehension",
    difficulty: "medium",
    prompt:
      "A team began using a review checklist. It then caught recurring defects earlier and fixed them before release. Which conclusion is supported?",
    options: [
      "The checklist helped the team identify recurring defects earlier.",
      "The checklist eliminated every defect.",
      "The team no longer needed testing.",
      "The release date was moved earlier.",
    ],
    answer: 0,
    explanation:
      "The description directly says recurring defects were caught earlier after the checklist was introduced. It does not claim that all defects disappeared or that testing stopped.",
  },
  {
    id: "core-prep-verbal-conjunction",
    topic: "Conjunctions",
    difficulty: "easy",
    prompt:
      "Complete the sentence: “The team delayed the release ___ the final review was incomplete.”",
    options: ["although", "because", "unless", "whereas"],
    answer: 1,
    explanation:
      "“Because” correctly introduces the reason the team delayed the release.",
  },
  {
    id: "core-prep-verbal-clarity",
    topic: "Sentence clarity",
    difficulty: "medium",
    prompt:
      "Choose the clearest revision of “After reviewing the report, several errors were found by the analyst.”",
    options: [
      "After reviewing the report, the analyst found several errors.",
      "Several errors, after reviewing the report, were found.",
      "The report, after reviewing, several errors were found by the analyst.",
      "After the report, the analyst found reviewing several errors.",
    ],
    answer: 0,
    explanation:
      "The revised sentence clearly makes the analyst the person who reviewed the report, avoiding a dangling modifier.",
  },
  {
    id: "core-prep-cs-binary-search",
    topic: "Algorithms",
    difficulty: "easy",
    prompt:
      "What is the time complexity of binary search on a sorted array of n items?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    answer: 1,
    explanation:
      "Each comparison halves the remaining search range, so the number of steps grows logarithmically with n.",
  },
  {
    id: "core-prep-cs-sql-distinct",
    topic: "SQL",
    difficulty: "easy",
    prompt:
      "Which query returns each department name only once from a table named employees?",
    options: [
      "SELECT UNIQUE department FROM employees;",
      "SELECT DISTINCT department FROM employees;",
      "SELECT department ONLY FROM employees;",
      "SELECT department FROM employees GROUP UNIQUE;",
    ],
    answer: 1,
    explanation:
      "In standard SQL, DISTINCT removes duplicate rows from the selected result.",
  },
  {
    id: "core-prep-cs-stack",
    topic: "Data structures",
    difficulty: "easy",
    prompt: "Which data structure removes the most recently added item first?",
    options: ["Queue", "Stack", "Binary search tree", "Hash table"],
    answer: 1,
    explanation:
      "A stack follows last-in, first-out (LIFO) order, so its most recently added item is removed first.",
  },
  {
    id: "core-prep-cs-primary-key",
    topic: "Databases",
    difficulty: "medium",
    prompt: "What is the main purpose of a primary key in a relational table?",
    options: [
      "To uniquely identify each row",
      "To sort rows automatically",
      "To encrypt every column",
      "To allow duplicate row identifiers",
    ],
    answer: 0,
    explanation:
      "A primary key uniquely identifies each row. Its values must be unique and cannot be NULL.",
  },
  {
    id: "core-prep-cs-deadlock",
    topic: "Operating systems",
    difficulty: "medium",
    prompt: "Which situation is necessary for a deadlock to occur?",
    options: [
      "Every process has finished its work.",
      "A process waits for a resource held by another process in a cycle.",
      "The CPU has only one core.",
      "All resources are available to every process.",
    ],
    answer: 1,
    explanation:
      "A circular wait in which processes wait on resources held by one another is one of the necessary conditions for deadlock.",
  },
]

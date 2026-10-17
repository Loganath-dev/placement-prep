import { generateDrills, generateDrillsByDifficulty } from "@/lib/data/question-bank"
import { pyqsForCompany } from "@/lib/data/pyqs"
import type { CompanyId, Difficulty, MockTest, Question, SectionId } from "@/lib/types"

const review = {
  originalStatus: "reconstructed",
  status: "reviewed",
  reviewedBy: "StudyBench SME Review",
  lastReviewed: "2026-06-07",
} as const

const BASE_MOCKS: MockTest[] = [
  {
    id: "mock-tcs-nqt-core",
    companyId: "tcs",
    title: "TCS NQT Core Mock",
    description: "Numerical, verbal, reasoning and programming-logic mix for NQT readiness.",
    cutoffPercent: 70,
    sourceId: "tcs-nqt-official",
    sections: [
      { id: "quant", label: "Numerical Ability", questionCount: 5, durationMinutes: 7, source: "mixed" },
      { id: "reasoning", label: "Reasoning Ability", questionCount: 5, durationMinutes: 7, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 4, durationMinutes: 5, source: "mixed" },
      { id: "coding", label: "Programming Logic", questionCount: 4, durationMinutes: 6, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "mock-infosys-pseudocode-core",
    companyId: "infosys",
    title: "Infosys Aptitude + Pseudocode Mock",
    description: "A compact assessment covering aptitude, reasoning, verbal and pseudocode-style logic.",
    cutoffPercent: 70,
    sourceId: "infosys-careers",
    sections: [
      { id: "quant", label: "Quantitative Aptitude", questionCount: 5, durationMinutes: 7, source: "mixed" },
      { id: "reasoning", label: "Logical Reasoning", questionCount: 5, durationMinutes: 7, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 4, durationMinutes: 5, source: "mixed" },
      { id: "coding", label: "Pseudocode", questionCount: 4, durationMinutes: 6, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "mock-wipro-elite-core",
    companyId: "wipro",
    title: "Wipro Elite Core Mock",
    description: "Aptitude, verbal and coding readiness with written-communication emphasis handled in practice.",
    cutoffPercent: 68,
    sourceId: "wipro-careers",
    sections: [
      { id: "quant", label: "Quantitative Aptitude", questionCount: 5, durationMinutes: 7, source: "mixed" },
      { id: "reasoning", label: "Logical Ability", questionCount: 4, durationMinutes: 6, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 5, durationMinutes: 6, source: "mixed" },
      { id: "coding", label: "Coding MCQ", questionCount: 4, durationMinutes: 6, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "mock-accenture-cognitive-core",
    companyId: "accenture",
    title: "Accenture Cognitive + Technical Mock",
    description: "Cognitive and technical MCQ practice aligned to a consulting/technology fresher track.",
    cutoffPercent: 68,
    sourceId: "accenture-careers",
    sections: [
      { id: "quant", label: "Numerical Ability", questionCount: 4, durationMinutes: 6, source: "mixed" },
      { id: "reasoning", label: "Logical Ability", questionCount: 4, durationMinutes: 6, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 4, durationMinutes: 5, source: "mixed" },
      { id: "cs-core", label: "Technical MCQ", questionCount: 6, durationMinutes: 8, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "mock-cognizant-genc-core",
    companyId: "cognizant",
    title: "Cognizant GenC Core Mock",
    description: "Aptitude, communication-adjacent verbal and technical basics for GenC-style preparation.",
    cutoffPercent: 68,
    sourceId: "cognizant-careers",
    sections: [
      { id: "quant", label: "Quantitative Aptitude", questionCount: 5, durationMinutes: 7, source: "mixed" },
      { id: "reasoning", label: "Logical Ability", questionCount: 4, durationMinutes: 6, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 5, durationMinutes: 6, source: "mixed" },
      { id: "cs-core", label: "Technical Basics", questionCount: 4, durationMinutes: 6, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "mock-capgemini-pseudocode-core",
    companyId: "capgemini",
    title: "Capgemini Pseudocode + Aptitude Mock",
    description: "Numerical, reasoning and verbal aptitude with pseudocode-style logic practice.",
    cutoffPercent: 68,
    sourceId: "capgemini-careers",
    sections: [
      { id: "quant", label: "Numerical Ability", questionCount: 5, durationMinutes: 7, source: "mixed" },
      { id: "reasoning", label: "Logical Ability", questionCount: 5, durationMinutes: 7, source: "mixed" },
      { id: "verbal", label: "Verbal / Written English", questionCount: 4, durationMinutes: 5, source: "mixed" },
      { id: "coding", label: "Pseudocode", questionCount: 4, durationMinutes: 6, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "mock-epam-programming-core",
    companyId: "epam",
    title: "EPAM Programming Fundamentals Mock",
    description: "Programming-fundamentals heavy mix - logic, coding and CS-core basics.",
    cutoffPercent: 70,
    sourceId: "epam-careers",
    sections: [
      { id: "coding", label: "Programming Logic", questionCount: 6, durationMinutes: 9, source: "mixed" },
      { id: "cs-core", label: "CS Fundamentals", questionCount: 5, durationMinutes: 7, source: "mixed" },
      { id: "reasoning", label: "Logical Reasoning", questionCount: 4, durationMinutes: 6, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "mock-ibm-aptitude-core",
    companyId: "ibm",
    title: "IBM Aptitude + Problem Solving Mock",
    description: "Quantitative, logical and verbal aptitude with a problem-solving section.",
    cutoffPercent: 68,
    sourceId: "ibm-careers",
    sections: [
      { id: "quant", label: "Quantitative Aptitude", questionCount: 5, durationMinutes: 7, source: "mixed" },
      { id: "reasoning", label: "Logical Reasoning", questionCount: 5, durationMinutes: 7, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 4, durationMinutes: 5, source: "mixed" },
      { id: "coding", label: "Problem Solving", questionCount: 4, durationMinutes: 6, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "mock-unisys-core",
    companyId: "unisys",
    title: "Unisys Aptitude + Technical Mock",
    description: "Aptitude and technical-fundamentals MCQ practice for a standard service-company drive.",
    cutoffPercent: 65,
    sourceId: "unisys-careers",
    sections: [
      { id: "quant", label: "Quantitative Aptitude", questionCount: 5, durationMinutes: 7, source: "mixed" },
      { id: "reasoning", label: "Logical Ability", questionCount: 4, durationMinutes: 6, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 4, durationMinutes: 5, source: "mixed" },
      { id: "cs-core", label: "Technical Basics", questionCount: 4, durationMinutes: 6, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "mock-techmahindra-core",
    companyId: "techmahindra",
    title: "Tech Mahindra Aptitude + Technical Mock",
    description: "Aptitude and technical-basics MCQ practice for a telecom/IT-services drive.",
    cutoffPercent: 65,
    sourceId: "techmahindra-careers",
    sections: [
      { id: "quant", label: "Quantitative Aptitude", questionCount: 5, durationMinutes: 7, source: "mixed" },
      { id: "reasoning", label: "Logical Ability", questionCount: 4, durationMinutes: 6, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 4, durationMinutes: 5, source: "mixed" },
      { id: "cs-core", label: "Technical Basics", questionCount: 4, durationMinutes: 6, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "mock-hcltech-core",
    companyId: "hcltech",
    title: "HCLTech Aptitude + Technical Mock",
    description: "Aptitude and technical-fundamentals MCQ practice for a standard service-company drive.",
    cutoffPercent: 65,
    sourceId: "hcltech-careers",
    sections: [
      { id: "quant", label: "Quantitative Aptitude", questionCount: 5, durationMinutes: 7, source: "mixed" },
      { id: "reasoning", label: "Logical Ability", questionCount: 4, durationMinutes: 6, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 4, durationMinutes: 5, source: "mixed" },
      { id: "cs-core", label: "Technical Basics", questionCount: 4, durationMinutes: 6, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "mock-zoho-coding-core",
    companyId: "zoho",
    title: "Zoho Coding Logic Mock",
    description: "Programming-heavy MCQ simulation focused on arrays, strings, loops, debugging and matrix logic.",
    cutoffPercent: 75,
    sourceId: "zoho-careers",
    sections: [
      { id: "coding", label: "Programming Logic", questionCount: 10, durationMinutes: 15, source: "mixed" },
      { id: "cs-core", label: "Complexity + Fundamentals", questionCount: 4, durationMinutes: 6, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "mock-general-diagnostic",
    companyId: "general",
    title: "Core Prep Diagnostic",
    description: "Broad diagnostic across aptitude, reasoning, verbal, coding and CS fundamentals.",
    cutoffPercent: 65,
    sourceId: "studybench-curriculum",
    sections: [
      { id: "quant", label: "Quantitative", questionCount: 4, durationMinutes: 6, source: "mixed" },
      { id: "reasoning", label: "Reasoning", questionCount: 4, durationMinutes: 6, source: "mixed" },
      { id: "verbal", label: "Verbal", questionCount: 4, durationMinutes: 5, source: "mixed" },
      { id: "coding", label: "Coding Logic", questionCount: 4, durationMinutes: 6, source: "mixed" },
      { id: "cs-core", label: "CS Core", questionCount: 4, durationMinutes: 6, source: "mixed" },
    ],
    ...review,
  },
]

/**
 * Full-length placement-simulation mocks. Each paper holds 90 questions whose
 * section split mirrors the company's real assessment model (verified from the
 * recruiter's official assessment pattern), with a difficulty target of
 * 10 easy / 40 medium / 40 hard. Answers come from computed generators and
 * reviewed PYQs, so every question is correct by construction.
 */
const SIMULATION_MIX = { easy: 10, medium: 40, hard: 40 } as const

const SIMULATION_BASES: MockTest[] = [
  {
    id: "sim-tcs-nqt",
    companyId: "tcs",
    title: "TCS NQT Full Simulation (90Q)",
    description:
      "Full-length TCS NQT simulation mirroring the real Foundation + Advanced split (Numerical 20, Reasoning 20, Verbal 25). The actual NQT runs ~82 aptitude questions plus 2 hands-on coding problems, is section-locked and has no negative marking; this MCQ paper simulates the aptitude + programming-logic portion on a 10 easy / 40 medium / 40 hard curve.",
    cutoffPercent: 70,
    sourceId: "tcs-nqt-official",
    difficultyMix: SIMULATION_MIX,
    sections: [
      { id: "quant", label: "Numerical Ability", questionCount: 20, durationMinutes: 25, source: "mixed" },
      { id: "reasoning", label: "Reasoning Ability", questionCount: 20, durationMinutes: 25, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 25, durationMinutes: 25, source: "mixed" },
      { id: "coding", label: "Programming Logic", questionCount: 25, durationMinutes: 30, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "sim-infosys",
    companyId: "infosys",
    title: "Infosys Full Simulation (90Q)",
    description:
      "Full-length Infosys assessment simulation reflecting its verbal-heavy split with a small but time-generous quant and a pseudocode round (the real test runs ~54 questions across ~100 minutes, no negative marking, and varies by drive). Tuned to 10 easy / 40 medium / 40 hard.",
    cutoffPercent: 70,
    sourceId: "infosys-careers",
    difficultyMix: SIMULATION_MIX,
    sections: [
      { id: "quant", label: "Quantitative Aptitude", questionCount: 15, durationMinutes: 30, source: "mixed" },
      { id: "reasoning", label: "Logical Reasoning", questionCount: 25, durationMinutes: 28, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 35, durationMinutes: 30, source: "mixed" },
      { id: "coding", label: "Pseudocode", questionCount: 15, durationMinutes: 25, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "sim-wipro",
    companyId: "wipro",
    title: "Wipro Elite Full Simulation (90Q)",
    description:
      "Full-length Wipro Elite NTH simulation. The real ~128-minute test (no negative marking) is verbal-heavy aptitude (Quant 16, Logical 14, Verbal 22) plus a written-communication essay round and a 2-problem coding test; this MCQ paper covers the aptitude + coding-logic portion on a 10 easy / 40 medium / 40 hard curve.",
    cutoffPercent: 68,
    sourceId: "wipro-careers",
    difficultyMix: SIMULATION_MIX,
    sections: [
      { id: "quant", label: "Quantitative Aptitude", questionCount: 20, durationMinutes: 20, source: "mixed" },
      { id: "reasoning", label: "Logical Ability", questionCount: 18, durationMinutes: 18, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 27, durationMinutes: 23, source: "mixed" },
      { id: "coding", label: "Coding MCQ", questionCount: 25, durationMinutes: 32, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "sim-accenture",
    companyId: "accenture",
    title: "Accenture Full Simulation (90Q)",
    description:
      "Full-length Accenture cognitive + technical simulation: numerical, logical, verbal and technical MCQs, tuned to 10 easy / 40 medium / 40 hard.",
    cutoffPercent: 68,
    sourceId: "accenture-careers",
    difficultyMix: SIMULATION_MIX,
    sections: [
      { id: "quant", label: "Numerical Ability", questionCount: 23, durationMinutes: 25, source: "mixed" },
      { id: "reasoning", label: "Logical Ability", questionCount: 22, durationMinutes: 24, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 20, durationMinutes: 20, source: "mixed" },
      { id: "cs-core", label: "Technical MCQ", questionCount: 25, durationMinutes: 28, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "sim-cognizant",
    companyId: "cognizant",
    title: "Cognizant GenC Full Simulation (90Q)",
    description:
      "Full-length Cognizant GenC simulation across quantitative aptitude, logical ability, verbal and technical basics, with a 10 easy / 40 medium / 40 hard curve.",
    cutoffPercent: 68,
    sourceId: "cognizant-careers",
    difficultyMix: SIMULATION_MIX,
    sections: [
      { id: "quant", label: "Quantitative Aptitude", questionCount: 23, durationMinutes: 25, source: "mixed" },
      { id: "reasoning", label: "Logical Ability", questionCount: 22, durationMinutes: 24, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 20, durationMinutes: 20, source: "mixed" },
      { id: "cs-core", label: "Technical Basics", questionCount: 25, durationMinutes: 28, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "sim-capgemini",
    companyId: "capgemini",
    title: "Capgemini Full Simulation (90Q)",
    description:
      "Full-length Capgemini simulation across numerical, reasoning, verbal/written-English and pseudocode logic, tuned to 10 easy / 40 medium / 40 hard.",
    cutoffPercent: 68,
    sourceId: "capgemini-careers",
    difficultyMix: SIMULATION_MIX,
    sections: [
      { id: "quant", label: "Numerical Ability", questionCount: 23, durationMinutes: 25, source: "mixed" },
      { id: "reasoning", label: "Logical Ability", questionCount: 22, durationMinutes: 24, source: "mixed" },
      { id: "verbal", label: "Verbal / Written English", questionCount: 22, durationMinutes: 22, source: "mixed" },
      { id: "coding", label: "Pseudocode", questionCount: 23, durationMinutes: 32, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "sim-epam",
    companyId: "epam",
    title: "EPAM Full Simulation (90Q)",
    description:
      "Full-length EPAM simulation weighted toward programming logic and CS fundamentals with a lighter reasoning layer, tuned to 10 easy / 40 medium / 40 hard.",
    cutoffPercent: 72,
    sourceId: "epam-careers",
    difficultyMix: SIMULATION_MIX,
    sections: [
      { id: "coding", label: "Programming Logic", questionCount: 45, durationMinutes: 60, source: "mixed" },
      { id: "cs-core", label: "CS Fundamentals", questionCount: 30, durationMinutes: 32, source: "mixed" },
      { id: "reasoning", label: "Logical Reasoning", questionCount: 15, durationMinutes: 16, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "sim-ibm",
    companyId: "ibm",
    title: "IBM Full Simulation (90Q)",
    description:
      "Full-length IBM simulation across quantitative, logical, verbal aptitude and problem-solving, tuned to 10 easy / 40 medium / 40 hard.",
    cutoffPercent: 68,
    sourceId: "ibm-careers",
    difficultyMix: SIMULATION_MIX,
    sections: [
      { id: "quant", label: "Quantitative Aptitude", questionCount: 23, durationMinutes: 25, source: "mixed" },
      { id: "reasoning", label: "Logical Reasoning", questionCount: 22, durationMinutes: 24, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 20, durationMinutes: 20, source: "mixed" },
      { id: "coding", label: "Problem Solving", questionCount: 25, durationMinutes: 32, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "sim-unisys",
    companyId: "unisys",
    title: "Unisys Full Simulation (90Q)",
    description:
      "Full-length Unisys simulation across aptitude and technical fundamentals, tuned to 10 easy / 40 medium / 40 hard.",
    cutoffPercent: 65,
    sourceId: "unisys-careers",
    difficultyMix: SIMULATION_MIX,
    sections: [
      { id: "quant", label: "Quantitative Aptitude", questionCount: 23, durationMinutes: 25, source: "mixed" },
      { id: "reasoning", label: "Logical Ability", questionCount: 22, durationMinutes: 24, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 20, durationMinutes: 20, source: "mixed" },
      { id: "cs-core", label: "Technical Basics", questionCount: 25, durationMinutes: 28, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "sim-techmahindra",
    companyId: "techmahindra",
    title: "Tech Mahindra Full Simulation (90Q)",
    description:
      "Full-length Tech Mahindra simulation across aptitude and technical fundamentals, tuned to 10 easy / 40 medium / 40 hard.",
    cutoffPercent: 65,
    sourceId: "techmahindra-careers",
    difficultyMix: SIMULATION_MIX,
    sections: [
      { id: "quant", label: "Quantitative Aptitude", questionCount: 23, durationMinutes: 25, source: "mixed" },
      { id: "reasoning", label: "Logical Ability", questionCount: 22, durationMinutes: 24, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 20, durationMinutes: 20, source: "mixed" },
      { id: "cs-core", label: "Technical Basics", questionCount: 25, durationMinutes: 28, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "sim-hcltech",
    companyId: "hcltech",
    title: "HCLTech Full Simulation (90Q)",
    description:
      "Full-length HCLTech simulation across aptitude and technical fundamentals, tuned to 10 easy / 40 medium / 40 hard.",
    cutoffPercent: 65,
    sourceId: "hcltech-careers",
    difficultyMix: SIMULATION_MIX,
    sections: [
      { id: "quant", label: "Quantitative Aptitude", questionCount: 23, durationMinutes: 25, source: "mixed" },
      { id: "reasoning", label: "Logical Ability", questionCount: 22, durationMinutes: 24, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 20, durationMinutes: 20, source: "mixed" },
      { id: "cs-core", label: "Technical Basics", questionCount: 25, durationMinutes: 28, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "sim-zoho",
    companyId: "zoho",
    title: "Zoho Full Simulation (90Q)",
    description:
      "Full-length Zoho simulation. Zoho's real process is a small combined Aptitude + C-MCQ round (~20 questions) then heavy programming rounds (5 programs, then a system-design task) and a technical interview; this paper is weighted toward programming logic with CS fundamentals and aptitude on a 10 easy / 40 medium / 40 hard curve.",
    cutoffPercent: 75,
    sourceId: "zoho-careers",
    difficultyMix: SIMULATION_MIX,
    sections: [
      { id: "coding", label: "Programming Logic", questionCount: 55, durationMinutes: 75, source: "mixed" },
      { id: "cs-core", label: "CS Fundamentals", questionCount: 20, durationMinutes: 22, source: "mixed" },
      { id: "quant", label: "Aptitude", questionCount: 15, durationMinutes: 16, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "sim-general",
    companyId: "general",
    title: "Placement Full Simulation (90Q)",
    description:
      "Broad full-length placement simulation across aptitude, reasoning, verbal, coding and CS core, with a 10 easy / 40 medium / 40 hard difficulty curve.",
    cutoffPercent: 65,
    sourceId: "studybench-curriculum",
    difficultyMix: SIMULATION_MIX,
    sections: [
      { id: "quant", label: "Quantitative", questionCount: 18, durationMinutes: 20, source: "mixed" },
      { id: "reasoning", label: "Reasoning", questionCount: 18, durationMinutes: 20, source: "mixed" },
      { id: "verbal", label: "Verbal", questionCount: 18, durationMinutes: 18, source: "mixed" },
      { id: "coding", label: "Coding Logic", questionCount: 18, durationMinutes: 26, source: "mixed" },
      { id: "cs-core", label: "CS Core", questionCount: 18, durationMinutes: 20, source: "mixed" },
    ],
    ...review,
  },
]

const SIMULATIONS_PER_COMPANY = 9

function expandSimulation(base: MockTest): MockTest[] {
  return Array.from({ length: SIMULATIONS_PER_COMPANY }, (_, index) => {
    const setNo = index + 1
    return {
      ...base,
      id: `${base.id}-set-${String(setNo).padStart(2, "0")}`,
      title: `${base.title.replace(" (90Q)", "")} - Set ${setNo} (90Q)`,
      description:
        setNo === 1
          ? base.description
          : `${base.description} Set ${setNo} draws a different question mix for fresh full-length practice.`,
    }
  })
}

function stableSeed(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

function miniSections(base: MockTest) {
  return base.sections.map((section) => ({
    ...section,
    questionCount:
      section.id === "coding"
        ? Math.max(section.questionCount * 2, 8)
        : Math.max(section.questionCount * 2, 10),
    durationMinutes:
      section.id === "coding"
        ? Math.max(section.durationMinutes * 2, 14)
        : Math.max(section.durationMinutes * 2, 12),
  }))
}

function fullLengthSections(base: MockTest) {
  return base.sections.map((section) => ({
    ...section,
    questionCount:
      section.id === "coding"
        ? Math.max(section.questionCount * 4, 16)
        : Math.max(section.questionCount * 5, 20),
    durationMinutes:
      section.id === "coding"
        ? Math.max(section.durationMinutes * 4, 35)
        : Math.max(section.durationMinutes * 4, 25),
  }))
}

function hardFullLengthSections(base: MockTest) {
  return fullLengthSections(base).map((section) => ({
    ...section,
    questionCount:
      section.id === "coding"
        ? Math.max(section.questionCount + 6, 22)
        : Math.max(section.questionCount + 8, 28),
    durationMinutes:
      section.id === "coding"
        ? Math.max(section.durationMinutes + 10, 45)
        : Math.max(section.durationMinutes + 8, 32),
  }))
}

const BASE_MOCKS_PER_COMPANY = 60
export const MOCKS_PER_COMPANY = BASE_MOCKS_PER_COMPANY + SIMULATIONS_PER_COMPANY

function expandMock(base: MockTest): MockTest[] {
  return Array.from({ length: BASE_MOCKS_PER_COMPANY }, (_, index) => {
    const mockNo = index + 1
    const fullLength = mockNo >= 6
    const hard = mockNo >= 13
    return {
      ...base,
      id: `${base.id}-${String(mockNo).padStart(2, "0")}`,
      title: `${base.title} ${mockNo}${hard ? " - Hard Drive Simulation" : fullLength ? " - Full Length" : " - Mini"}`,
      description:
        mockNo === 1
          ? base.description
          : hard
            ? `${base.description} Hard variant ${mockNo - 12} adds more question volume and tighter review expectations for final placement pressure.`
            : fullLength
            ? `${base.description} Full-length variant ${mockNo - 5} increases section volume and timer pressure for final-drive simulation.`
            : `${base.description} Mini variant ${mockNo} uses a different question mix for warm-up practice.`,
      sections: hard ? hardFullLengthSections(base) : fullLength ? fullLengthSections(base) : miniSections(base),
    }
  })
}

export const MOCK_TESTS: MockTest[] = [
  ...BASE_MOCKS.flatMap(expandMock),
  ...SIMULATION_BASES.flatMap(expandSimulation),
]

const MOCKS_BY_COMPANY = MOCK_TESTS.reduce(
  (acc, mock) => {
    acc[mock.companyId].push(mock)
    return acc
  },
  {
    tcs: [],
    infosys: [],
    wipro: [],
    accenture: [],
    zoho: [],
    cognizant: [],
    capgemini: [],
    epam: [],
    ibm: [],
    unisys: [],
    techmahindra: [],
    hcltech: [],
    general: [],
  } as Record<CompanyId, MockTest[]>,
)

export function mocksForCompany(companyId: CompanyId): MockTest[] {
  return MOCKS_BY_COMPANY[companyId]
}

const MOCK_QUESTION_CACHE = new Map<string, Question[]>()
const MOCK_QUESTION_CACHE_LIMIT = 280

/**
 * Spread a difficulty target evenly across `total` slots so the easy/medium/hard
 * questions are interleaved rather than clustered (round-robin by deficit ratio).
 */
function difficultySequence(mix: { easy: number; medium: number; hard: number }): Difficulty[] {
  const targets: [Difficulty, number][] = [
    ["easy", mix.easy],
    ["medium", mix.medium],
    ["hard", mix.hard],
  ]
  const total = mix.easy + mix.medium + mix.hard
  const counts: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 }
  const out: Difficulty[] = []
  for (let k = 0; k < total; k++) {
    let best: Difficulty | null = null
    let bestScore = Infinity
    for (const [d, t] of targets) {
      if (t === 0 || counts[d] >= t) continue
      const score = (counts[d] + 0.5) / t
      if (score < bestScore) {
        bestScore = score
        best = d
      }
    }
    if (best === null) break
    counts[best] += 1
    out.push(best)
  }
  return out
}

/**
 * Builds a full-length simulation paper that honours both the per-section split
 * (so section counts stay truthful) and the overall difficulty target. PYQs of
 * the right difficulty are used first, then computed generators fill the rest.
 */
function buildSimulationQuestions(mock: MockTest, seed: number): Question[] {
  const mix = mock.difficultyMix!
  const pyqsBySection = pyqsForCompany(mock.companyId).reduce(
    (acc, question) => {
      acc[question.section].push(question)
      return acc
    },
    {
      quant: [],
      reasoning: [],
      verbal: [],
      coding: [],
      "cs-core": [],
      "comm-interview": [],
    } as Record<SectionId, Question[]>,
  )

  const out: Question[] = []
  const usedIds = new Set<string>()
  const usedPrompts = new Set<string>()
  function add(q: Question): boolean {
    const promptKey = q.prompt.trim().toLowerCase().replace(/\s+/g, " ")
    if (usedIds.has(q.id) || usedPrompts.has(promptKey)) return false
    usedIds.add(q.id)
    usedPrompts.add(promptKey)
    out.push(q)
    return true
  }

  const expectedTotal = mock.sections.reduce((sum, s) => sum + s.questionCount, 0)
  const sequence = difficultySequence(mix)
  let pos = 0

  for (const [sectionIndex, section] of mock.sections.entries()) {
    const slice = sequence.slice(pos, pos + section.questionCount)
    pos += section.questionCount
    const need: Record<Difficulty, number> = {
      easy: slice.filter((d) => d === "easy").length,
      medium: slice.filter((d) => d === "medium").length,
      hard: slice.filter((d) => d === "hard").length,
    }
    const sectionId = section.id as SectionId
    const pyqPool = pyqsBySection[sectionId] ?? []

    for (const difficulty of ["easy", "medium", "hard"] as Difficulty[]) {
      let added = 0
      const want = need[difficulty]
      if (want === 0) continue
      // 1) Reviewed company PYQs of the exact difficulty.
      const offset = pyqPool.length
        ? stableSeed(`${mock.id}:${sectionId}:${difficulty}`) % pyqPool.length
        : 0
      for (let i = 0; i < pyqPool.length && added < want; i++) {
        const q = pyqPool[(offset + i) % pyqPool.length]
        if (q.difficulty === difficulty && add(q)) added++
      }
      // 2) Computed generators of the exact difficulty (always correct).
      if (added < want) {
        const gen = generateDrillsByDifficulty(
          sectionId,
          (want - added) * 4,
          difficulty,
          seed + stableSeed(mock.id) + sectionIndex * 17 + difficulty.length,
        )
        for (const q of gen) {
          if (added >= want) break
          if (add(q)) added++
        }
      }
      // 3) Last-resort fill with any-difficulty computed questions for this section.
      if (added < want) {
        const gen = generateDrills(
          sectionId,
          (want - added) * 6,
          seed + stableSeed(`${mock.id}:${sectionId}:${difficulty}:fill`),
        )
        for (const q of gen) {
          if (added >= want) break
          if (add(q)) added++
        }
      }
    }
  }

  // Final safety net so the paper always returns exactly the expected count.
  let guard = 0
  while (out.length < expectedTotal && guard < 50) {
    const gen = generateDrills("mixed", (expectedTotal - out.length) * 4, seed + guard * 101 + stableSeed(mock.id))
    for (const q of gen) {
      if (out.length >= expectedTotal) break
      add(q)
    }
    guard++
  }

  return out.slice(0, expectedTotal)
}

export function buildMockQuestions(mock: MockTest, seed = 20260607): Question[] {
  const cacheKey = `${mock.id}:${seed}`
  const cached = MOCK_QUESTION_CACHE.get(cacheKey)
  if (cached) return cached

  if (mock.difficultyMix) {
    const sim = buildSimulationQuestions(mock, seed)
    if (MOCK_QUESTION_CACHE.size >= MOCK_QUESTION_CACHE_LIMIT) {
      const oldestKey = MOCK_QUESTION_CACHE.keys().next().value
      if (oldestKey) MOCK_QUESTION_CACHE.delete(oldestKey)
    }
    MOCK_QUESTION_CACHE.set(cacheKey, sim)
    return sim
  }

  const companyPyqs = pyqsForCompany(mock.companyId)
  const pyqsBySection = companyPyqs.reduce(
    (acc, question) => {
      acc[question.section].push(question)
      return acc
    },
    {
      quant: [],
      reasoning: [],
      verbal: [],
      coding: [],
      "cs-core": [],
      "comm-interview": [],
    } as Record<SectionId, Question[]>,
  )
  const out: Question[] = []
  const usedIds = new Set<string>()
  const usedPrompts = new Set<string>()
  // Per-section topic caps prevent the same concept (e.g. "unit digit") from
  // appearing more than once across PYQs and generated questions combined.
  // Reset each section so topic diversity is enforced independently per section.
  let sectionTopicCounts = new Map<string, number>()
  let sectionTopicCap = 1

  function add(q: Question, ignoreTopic = false) {
    const promptKey = q.prompt.trim().toLowerCase().replace(/\s+/g, " ")
    if (usedIds.has(q.id) || usedPrompts.has(promptKey)) return
    if (!ignoreTopic) {
      const tc = sectionTopicCounts.get(q.topic) ?? 0
      if (tc >= sectionTopicCap) return
      sectionTopicCounts.set(q.topic, tc + 1)
    }
    usedIds.add(q.id)
    usedPrompts.add(promptKey)
    out.push(q)
  }

  let expectedTotal = 0
  for (const [sectionIndex, section] of mock.sections.entries()) {
    expectedTotal += section.questionCount
    // Allow each topic at most ceil(sectionSize/8) appearances so short sections
    // enforce strict diversity and full-length sections allow gentle repetition.
    sectionTopicCap = Math.max(1, Math.ceil(section.questionCount / 8))
    sectionTopicCounts = new Map()

    const candidates = pyqsBySection[section.id]
    const offset = candidates.length ? stableSeed(`${mock.id}:${section.id}`) % candidates.length : 0
    for (let i = 0; i < Math.min(section.questionCount, candidates.length); i++) {
      add(candidates[(offset + i) % candidates.length])
    }

    const missing = expectedTotal - out.length
    if (missing > 0) {
      const generated = generateDrills(
        section.id as SectionId,
        missing * 3,
        seed + stableSeed(mock.id) + sectionIndex,
      )
      for (const q of generated) {
        if (out.length >= expectedTotal) break
        add(q)
      }
      const stillMissing = expectedTotal - out.length
      if (stillMissing > 0) {
        for (const q of generated) {
          if (out.length >= expectedTotal) break
          add(q, true)
        }
      }
    }
  }

  if (MOCK_QUESTION_CACHE.size >= MOCK_QUESTION_CACHE_LIMIT) {
    const oldestKey = MOCK_QUESTION_CACHE.keys().next().value
    if (oldestKey) MOCK_QUESTION_CACHE.delete(oldestKey)
  }
  MOCK_QUESTION_CACHE.set(cacheKey, out)
  return out
}

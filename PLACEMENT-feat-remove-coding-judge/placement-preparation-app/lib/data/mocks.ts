import { generateDrills, generateDrillsByDifficulty } from "@/lib/data/question-bank"
import { pyqsForCompany } from "@/lib/data/pyqs"
import type { CompanyId, Difficulty, MockTest, Question, SectionId } from "@/lib/types"

const review = {
  originalStatus: "reconstructed",
  status: "reviewed",
  reviewedBy: "StudyBench SME Review",
  lastReviewed: "2026-06-07",
} as const



/**
 * Company-pattern placement simulations. Public recruiter patterns change by
 * drive, role and campus, so these mocks model the stable public structure
 * instead of forcing every company into the same 90-question paper.
 */
function patternMix(total: number): { easy: number; medium: number; hard: number } {
  const easy = Math.max(8, Math.round(total * 0.12))
  const hard = Math.round(total * 0.44)
  return { easy, medium: total - easy - hard, hard }
}

const SIMULATION_BASES: MockTest[] = [
  {
    id: "sim-tcs-nqt",
    companyId: "tcs",
    title: "TCS NQT Full Simulation (82Q)",
    description:
      "TCS NQT simulation aligned to the public Foundation + Advanced structure: numerical, reasoning, verbal, advanced aptitude and programming logic. The official NQT is a 190-minute integrated test with hands-on coding; this browser mock covers the 82-question aptitude/programming-logic layer and keeps coding practice separate.",
    cutoffPercent: 70,
    sourceId: "tcs-nqt-official",
    difficultyMix: patternMix(82),
    sections: [
      { id: "quant", label: "Numerical Ability", questionCount: 20, durationMinutes: 25, source: "mixed" },
      { id: "reasoning", label: "Reasoning Ability", questionCount: 20, durationMinutes: 25, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 25, durationMinutes: 25, source: "mixed" },
      { id: "quant", label: "Advanced Quantitative Ability", questionCount: 10, durationMinutes: 20, source: "mixed" },
      { id: "coding", label: "Programming Logic", questionCount: 7, durationMinutes: 15, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "sim-infosys",
    companyId: "infosys",
    title: "Infosys Full Simulation (54Q)",
    description:
      "Infosys simulation following the commonly used 54-question public pattern: reasoning, mathematical ability, verbal and pseudocode. Timing is intentionally close to the longer, accuracy-focused Infosys assessment style.",
    cutoffPercent: 70,
    sourceId: "infosys-careers",
    difficultyMix: patternMix(54),
    sections: [
      { id: "reasoning", label: "Reasoning Ability", questionCount: 15, durationMinutes: 25, source: "mixed" },
      { id: "quant", label: "Mathematical Ability", questionCount: 10, durationMinutes: 35, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 20, durationMinutes: 20, source: "mixed" },
      { id: "coding", label: "Pseudocode", questionCount: 9, durationMinutes: 10, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "sim-wipro",
    companyId: "wipro",
    title: "Wipro Elite Full Simulation (52Q)",
    description:
      "Wipro Elite NTH aptitude simulation aligned to the public 52-question MCQ layer: quantitative, logical and verbal. Written communication and two coding problems are represented elsewhere in StudyBench as essay/interview and coding practice.",
    cutoffPercent: 68,
    sourceId: "wipro-careers",
    difficultyMix: patternMix(52),
    sections: [
      { id: "quant", label: "Quantitative Aptitude", questionCount: 16, durationMinutes: 16, source: "mixed" },
      { id: "reasoning", label: "Logical Ability", questionCount: 14, durationMinutes: 14, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 22, durationMinutes: 18, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "sim-accenture",
    companyId: "accenture",
    title: "Accenture Full Simulation (90Q)",
    description:
      "Accenture cognitive + technical simulation covering numerical, logical, verbal and technical MCQs. Coding and communication are practised as separate rounds, matching the public multi-stage Accenture assessment flow.",
    cutoffPercent: 68,
    sourceId: "accenture-careers",
    difficultyMix: patternMix(90),
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
    title: "Cognizant GenC Full Simulation (70Q)",
    description:
      "Cognizant GenC simulation across aptitude, logical, verbal and technical basics, with Automata-style coding practice handled in the coding ladder.",
    cutoffPercent: 68,
    sourceId: "cognizant-careers",
    difficultyMix: patternMix(70),
    sections: [
      { id: "quant", label: "Quantitative Aptitude", questionCount: 18, durationMinutes: 20, source: "mixed" },
      { id: "reasoning", label: "Logical Ability", questionCount: 18, durationMinutes: 20, source: "mixed" },
      { id: "verbal", label: "Verbal Ability", questionCount: 18, durationMinutes: 18, source: "mixed" },
      { id: "cs-core", label: "Technical Basics", questionCount: 16, durationMinutes: 22, source: "mixed" },
    ],
    ...review,
  },
  {
    id: "sim-zoho",
    companyId: "zoho",
    title: "Zoho Full Simulation (75Q)",
    description:
      "Zoho simulation weighted toward programming logic, CS fundamentals and aptitude. Zoho's public process is programming-heavy, so the mock prioritises logic while machine coding and system design live in the coding ladder.",
    cutoffPercent: 75,
    sourceId: "zoho-careers",
    difficultyMix: patternMix(75),
    sections: [
      { id: "coding", label: "Programming Logic", questionCount: 42, durationMinutes: 55, source: "mixed" },
      { id: "cs-core", label: "CS Fundamentals", questionCount: 18, durationMinutes: 22, source: "mixed" },
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
    difficultyMix: patternMix(90),
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

const SIMULATIONS_PER_COMPANY = 10

function expandSimulation(base: MockTest): MockTest[] {
  return Array.from({ length: SIMULATIONS_PER_COMPANY }, (_, index) => {
    const setNo = index + 1
    return {
      ...base,
      id: `${base.id}-set-${String(setNo).padStart(2, "0")}`,
      title: `${base.title.replace(/ \(\d+Q\)$/, "")} - Set ${setNo} (${base.sections.reduce((sum, section) => sum + section.questionCount, 0)}Q)`,
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


export const MOCKS_PER_COMPANY = SIMULATIONS_PER_COMPANY

export const MOCK_TESTS: MockTest[] = [
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

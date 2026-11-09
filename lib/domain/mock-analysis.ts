import type { Difficulty, MockSection, SectionId } from "@/lib/types"

export type TopicAccuracy = {
  topic: string
  total: number
  correct: number
  wrong: number
  accuracy: number
  avgTimeSec: number
}

export type SectionPerformance = {
  id: SectionId
  label: string
  total: number
  correct: number
  wrong: number
  accuracy: number
  avgTimeSec: number
  estimatedPercentile: number
}

export type DifficultyPerformance = {
  difficulty: Difficulty
  total: number
  correct: number
  accuracy: number
  avgTimeSec: number
}

export type TimeInsight = {
  questionNo: number
  topic: string
  difficulty?: Difficulty
  timeSpentSec: number
  correct: boolean
}

export type CutoffPrediction = {
  status: "clear" | "near" | "risk"
  label: string
  detail: string
  questionsToCutoff: number
  projectedScore: number
}

export type LossBreakdown = {
  speed: number
  concept: number
  careless: number
  unanswered: number
  summary: string
}

export type MockAnalysis = {
  scorePct: number
  cutoff: number
  weakTopics: { topic: string; total: number; wrong: number }[]
  topicAccuracy: TopicAccuracy[]
  sectionStats: SectionPerformance[]
  difficultyStats: DifficultyPerformance[]
  slowQuestions: TimeInsight[]
  lossBreakdown: LossBreakdown
  cutoffPrediction: CutoffPrediction
  avgTimeSec: number
  carelessRisk: string
  nextTasks: string[]
}

export type MockResultItem = {
  topic: string
  correct: boolean
  questionIndex?: number
  difficulty?: Difficulty
  timeSpentSec?: number
  timedOut?: boolean
}

type BuildMockAnalysisOptions = {
  sections?: MockSection[]
  timeLimitSec?: number
}

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"]

function pct(correct: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((correct / total) * 100)
}

function avg(values: number[]): number {
  const usable = values.filter((value) => value > 0)
  if (usable.length === 0) return 0
  return Math.round(usable.reduce((sum, value) => sum + value, 0) / usable.length)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function sectionForIndex(
  sections: MockSection[] | undefined,
  index: number | undefined,
): MockSection | null {
  if (!sections?.length || index == null) return null
  let start = 0
  for (const section of sections) {
    const end = start + section.questionCount
    if (index >= start && index < end) return section
    start = end
  }
  return null
}

function percentileFor(score: number, avgTimeSec: number, targetTimeSec: number): number {
  const speedBonus = targetTimeSec > 0 && avgTimeSec > 0 ? clamp((targetTimeSec - avgTimeSec) / targetTimeSec, -0.2, 0.2) * 20 : 0
  return clamp(Math.round(score * 0.9 + speedBonus + 8), 1, 99)
}

function cutoffPredictionFor(
  scorePct: number,
  cutoff: number,
  totalQuestions: number,
  recoverableSpeedMarks: number,
): CutoffPrediction {
  const gap = cutoff - scorePct
  const questionsToCutoff = Math.max(0, Math.ceil((gap / 100) * Math.max(1, totalQuestions)))
  const projectedScore = clamp(
    Math.round(scorePct + (recoverableSpeedMarks / Math.max(1, totalQuestions)) * 100),
    0,
    100,
  )

  if (scorePct >= cutoff) {
    return {
      status: "clear",
      label: "Cutoff likely cleared",
      detail: "Your score is above the mock cutoff. Repeat once under the same timer to confirm consistency.",
      questionsToCutoff: 0,
      projectedScore,
    }
  }

  if (questionsToCutoff <= 3 || projectedScore >= cutoff) {
    return {
      status: "near",
      label: "Cutoff is within reach",
      detail: `You need about ${questionsToCutoff} more correct answer${questionsToCutoff === 1 ? "" : "s"}. Speed repair can realistically close this gap.`,
      questionsToCutoff,
      projectedScore,
    }
  }

  return {
    status: "risk",
    label: "Cutoff risk is high",
    detail: `You need about ${questionsToCutoff} more correct answers. Repair concepts before taking another full mock.`,
    questionsToCutoff,
    projectedScore,
  }
}

export function buildMockAnalysis(
  results: MockResultItem[],
  scorePct: number,
  cutoff: number,
  options: BuildMockAnalysisOptions = {},
): MockAnalysis {
  const totalQuestions = Math.max(1, results.length)
  const targetTimeSec =
    options.timeLimitSec && results.length
      ? Math.max(20, Math.round(options.timeLimitSec / results.length))
      : 75

  const topicMap = new Map<string, TopicAccuracy>()
  const sectionMap = new Map<string, SectionPerformance>()
  const difficultyMap = new Map<Difficulty, DifficultyPerformance>()

  let speedLoss = 0
  let conceptLoss = 0
  let carelessLoss = 0
  let unansweredLoss = 0

  for (const result of results) {
    const timeSpentSec = result.timeSpentSec ?? 0
    const topic = topicMap.get(result.topic) ?? {
      topic: result.topic,
      total: 0,
      correct: 0,
      wrong: 0,
      accuracy: 0,
      avgTimeSec: 0,
    }
    topic.total += 1
    topic.correct += result.correct ? 1 : 0
    topic.wrong += result.correct ? 0 : 1
    topic.avgTimeSec = avg([...Array(topic.total - 1).fill(topic.avgTimeSec), timeSpentSec])
    topic.accuracy = pct(topic.correct, topic.total)
    topicMap.set(result.topic, topic)

    const difficulty = result.difficulty
    if (difficulty) {
      const current = difficultyMap.get(difficulty) ?? {
        difficulty,
        total: 0,
        correct: 0,
        accuracy: 0,
        avgTimeSec: 0,
      }
      current.total += 1
      current.correct += result.correct ? 1 : 0
      current.accuracy = pct(current.correct, current.total)
      current.avgTimeSec = avg([...Array(current.total - 1).fill(current.avgTimeSec), timeSpentSec])
      difficultyMap.set(difficulty, current)
    }

    const section = sectionForIndex(options.sections, result.questionIndex)
    if (section) {
      const current = sectionMap.get(section.id) ?? {
        id: section.id,
        label: section.label,
        total: 0,
        correct: 0,
        wrong: 0,
        accuracy: 0,
        avgTimeSec: 0,
        estimatedPercentile: 0,
      }
      current.total += 1
      current.correct += result.correct ? 1 : 0
      current.wrong += result.correct ? 0 : 1
      current.accuracy = pct(current.correct, current.total)
      current.avgTimeSec = avg([...Array(current.total - 1).fill(current.avgTimeSec), timeSpentSec])
      const sectionTargetTime = Math.round((section.durationMinutes * 60) / Math.max(1, section.questionCount))
      current.estimatedPercentile = percentileFor(current.accuracy, current.avgTimeSec, sectionTargetTime)
      sectionMap.set(section.id, current)
    }

    if (!result.correct) {
      if (result.timedOut || timeSpentSec === 0) unansweredLoss += 1
      else if (timeSpentSec > targetTimeSec * 1.2) speedLoss += 1
      else if (result.difficulty === "easy") carelessLoss += 1
      else conceptLoss += 1
    }
  }

  const topicAccuracy = [...topicMap.values()].sort(
    (a, b) => a.accuracy - b.accuracy || b.total - a.total,
  )
  const weakTopics = [...topicMap.values()]
    .filter((item) => item.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong || b.total - a.total)
    .map(({ topic, total, wrong }) => ({ topic, total, wrong }))
    .slice(0, 3)
  const avgTimeSec = avg(results.map((result) => result.timeSpentSec ?? 0))
  const slowQuestions = results
    .filter((result) => (result.timeSpentSec ?? 0) > 0)
    .sort((a, b) => (b.timeSpentSec ?? 0) - (a.timeSpentSec ?? 0))
    .slice(0, 5)
    .map((result) => ({
      questionNo: (result.questionIndex ?? 0) + 1,
      topic: result.topic,
      difficulty: result.difficulty,
      timeSpentSec: result.timeSpentSec ?? 0,
      correct: result.correct,
    }))

  const difficultyStats = DIFFICULTIES.map(
    (difficulty) =>
      difficultyMap.get(difficulty) ?? {
        difficulty,
        total: 0,
        correct: 0,
        accuracy: 0,
        avgTimeSec: 0,
      },
  )
  const sectionStats = options.sections?.length
    ? options.sections.map(
        (section) =>
          sectionMap.get(section.id) ?? {
            id: section.id,
            label: section.label,
            total: 0,
            correct: 0,
            wrong: 0,
            accuracy: 0,
            avgTimeSec: 0,
            estimatedPercentile: 0,
          },
      )
    : []

  const lossBreakdown: LossBreakdown = {
    speed: speedLoss,
    concept: conceptLoss,
    careless: carelessLoss,
    unanswered: unansweredLoss,
    summary:
      speedLoss > conceptLoss
        ? "Most lost marks came from time pressure. Practise timed sections before another full mock."
        : conceptLoss > 0
          ? "Most lost marks came from concept gaps. Repair the weakest topics before retaking."
          : carelessLoss > 0
            ? "Easy misses are costing marks. Slow down on direct questions and recheck units/options."
            : "No major loss pattern from this attempt.",
  }
  const cutoffPrediction = cutoffPredictionFor(
    scorePct,
    cutoff,
    totalQuestions,
    speedLoss + unansweredLoss,
  )

  const gap = cutoff - scorePct
  return {
    scorePct,
    cutoff,
    weakTopics,
    topicAccuracy,
    sectionStats,
    difficultyStats,
    slowQuestions,
    lossBreakdown,
    cutoffPrediction,
    avgTimeSec,
    carelessRisk:
      scorePct >= cutoff
        ? "You cleared the cutoff. Now reduce careless misses and repeat under full timer."
        : gap <= 8
          ? "You are close to cutoff. One weak topic or speed block is probably costing the attempt."
          : "There is a concept gap. Do not take another full mock before repairing the top weak topics.",
    nextTasks: [
      weakTopics[0] ? `Revise ${weakTopics[0].topic}` : "Redo the toughest wrong question",
      lossBreakdown.speed || lossBreakdown.unanswered
        ? "Retake wrong questions with a 60-second cap"
        : "Retake one timed section tomorrow",
      "Write one missed rule into revision notes",
    ],
  }
}

export function mockPressureLabel(totalQuestions: number, timeLimitSec: number): "high" | "medium" | "warm-up" {
  const minutes = Math.max(1, Math.round(timeLimitSec / 60))
  const perQuestion = minutes / Math.max(1, totalQuestions)
  if (totalQuestions >= 70 || perQuestion < 1.2) return "high"
  if (totalQuestions >= 35 || perQuestion < 1.8) return "medium"
  return "warm-up"
}

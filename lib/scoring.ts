import { getCompany } from "@/lib/data/companies"
import { getSections } from "@/lib/data/content"
import type {
  AppState,
  CompanyId,
  CompanyProgress,
  DriveOutcome,
  SectionId,
} from "@/lib/types"

/** PRI component weights. Must sum to 1. */
export const PRI_WEIGHTS: Record<SectionId | "mock", number> = {
  quant: 0.2,
  reasoning: 0.13,
  verbal: 0.1,
  coding: 0.22,
  "cs-core": 0.1,
  "comm-interview": 0.1,
  mock: 0.15,
}

export const EMPTY_PROGRESS: CompanyProgress = { chapters: {}, mockScores: [] }

/**
 * Section mastery 0-100 for a company. Each chapter contributes its best quiz
 * score if passed, and skipped or unattempted chapters contribute 0.
 */
export function sectionMastery(
  companyId: CompanyId,
  sectionId: SectionId,
  progress: CompanyProgress,
): number {
  const section = getSections(companyId).find((s) => s.id === sectionId)
  if (!section || section.chapters.length === 0) return 0
  let sum = 0
  for (const ch of section.chapters) {
    const cp = progress.chapters[ch.id]
    if (cp && cp.passed && !cp.skipped) sum += cp.bestScore
  }
  return Math.round(sum / section.chapters.length)
}

export function mockMastery(progress: CompanyProgress): number {
  if (progress.mockScores.length === 0) return 0
  return Math.round(
    progress.mockScores.reduce((a, b) => a + b, 0) / progress.mockScores.length,
  )
}

/** 0-100 Placement Readiness Index for one company. */
export function computePRI(
  companyId: CompanyId,
  progress: CompanyProgress = EMPTY_PROGRESS,
): number {
  const sectionIds: SectionId[] = [
    "quant",
    "reasoning",
    "verbal",
    "coding",
    "cs-core",
    "comm-interview",
  ]
  let pri = 0
  for (const sid of sectionIds) {
    pri += sectionMastery(companyId, sid, progress) * PRI_WEIGHTS[sid]
  }
  pri += mockMastery(progress) * PRI_WEIGHTS.mock
  return Math.round(pri)
}

/**
 * Forward-looking PRI points gained by passing `chapterId` at `atScore`.
 * The default 85 represents a strong pass, not a perfect score.
 */
export function expectedPriGain(
  companyId: CompanyId,
  chapterId: string,
  progress: CompanyProgress = EMPTY_PROGRESS,
  atScore = 85,
): number {
  const current = computePRI(companyId, progress)
  const prev = progress.chapters[chapterId]
  const projected: CompanyProgress = {
    chapters: {
      ...progress.chapters,
      [chapterId]: {
        bestScore: Math.max(atScore, prev?.bestScore ?? 0),
        passed: true,
        skipped: false,
        attempts: prev?.attempts ?? 0,
      },
    },
    mockScores: progress.mockScores,
  }
  return Math.max(0, computePRI(companyId, projected) - current)
}

/**
 * Estimated placement probability. It is bounded so it never reads as a
 * guaranteed rejection or a guaranteed selection.
 */
export function placementProbability(companyId: CompanyId, pri: number): number {
  const c = getCompany(companyId)
  const gap = pri - c.cutoffPRI
  const raw = 50 + gap * c.slope
  return Math.round(Math.min(97, Math.max(2, raw)))
}

export const PROBABILITY_DISCLAIMER =
  "Readiness estimate based on your in-app practice - not a guarantee of selection."

/** Overall readiness across interested companies; primary target is weighted 2x. */
export function overallReadiness(state: AppState): number {
  const list = state.interested
  if (list.length === 0) return 0
  let weighted = 0
  let weightSum = 0
  for (const id of list) {
    const w = id === state.primary ? 2 : 1
    weighted += computePRI(id, state.progress[id]) * w
    weightSum += w
  }
  return Math.round(weighted / weightSum)
}

export type Band = { label: string; tone: "danger" | "warning" | "info" | "success" }

export function priBand(pri: number): Band {
  if (pri >= 75) return { label: "Placement-ready", tone: "success" }
  if (pri >= 55) return { label: "On track", tone: "info" }
  if (pri >= 30) return { label: "Needs work", tone: "warning" }
  return { label: "Just getting started", tone: "danger" }
}

export function probabilityBand(p: number): Band {
  if (p >= 70) return { label: "Strong", tone: "success" }
  if (p >= 45) return { label: "Fair", tone: "info" }
  if (p >= 25) return { label: "Low", tone: "warning" }
  return { label: "Very low", tone: "danger" }
}

/**
 * Readiness band derived directly from the PRI (a study signal, not a hiring
 * prediction). Preferred over a numeric "chance of getting placed", which is a
 * legal risk. Bands map to the same thresholds as priBand.
 */
export function readinessBand(pri: number): Band {
  if (pri >= 75) return { label: "Highly Ready", tone: "success" }
  if (pri >= 55) return { label: "Ready", tone: "info" }
  if (pri >= 30) return { label: "Developing", tone: "warning" }
  return { label: "Beginner", tone: "danger" }
}

export const READINESS_DISCLAIMER =
  "A readiness signal from your in-app practice. It is not a prediction or guarantee of selection."

export const XP = {
  correctFirst: 10,
  correctRetry: 4,
  lesson: 25,
  quizPass: 50,
  daily: 30,
  mock: 100,
  streak7: 50,
  streak30: 200,
  streak100: 500,
} as const

/** Cumulative XP required to reach a level: 0, 250, 600, 1100, 1800, then +900. */
export function levelThreshold(level: number): number {
  const base = [0, 0, 250, 600, 1100, 1800]
  if (level <= 5) return base[level]
  return 1800 + (level - 5) * 900
}

export function levelFromXP(xp: number): {
  level: number
  intoLevel: number
  span: number
  pct: number
} {
  let level = 1
  while (xp >= levelThreshold(level + 1)) level++
  const start = levelThreshold(level)
  const next = levelThreshold(level + 1)
  const span = next - start
  const intoLevel = xp - start
  return { level, intoLevel, span, pct: Math.round((intoLevel / span) * 100) }
}

export interface TopicAccuracy {
  topic: string
  correct: number
  total: number
  accuracy: number
}

export function topicAccuracies(state: AppState, minTotal = 1): TopicAccuracy[] {
  return Object.entries(state.topicStats)
    .map(([topic, s]) => ({
      topic,
      correct: s.correct,
      total: s.total,
      accuracy: s.total ? Math.round((s.correct / s.total) * 100) : 0,
    }))
    .filter((t) => t.total >= minTotal)
}

// ---- Drive-outcome calibration ----------------------------------------------

/** The PRI at/above which the app reads a student as "Ready" (see readinessBand). */
export const READY_THRESHOLD = 55

export interface OutcomeCalibration {
  total: number
  /** Drives with a decided result (selected or rejected). */
  decided: number
  selected: number
  rejected: number
  /** Mean PRI-at-drive among selected results, or null when none. */
  avgPriSelected: number | null
  /** Mean PRI-at-drive among rejected results, or null when none. */
  avgPriRejected: number | null
  /**
   * avgPriSelected − avgPriRejected. Positive means a higher in-app PRI lined
   * up with better real outcomes for this student. Null until both groups exist.
   */
  separation: number | null
  /**
   * Fraction (0-1) of decided drives where the readiness band agreed with the
   * real result: Ready→selected or Not-ready→rejected. Null when none decided.
   */
  agreement: number | null
}

function mean(xs: number[]): number | null {
  if (xs.length === 0) return null
  return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length)
}

/**
 * Honest backtest of the Readiness signal against real, self-reported drive
 * outcomes. It never claims the app predicts hiring — it just reports whether,
 * for this student, a higher PRI coincided with better real results.
 */
export function outcomeCalibration(
  outcomes: DriveOutcome[],
  threshold = READY_THRESHOLD,
): OutcomeCalibration {
  const selected = outcomes.filter((o) => o.result === "selected")
  const rejected = outcomes.filter((o) => o.result === "rejected")
  const decided = selected.length + rejected.length
  const avgPriSelected = mean(selected.map((o) => o.priAtDrive))
  const avgPriRejected = mean(rejected.map((o) => o.priAtDrive))
  const agreeing =
    selected.filter((o) => o.priAtDrive >= threshold).length +
    rejected.filter((o) => o.priAtDrive < threshold).length
  return {
    total: outcomes.length,
    decided,
    selected: selected.length,
    rejected: rejected.length,
    avgPriSelected,
    avgPriRejected,
    separation:
      avgPriSelected !== null && avgPriRejected !== null
        ? avgPriSelected - avgPriRejected
        : null,
    agreement: decided > 0 ? agreeing / decided : null,
  }
}

export function weakestTopics(state: AppState, n = 5): TopicAccuracy[] {
  return topicAccuracies(state)
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total)
    .slice(0, n)
}

export function strongestTopics(state: AppState, n = 5): TopicAccuracy[] {
  return topicAccuracies(state)
    .sort((a, b) => b.accuracy - a.accuracy || b.total - a.total)
    .slice(0, n)
}

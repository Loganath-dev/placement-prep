// Core domain types for StudyBench.

export type CompanyId =
  | "tcs"
  | "infosys"
  | "wipro"
  | "accenture"
  | "zoho"
  | "cognizant"
  | "capgemini"
  | "epam"
  | "ibm"
  | "unisys"
  | "techmahindra"
  | "hcltech"
  | "general"

export type SectionId =
  | "quant"
  | "reasoning"
  | "verbal"
  | "coding"
  | "cs-core"
  | "comm-interview"

export type Difficulty = "easy" | "medium" | "hard"
export type ContentStatus = "draft" | "reviewed" | "live" | "needs_revision"
export type OriginalStatus = "original" | "licensed" | "reconstructed"

export interface ContentSource {
  id: string
  title: string
  publisher: string
  url?: string
  kind: "official" | "book" | "youtube" | "reference"
  note: string
}

export interface Question {
  id: string
  topic: string
  difficulty: Difficulty
  prompt: string
  options: string[]
  answer: number // index into options
  explanation: string
  sourceId?: string
  /**
   * True for hand-authored, trainer-reviewed questions (the "flagship" layer).
   * Falsy for parametric drill volume produced by the generator. The UI shows a
   * distinct badge so students can tell curated content from auto-generated
   * practice, and we never pass generated volume off as expert-written.
   */
  curated?: boolean
  /**
   * Per-option rationale, parallel to `options` — why each choice is right or
   * wrong. This is the deepest expert-authoring layer: it teaches the student
   * to recognise *why* a distractor is tempting, not just the final answer.
   * Present only on flagship questions; the quiz runner renders it on reveal.
   */
  optionNotes?: string[]
}

export interface ContentReviewMeta {
  sourceId: string
  originalStatus: OriginalStatus
  status: ContentStatus
  reviewedBy: string
  lastReviewed: string
}

export interface Lesson {
  id: string
  title: string
  minutes: number
  /** Lightweight markdown-ish body rendered by <Prose />. */
  body: string
  sourceIds?: string[]
}

export interface Chapter {
  id: string
  title: string
  summary: string
  lessons: Lesson[]
  quiz: Question[]
}

export interface Section {
  id: SectionId
  name: string
  short: string
  icon: string // lucide-react icon name
  blurb: string
  chapters: Chapter[]
}

export interface Eligibility {
  cgpa: string
  backlogs: string
  tenthTwelfth: string
  pattern: string[]
  rounds: string[]
  sourceId: string
  lastVerified: string
}

export interface Company {
  id: CompanyId
  name: string
  short: string
  /** Brand-ish accent (oklch) used for rings/badges. */
  accent: string
  sector: string
  blurb: string
  /** Probability tuning — how strong (PRI) you typically need to be. */
  cutoffPRI: number
  slope: number
  eligibility?: Eligibility
  isGeneral?: boolean
}

export interface ChapterProgress {
  bestScore: number // 0-100, best chapter-quiz score
  passed: boolean // >= 70%
  skipped: boolean
  attempts: number
}

export interface CompanyProgress {
  chapters: Record<string, ChapterProgress>
  mockScores: number[]
}

export interface CodingAttempt {
  problemId: string
  title: string
  companyId: CompanyId
  passed: number
  total: number
  ts: number
}

export interface TopicStat {
  correct: number
  total: number
}

export interface Profile {
  name: string
  college: string
  branch: string
  gradYear: string
  cgpa: string
  backlogs: string
}

export interface DailyChallengeState {
  date: string // yyyy-mm-dd
  general: boolean
  aptitude: boolean
  coding: boolean
}

// ---- Interview prep ---------------------------------------------------------

export type InterviewCategory =
  | "technical"
  | "hr"
  | "managerial"
  | "coding"
  | "domain"

export interface InterviewQuestion {
  id: string
  company: CompanyId
  category: InterviewCategory
  question: string
  /** How a senior trainer would coach the answer (approach, not a script). */
  guidance: string
  difficulty: Difficulty
  tags: string[]
  sourceId?: string
}

// ---- Full-scale practice content -------------------------------------------

export interface CodingTestCase {
  input: string
  output: string
  hidden?: boolean
}

export interface CodingProblem extends ContentReviewMeta {
  id: string
  companyId: CompanyId
  title: string
  level: "beginner" | "easy" | "medium" | "advanced" | "machine-round"
  difficulty: Difficulty
  topics: string[]
  prompt: string
  inputFormat: string
  outputFormat: string
  constraints: string[]
  starterCode: string
  testCases: CodingTestCase[]
  editorial: string
  estimatedMinutes: number
}

export interface MockSection {
  id: SectionId
  label: string
  questionCount: number
  durationMinutes: number
  source: "lesson-quiz" | "pyq" | "drill-generator" | "mixed"
}

export interface MockTest extends ContentReviewMeta {
  id: string
  companyId: CompanyId
  title: string
  description: string
  sections: MockSection[]
  cutoffPercent: number
  /**
   * Optional target difficulty split for full placement-simulation mocks.
   * When present, buildMockQuestions distributes these counts across the
   * sections so the whole paper holds (roughly) this many easy/medium/hard
   * questions — e.g. { easy: 10, medium: 40, hard: 40 } for a 90-question drive.
   */
  difficultyMix?: { easy: number; medium: number; hard: number }
}

// ---- Mistake notebook -------------------------------------------------------

/** A question the student answered incorrectly, saved for focused review. */
export interface Mistake {
  questionId: string
  prompt: string
  options: string[]
  answer: number // index of the correct option
  chosen: number // index the student picked
  explanation: string
  topic: string
  difficulty: Difficulty
  ts: number // when it was saved (epoch ms)
  // ---- Spaced-repetition schedule (Leitner). Persisted to the mistakes table
  // (box/due/reviews/lapses columns, migration 0009) so review state follows the
  // student across devices. Optional so older saved state and pre-migration rows
  // load fine; an undefined box is treated as box 1, due now. See
  // lib/spaced-repetition.ts.
  box?: number // 1..MAX_BOX; higher = better retained
  due?: number // epoch ms when this card is next due for review
  reviews?: number // how many times it has been reviewed
  lapses?: number // how many times a review was failed
}

// ---- Real placement-drive outcomes -----------------------------------------

/** Result of a real placement drive the student attended. */
export type DriveResult = "selected" | "rejected" | "in-progress" | "withdrawn"

/** Furthest round the student reached in a real drive. */
export type DriveStage =
  | "online-test"
  | "group-discussion"
  | "technical"
  | "hr"
  | "offer"

/**
 * A self-reported outcome of a real company drive, paired with the app's PRI at
 * the time. This is the honest feedback loop: it lets a student see whether the
 * in-app Readiness signal actually tracked their real results — never a claim
 * that the app predicted anything on its own.
 */
export interface DriveOutcome {
  id: string
  companyId: CompanyId
  result: DriveResult
  stageReached: DriveStage
  /** PRI (0-100) snapshot captured when the outcome was recorded. */
  priAtDrive: number
  ts: number // drive date, epoch ms
  notes?: string
}

export interface AppState {
  onboarded: boolean
  premium: boolean
  premiumUntil?: string
  entitlementSource?: "creator" | "purchase" | "free"
  profile: Profile
  interested: CompanyId[]
  primary: CompanyId
  xp: number
  streak: { count: number; lastActive: string }
  badges: string[]
  goals: { dailyXp: number; targetXp: number; lastUpdated: string }
  progress: Record<string, CompanyProgress>
  /** Topic accuracy aggregated across all quizzes — powers weak/strong topics. */
  topicStats: Record<string, TopicStat>
  daily: DailyChallengeState
  codingAttempts: CodingAttempt[]
  /** Auto-saved wrong answers for review (most-recent first, capped). */
  mistakes: Mistake[]
  /**
   * Self-reported real drive outcomes (most-recent first). Persisted to the
   * `drive_outcomes` table (migration 0009) so the calibration history follows
   * the student across devices, with localStorage as the offline cache.
   */
  outcomes: DriveOutcome[]
}

import type { CompanyId } from "@/lib/types"

export const PREMIUM_SIX_MONTH_PRICE_INR = 299
export const PREMIUM_ANNUAL_PRICE_INR = 499
export const PREMIUM_DURATION_DAYS = 365
export const PREMIUM_DURATION_LABEL = "year"
export const PREMIUM_SIX_MONTH_DURATION_DAYS = 180
export const FREE_PYQ_LIMIT = 15
export const FREE_INTERVIEW_LIMIT = 12
// Coding practice is a Premium-only surface: free users see the locked page.
export const FREE_CODING_PROBLEM_LIMIT = 0
export const FREE_CHAPTER_PRACTICE_LIMIT = 50
export const FREE_SECTION_INDEX = 0
export const FREE_LESSONS_PER_PATH = 2
export const FREE_CHAPTERS_PER_PATH = 1
export const FREE_MOCK_LIMIT = 1
export const FREE_MOCK_COMPANY: CompanyId = "general"

export const PLAN_FEATURES = [
  {
    feature: "Company tracks",
    free: "All 7 tracks visible",
    premium: "Full depth in all 7 tracks with ongoing practice and progression",
  },
  {
    feature: "Learning chapters",
    free: "First two starter lessons in every learning path, including each programming language, DSA and SQL/DBMS",
    premium: "Every chapter, full chapter practice sets and advanced placement-level content",
  },
  {
    feature: "PYQ bank",
    free: `${FREE_PYQ_LIMIT} questions per company for pattern sampling`,
    premium: "Full company-wise question bank with explanations and review tools",
  },
  {
    feature: "Programming roadmaps",
    free: "Two starter lessons in each selected programming language, DSA and SQL/DBMS path",
    premium: "All published programming-language, DSA and SQL/DBMS chapters with lesson practice",
  },
  {
    feature: "Mock tests",
    free: `First ${FREE_MOCK_LIMIT} mock in every employer series plus one general readiness mock`,
    premium: "All 10 original practice simulations in every employer series",
  },
  {
    feature: "Analytics and readiness",
    free: "Basic progress and streak tracking",
    premium: "Detailed analytics, PRI comparison, weak-topic drill and next steps",
  },
] as const

export function canAccessLearningChapter(
  _sectionIndex: number,
  _chapterIndex: number,
  premium: boolean,
  pathChapterIndex: number,
): boolean {
  if (premium) return true
  // Every learning path gives free users its first chapter. The curriculum
  // keeps that starter chapter to two lessons, so every path has equal access.
  return pathChapterIndex < FREE_CHAPTERS_PER_PATH
}

export function canAccessLearningSection(_sectionIndex: number, _premium: boolean): boolean {
  // All paths remain discoverable; chapter-level access is enforced separately.
  return true
}

export function canAccessChapterPractice(
  sectionIndex: number,
  chapterIndex: number,
  premium: boolean,
  pathChapterIndex: number,
): boolean {
  return canAccessLearningChapter(sectionIndex, chapterIndex, premium, pathChapterIndex)
}

export function freeLearningLabel(pathName?: string): string {
  if (!pathName) return `${FREE_LESSONS_PER_PATH} starter lessons in every path`
  return `${pathName} — first ${FREE_LESSONS_PER_PATH} lessons free`
}

export function visibleForPlan<T>(items: T[], premium: boolean, freeLimit: number): T[] {
  return premium ? items : items.slice(0, freeLimit)
}

/** Daily challenges must never widen the question access granted by chapter practice. */
export function visibleDailyChallengeQuestions<T extends { difficulty: string }>(
  questions: T[],
  premium: boolean,
  chapterPathKind?: "language" | "dsa" | "sql-dbms",
): T[] {
  if (premium) return questions
  const eligible = chapterPathKind === "language" || chapterPathKind === "sql-dbms"
    ? questions.filter((question) => question.difficulty !== "hard")
    : questions
  return eligible.slice(0, FREE_CHAPTER_PRACTICE_LIMIT)
}

export function visibleMocksForPlan<T>(
  mocks: T[],
  _companyId: CompanyId,
  premium: boolean,
): T[] {
  return premium ? mocks : mocks.slice(0, FREE_MOCK_LIMIT)
}

export function visibleCodingTestsForPlan<T extends { hidden?: boolean }>(
  testCases: T[],
  premium: boolean,
): T[] {
  return premium ? testCases : testCases.filter((testCase) => !testCase.hidden)
}

export function lockedCount(total: number, visible: number): number {
  return Math.max(0, total - visible)
}

export function planName(premium: boolean): "Premium" | "Free" {
  return premium ? "Premium" : "Free"
}

export function premiumPriceLabel(): string {
  return `₹${PREMIUM_SIX_MONTH_PRICE_INR}/6 months or ₹${PREMIUM_ANNUAL_PRICE_INR}/year`
}

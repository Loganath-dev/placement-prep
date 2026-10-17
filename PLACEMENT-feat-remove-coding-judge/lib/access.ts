import type { CompanyId } from "@/lib/types"

export const PREMIUM_PRICE_INR = 249
export const PREMIUM_DURATION_LABEL = "year"
export const PREMIUM_MONTHLY_EQUIVALENT_INR = Math.ceil(PREMIUM_PRICE_INR / 12)
export const FREE_PYQ_LIMIT = 15
export const FREE_INTERVIEW_LIMIT = 12
// Coding practice is a Premium-only surface: free users see the locked page.
export const FREE_CODING_PROBLEM_LIMIT = 3
export const FREE_CHAPTER_PRACTICE_LIMIT = 50
export const FREE_SECTION_INDEX = 0
export const FREE_MOCK_LIMIT = 1
export const FREE_MOCK_COMPANY: CompanyId = "general"

export const PLAN_FEATURES = [
  {
    feature: "Company tracks",
    free: "Browse all 13 company and core-prep tracks",
    premium: "Complete every track with all practice sets",
  },
  {
    feature: "Learning chapters",
    free: "The full first section in every track",
    premium: "Every section and chapter, including advanced topics",
  },
  {
    feature: "PYQ bank",
    free: `${FREE_PYQ_LIMIT} questions per company`,
    premium: "Complete company-wise practice bank",
  },
  {
    feature: "Interview questions",
    free: `${FREE_INTERVIEW_LIMIT} starter questions per category with trainer guidance`,
    premium: "Complete bank — technical, coding, HR, domain, managerial",
  },
  {
    feature: "Coding ladder",
    free: "Locked — coding depth is reserved for paying users",
    premium: "All problems, hidden edge cases and full editorials",
  },
  {
    feature: "GD, Communication & Resume",
    free: "Core soft-skills access to get started",
    premium: "Extended question banks, scenarios and practice prompts",
  },
  {
    feature: "Mock tests",
    free: `${FREE_MOCK_LIMIT} Core Prep mock with full analysis`,
    premium: "Mock series for every company with detailed review",
  },
  {
    feature: "Progress and weak topics",
    free: "Progress, streaks and a readiness score",
    premium: "Company comparison and detailed weak-topic review",
  },
] as const

export function canAccessLearningChapter(
  sectionIndex: number,
  _chapterIndex: number,
  premium: boolean,
): boolean {
  if (premium) return true
  // Free users get the entire first section — all its chapters
  return sectionIndex === FREE_SECTION_INDEX
}

export function canAccessLearningSection(sectionIndex: number, premium: boolean): boolean {
  if (premium) return true
  return sectionIndex === FREE_SECTION_INDEX
}

export function canAccessChapterPractice(
  sectionIndex: number,
  chapterIndex: number,
  premium: boolean,
): boolean {
  return canAccessLearningChapter(sectionIndex, chapterIndex, premium)
}

export function freeLearningLabel(sectionName?: string): string {
  if (!sectionName) return "Section 1 (all chapters)"
  return `${sectionName} — all chapters free`
}

export function visibleForPlan<T>(items: T[], premium: boolean, freeLimit: number): T[] {
  return premium ? items : items.slice(0, freeLimit)
}

export function canAccessMockCompany(companyId: CompanyId, premium: boolean): boolean {
  return premium || companyId === FREE_MOCK_COMPANY
}

export function visibleMocksForPlan<T>(
  mocks: T[],
  companyId: CompanyId,
  premium: boolean,
): T[] {
  if (premium) return mocks
  if (!canAccessMockCompany(companyId, premium)) return []
  return mocks.slice(0, FREE_MOCK_LIMIT)
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
  return `Rs ${PREMIUM_PRICE_INR}/${PREMIUM_DURATION_LABEL}`
}

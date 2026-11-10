import type { CompanyId } from "@/lib/types"

export const PREMIUM_PRICE_INR = 499
export const PREMIUM_DURATION_LABEL = "year"
export const PREMIUM_DURATION_DAYS = 365
export const PREMIUM_SIX_MONTH_PRICE_INR = 299
export const PREMIUM_SIX_MONTH_DURATION_DAYS = 183
export const PREMIUM_SIX_MONTH_AMOUNT_PAISE = 29_900
export const PREMIUM_SIX_MONTH_PLAN_KEY = "premium_6_months_299"
export const PREMIUM_ANNUAL_AMOUNT_PAISE = 49_900
export const PREMIUM_ANNUAL_PLAN_KEY = "premium_annual_499"
export const PREMIUM_AMOUNT_PAISE = PREMIUM_ANNUAL_AMOUNT_PAISE
export const PREMIUM_PLAN_KEY = PREMIUM_ANNUAL_PLAN_KEY
export const FREE_PYQ_LIMIT = 15
export const FREE_INTERVIEW_LIMIT = 12
export const FREE_CODING_PROBLEM_LIMIT = 0
export const FREE_CHAPTER_PRACTICE_LIMIT = 50
export const FREE_SECTION_INDEX = 0
export const FREE_LESSONS_PER_TOPIC = 2
export const FREE_MOCK_LIMIT = 1
export const FREE_MOCK_COMPANY: CompanyId = "general"

export const PLAN_FEATURES = [
  { feature: "Company tracks", free: "Introductory previews and limited samples", premium: "Full company tracks, question banks and assessments" },
  { feature: "Common Aptitude", free: "First two lessons per topic", premium: "Full curriculum" },
  { feature: "CS Core", free: "First two lessons per topic", premium: "Full curriculum" },
  { feature: "Programming Languages", free: "First two lessons in each of ten languages", premium: "Full curriculum in all ten languages" },
  { feature: "DSA", free: "First two lessons per learning path", premium: "Full curriculum" },
  { feature: "Practice", free: "Free-eligible questions and activities", premium: "Full practice library and advanced activities" },
  { feature: "Mock assessments", free: "One introductory/general assessment", premium: "Full mock library including company assessments" },
  { feature: "Progress and gamification", free: "XP, streaks, levels, badges and progress", premium: "XP, streaks, levels, badges and progress" },
] as const

export function canAccessLearningChapter(
  _sectionIndex: number,
  _chapterIndex: number,
  _premium: boolean,
): boolean {
  return true
}

export function canAccessLearningSection(sectionIndex: number, _premium: boolean): boolean {
  return sectionIndex >= 0
}

export function canAccessChapterPractice(
  _sectionIndex: number,
  _chapterIndex: number,
  _premium: boolean,
): boolean {
  return true
}

/** Every topic has an independent two-lesson free allowance. */
export function canAccessLesson(
  _chapterIndex: number,
  lessonIndexWithinTopic: number,
  premium: boolean,
): boolean {
  return premium || lessonIndexWithinTopic < FREE_LESSONS_PER_TOPIC
}

export function freeLearningLabel(topicName?: string): string {
  return topicName ? `${topicName} — first two lessons free` : "First two lessons in every topic"
}

export function visibleForPlan<T>(items: T[], premium: boolean, freeLimit: number): T[] {
  return premium ? items : items.slice(0, freeLimit)
}

export function canAccessMockCompany(companyId: CompanyId, premium: boolean): boolean {
  return premium || companyId === FREE_MOCK_COMPANY
}

export function visibleMocksForPlan<T>(mocks: T[], companyId: CompanyId, premium: boolean): T[] {
  if (premium) return mocks
  return canAccessMockCompany(companyId, premium) ? mocks.slice(0, FREE_MOCK_LIMIT) : []
}

export function visibleCodingTestsForPlan<T extends { hidden?: boolean }>(testCases: T[], premium: boolean): T[] {
  return premium ? testCases : testCases.filter((testCase) => !testCase.hidden)
}

export function lockedCount(total: number, visible: number): number {
  return Math.max(0, total - visible)
}

export function planName(premium: boolean): "Premium" | "Free" {
  return premium ? "Premium" : "Free"
}

export function premiumPriceLabel(): string {
  return `₹${PREMIUM_SIX_MONTH_PRICE_INR}/6 months or ₹${PREMIUM_PRICE_INR}/year`
}

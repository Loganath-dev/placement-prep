import type { CompanyId } from "@/lib/types"

export const PREMIUM_PRICE_INR = 249
export const PREMIUM_DURATION_LABEL = "year"
export const PREMIUM_DURATION_DAYS = 365
export const PREMIUM_AMOUNT_PAISE = 24_900
export const PREMIUM_PLAN_KEY = "premium_annual_249"
export const FREE_PYQ_LIMIT = 15
export const FREE_INTERVIEW_LIMIT = 12
export const FREE_CODING_PROBLEM_LIMIT = 0
export const FREE_CHAPTER_PRACTICE_LIMIT = 50
/** Retained for compatibility; free access is now granted per learning section. */
export const FREE_SECTION_INDEX = 0
export const FREE_LESSONS_PER_SECTION = 2
export const FREE_CHAPTERS_PER_SECTION = 1
export const FREE_MOCK_LIMIT = 1
export const FREE_MOCK_COMPANY: CompanyId = "general"

export const PLAN_FEATURES = [
  { feature: "Company tracks", free: "All 7 tracks visible", premium: "Full depth in all 7 tracks with ongoing practice and progression" },
  { feature: "Learning chapters", free: "Two starter lessons in every learning section", premium: "Every lesson and chapter including advanced placement-level content" },
  { feature: "PYQ bank", free: `${FREE_PYQ_LIMIT} questions per company for pattern sampling`, premium: "Full company-wise bank with 500-600 priority questions per track" },
  { feature: "Interview questions", free: `${FREE_INTERVIEW_LIMIT} starter questions per category with trainer guidance`, premium: "Complete bank — technical, coding, HR, domain, managerial" },
  { feature: "Coding ladder", free: "Starter access is limited; full coding depth is Premium", premium: "All problems, hidden edge cases and full editorials" },
  { feature: "GD, Communication & Resume", free: "Core soft-skills access to get started", premium: "Extended question banks, scenarios and practice prompts" },
  { feature: "Mock tests", free: `${FREE_MOCK_LIMIT} Core Prep mock with full analysis`, premium: "Complete mock series for all companies with deeper review loops" },
  { feature: "Analytics and readiness", free: "Basic progress and streak tracking", premium: "Detailed analytics, PRI comparison, weak-topic drill and next steps" },
] as const

export function canAccessLearningChapter(_sectionIndex:number,chapterIndex:number,premium:boolean):boolean {
  return premium || chapterIndex < FREE_CHAPTERS_PER_SECTION
}

/** Every learning section is discoverable; access is controlled at lesson level. */
export function canAccessLearningSection(sectionIndex:number,premium:boolean):boolean {
  return premium || sectionIndex >= 0
}

export function canAccessChapterPractice(sectionIndex:number,chapterIndex:number,premium:boolean):boolean {
  return canAccessLearningChapter(sectionIndex,chapterIndex,premium)
}

export function canAccessLesson(chapterIndex:number,lessonIndex:number,premium:boolean):boolean {
  return premium || (chapterIndex < FREE_CHAPTERS_PER_SECTION && lessonIndex < FREE_LESSONS_PER_SECTION)
}

export function freeLearningLabel(sectionName?:string):string {
  return sectionName ? `${sectionName} — first two lessons free` : "First two lessons in every learning section"
}

export function visibleForPlan<T>(items:T[],premium:boolean,freeLimit:number):T[] {
  return premium ? items : items.slice(0,freeLimit)
}
export function canAccessMockCompany(companyId:CompanyId,premium:boolean):boolean {
  return premium || companyId === FREE_MOCK_COMPANY
}
export function visibleMocksForPlan<T>(mocks:T[],companyId:CompanyId,premium:boolean):T[] {
  if (premium) return mocks
  return canAccessMockCompany(companyId,premium) ? mocks.slice(0,FREE_MOCK_LIMIT) : []
}
export function visibleCodingTestsForPlan<T extends {hidden?:boolean}>(testCases:T[],premium:boolean):T[] {
  return premium ? testCases : testCases.filter(testCase=>!testCase.hidden)
}
export function lockedCount(total:number,visible:number):number { return Math.max(0,total-visible) }
export function planName(premium:boolean):"Premium"|"Free" { return premium ? "Premium" : "Free" }
export function premiumPriceLabel():string { return `₹${PREMIUM_PRICE_INR}/${PREMIUM_DURATION_LABEL}` }

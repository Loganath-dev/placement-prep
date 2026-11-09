import { describe, expect, it } from "vitest"
import {
  canAccessChapterPractice, canAccessLearningChapter, canAccessLearningSection,
  canAccessLesson, canAccessMockCompany, FREE_CHAPTER_PRACTICE_LIMIT,
  FREE_CODING_PROBLEM_LIMIT, FREE_INTERVIEW_LIMIT, FREE_LESSONS_PER_TOPIC,
  FREE_MOCK_COMPANY, FREE_MOCK_LIMIT, FREE_PYQ_LIMIT, FREE_SECTION_INDEX,
  lockedCount, PLAN_FEATURES, PREMIUM_AMOUNT_PAISE, PREMIUM_DURATION_DAYS,
  PREMIUM_PLAN_KEY, premiumPriceLabel, visibleCodingTestsForPlan, visibleForPlan,
  visibleMocksForPlan,
} from "@/lib/access"
import { MOCKS_PER_COMPANY, mocksForCompany } from "@/lib/data/mocks"

describe("approved StudyBench access policy", () => {
  it("describes the five learning categories and their independent free allowances", () => {
    expect(PLAN_FEATURES).toEqual(expect.arrayContaining([
      expect.objectContaining({ feature: "Common Aptitude", free: "First two lessons per topic" }),
      expect.objectContaining({ feature: "CS Core", free: "First two lessons per topic" }),
      expect.objectContaining({ feature: "Programming Languages", free: "First two lessons in each of ten languages" }),
      expect.objectContaining({ feature: "DSA", free: "First two lessons per learning path" }),
    ]))
  })

  it("keeps all topics visible and gates lesson three independently within each topic", () => {
    expect(canAccessLearningSection(0, false)).toBe(true)
    expect(canAccessLearningSection(5, false)).toBe(true)
    expect(canAccessLearningChapter(0, 0, false)).toBe(true)
    expect(canAccessLearningChapter(0, 8, false)).toBe(true)
    expect(canAccessLesson(0, 0, false)).toBe(true)
    expect(canAccessLesson(0, 1, false)).toBe(true)
    expect(canAccessLesson(7, 0, false)).toBe(true)
    expect(canAccessLesson(7, 1, false)).toBe(true)
    expect(canAccessLesson(0, 2, false)).toBe(false)
    expect(canAccessLesson(7, 2, false)).toBe(false)
    expect(canAccessLesson(7, 2, true)).toBe(true)
  })

  it("allows practice entry while applying the question allowance separately", () => {
    expect(canAccessChapterPractice(0, 0, false)).toBe(true)
    expect(canAccessChapterPractice(5, 8, false)).toBe(true)
    expect(visibleForPlan(["a", "b", "c"], false, FREE_CHAPTER_PRACTICE_LIMIT)).toHaveLength(3)
    expect(visibleForPlan(["a", "b", "c"], true, FREE_CHAPTER_PRACTICE_LIMIT)).toHaveLength(3)
  })

  it("centralizes current free quotas", () => {
    expect(FREE_SECTION_INDEX).toBe(0)
    expect(FREE_LESSONS_PER_TOPIC).toBe(2)
    expect(FREE_PYQ_LIMIT).toBe(15)
    expect(FREE_INTERVIEW_LIMIT).toBe(12)
    expect(FREE_CODING_PROBLEM_LIMIT).toBe(0)
    expect(FREE_CHAPTER_PRACTICE_LIMIT).toBe(50)
    expect(FREE_MOCK_COMPANY).toBe("general")
    expect(FREE_MOCK_LIMIT).toBe(1)
  })

  it("allows one general mock and gates company mocks", () => {
    const general = mocksForCompany(FREE_MOCK_COMPANY)
    const tcs = mocksForCompany("tcs")
    expect(general).toHaveLength(MOCKS_PER_COMPANY)
    expect(tcs).toHaveLength(MOCKS_PER_COMPANY)
    expect(canAccessMockCompany(FREE_MOCK_COMPANY, false)).toBe(true)
    expect(canAccessMockCompany("tcs", false)).toBe(false)
    expect(canAccessMockCompany("tcs", true)).toBe(true)
    expect(visibleMocksForPlan(general, FREE_MOCK_COMPANY, false)).toHaveLength(1)
    expect(visibleMocksForPlan(tcs, "tcs", false)).toEqual([])
    expect(visibleMocksForPlan(tcs, "tcs", true)).toHaveLength(MOCKS_PER_COMPANY)
    expect(lockedCount(general.length, FREE_MOCK_LIMIT)).toBe(MOCKS_PER_COMPANY - 1)
  })

  it("keeps hidden coding edge cases unavailable on the free plan", () => {
    const cases = [{ input: "1", output: "1" }, { input: "0", output: "0", hidden: true }]
    expect(visibleCodingTestsForPlan(cases, false)).toEqual([cases[0]])
    expect(visibleCodingTestsForPlan(cases, true)).toEqual(cases)
  })

  it("uses exactly ₹249, 24,900 paise and 365 days for Premium", () => {
    expect(premiumPriceLabel()).toBe("₹249/year")
    expect(PREMIUM_AMOUNT_PAISE).toBe(24_900)
    expect(PREMIUM_DURATION_DAYS).toBe(365)
    expect(PREMIUM_PLAN_KEY).toBe("premium_annual_249")
  })
})

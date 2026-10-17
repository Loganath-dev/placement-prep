import { describe, expect, it } from "vitest"
import {
  canAccessChapterPractice,
  canAccessLearningChapter,
  canAccessLearningSection,
  canAccessMockCompany,
  FREE_CHAPTER_PRACTICE_LIMIT,
  FREE_CODING_PROBLEM_LIMIT,
  FREE_INTERVIEW_LIMIT,
  FREE_MOCK_COMPANY,
  FREE_MOCK_LIMIT,
  FREE_PYQ_LIMIT,
  FREE_SECTION_INDEX,
  lockedCount,
  PLAN_FEATURES,
  premiumPriceLabel,
  visibleCodingTestsForPlan,
  visibleForPlan,
  visibleMocksForPlan,
} from "@/lib/access"
import { MOCKS_PER_COMPANY, mocksForCompany } from "@/lib/data/mocks"

describe("plan access", () => {
  it("describes the free study path clearly", () => {
    expect(PLAN_FEATURES).toEqual(expect.arrayContaining([
      expect.objectContaining({ feature: "Company tracks", free: "Browse all 13 company and core-prep tracks" }),
      expect.objectContaining({ feature: "Learning chapters", free: "The full first section in every track", premium: "Every section and chapter, including advanced topics" }),
    ]))
  })

  it("opens the first section for free users and all sections for premium users", () => {
    expect(canAccessLearningSection(0, false)).toBe(true)
    expect(canAccessLearningSection(1, false)).toBe(false)
    expect(canAccessLearningSection(4, true)).toBe(true)
    expect(canAccessLearningChapter(0, 1, false)).toBe(true)
    expect(canAccessLearningChapter(1, 0, false)).toBe(false)
    expect(canAccessChapterPractice(0, 1, false)).toBe(true)
    expect(canAccessChapterPractice(2, 0, false)).toBe(false)
  })

  it("keeps item-level free limits while premium receives the full list", () => {
    const items = ["first", "second", "third"]
    expect(visibleForPlan(items, false, 1)).toEqual(["first"])
    expect(visibleForPlan(items, true, 1)).toEqual(items)
  })

  it("centralizes free-plan limits", () => {
    expect(FREE_SECTION_INDEX).toBe(0)
    expect(FREE_PYQ_LIMIT).toBe(15)
    expect(FREE_INTERVIEW_LIMIT).toBe(12)
    expect(FREE_CODING_PROBLEM_LIMIT).toBe(3)
    expect(FREE_CHAPTER_PRACTICE_LIMIT).toBe(50)
    expect(FREE_MOCK_COMPANY).toBe("general")
    expect(FREE_MOCK_LIMIT).toBe(1)
  })

  it("limits free mocks to the core-prep sample", () => {
    const coreMocks = mocksForCompany(FREE_MOCK_COMPANY)
    const tcsMocks = mocksForCompany("tcs")
    expect(coreMocks).toHaveLength(MOCKS_PER_COMPANY)
    expect(canAccessMockCompany(FREE_MOCK_COMPANY, false)).toBe(true)
    expect(canAccessMockCompany("tcs", false)).toBe(false)
    expect(visibleMocksForPlan(coreMocks, FREE_MOCK_COMPANY, false)).toHaveLength(FREE_MOCK_LIMIT)
    expect(visibleMocksForPlan(tcsMocks, "tcs", false)).toEqual([])
  })

  it("keeps hidden coding edge cases premium-only", () => {
    const cases = [{ input: "1", output: "1" }, { input: "0", output: "0", hidden: true }]
    expect(visibleCodingTestsForPlan(cases, false)).toEqual([cases[0]])
    expect(visibleCodingTestsForPlan(cases, true)).toEqual(cases)
  })

  it("keeps premium pricing centralized", () => {
    expect(premiumPriceLabel()).toBe("Rs 249/year")
    expect(lockedCount(5, 2)).toBe(3)
  })
})

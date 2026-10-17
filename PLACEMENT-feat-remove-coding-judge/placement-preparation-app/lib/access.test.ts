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
  it("states that free users can enter all tracks and all of section 1", () => {
    expect(PLAN_FEATURES).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          feature: "Company tracks",
          free: "All 7 tracks visible",
        }),
        expect.objectContaining({
          feature: "Learning chapters",
          free: "Full Section 1 (all chapters) in every track — no cap",
          premium: "Every section and chapter including advanced placement-level content",
        }),
      ]),
    )
  })

  it("opens all of section 1 for free users and everything for premium users", () => {
    expect(canAccessLearningSection(0, false)).toBe(true)
    expect(canAccessLearningSection(1, false)).toBe(false)
    expect(canAccessLearningSection(4, true)).toBe(true)

    expect(canAccessLearningChapter(0, 0, false)).toBe(true)
    expect(canAccessLearningChapter(0, 1, false)).toBe(true)
    expect(canAccessLearningChapter(1, 0, false)).toBe(false)
    expect(canAccessLearningChapter(5, 3, true)).toBe(true)

    expect(canAccessChapterPractice(0, 0, false)).toBe(true)
    expect(canAccessChapterPractice(0, 1, false)).toBe(true)
    expect(canAccessChapterPractice(2, 0, false)).toBe(false)
    expect(canAccessChapterPractice(2, 4, true)).toBe(true)
  })

  it("keeps item-level free limits while premium receives the full list", () => {
    const items = ["first", "second", "third"]

    expect(visibleForPlan(items, false, 1)).toEqual(["first"])
    expect(visibleForPlan(items, true, 1)).toEqual(items)
  })

  it("centralizes exact free-plan quotas for each limited surface", () => {
    expect(FREE_SECTION_INDEX).toBe(0)
    expect(FREE_PYQ_LIMIT).toBe(15)
    expect(FREE_INTERVIEW_LIMIT).toBe(12)
    expect(FREE_CODING_PROBLEM_LIMIT).toBe(0)
    expect(FREE_CHAPTER_PRACTICE_LIMIT).toBe(50)
    expect(FREE_MOCK_COMPANY).toBe("general")
    expect(FREE_MOCK_LIMIT).toBe(1)
  })

  it("locks company mocks for free users and opens the full mock series for premium users", () => {
    const coreMocks = mocksForCompany(FREE_MOCK_COMPANY)
    const tcsMocks = mocksForCompany("tcs")

    expect(coreMocks).toHaveLength(MOCKS_PER_COMPANY)
    expect(tcsMocks).toHaveLength(MOCKS_PER_COMPANY)
    expect(canAccessMockCompany(FREE_MOCK_COMPANY, false)).toBe(true)
    expect(canAccessMockCompany("tcs", false)).toBe(false)
    expect(canAccessMockCompany("tcs", true)).toBe(true)
    expect(visibleMocksForPlan(coreMocks, FREE_MOCK_COMPANY, false)).toHaveLength(FREE_MOCK_LIMIT)
    expect(visibleMocksForPlan(tcsMocks, "tcs", false)).toEqual([])
    expect(visibleMocksForPlan(tcsMocks, "tcs", true)).toHaveLength(MOCKS_PER_COMPANY)
    expect(lockedCount(coreMocks.length, FREE_MOCK_LIMIT)).toBe(MOCKS_PER_COMPANY - FREE_MOCK_LIMIT)
  })

  it("keeps hidden coding edge cases premium-only", () => {
    const cases = [
      { input: "1", output: "1" },
      { input: "0", output: "0", hidden: true },
      { input: "9", output: "9", hidden: true },
    ]

    expect(visibleCodingTestsForPlan(cases, false)).toEqual([cases[0]])
    expect(visibleCodingTestsForPlan(cases, true)).toEqual(cases)
  })

  it("keeps premium pricing centralized", () => {
    expect(premiumPriceLabel()).toBe("₹249/lifetime")
  })
})

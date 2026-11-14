import { describe, expect, it } from "vitest"
import {
  canAccessChapterPractice,
  canAccessLearningChapter,
  canAccessLearningSection,
  FREE_CHAPTER_PRACTICE_LIMIT,
  FREE_CODING_PROBLEM_LIMIT,
  FREE_INTERVIEW_LIMIT,
  FREE_MOCK_COMPANY,
  FREE_MOCK_LIMIT,
  FREE_PYQ_LIMIT,
  FREE_SECTION_INDEX,
  FREE_LESSONS_PER_PATH,
  FREE_CHAPTERS_PER_PATH,
  lockedCount,
  PLAN_FEATURES,
  premiumPriceLabel,
  visibleCodingTestsForPlan,
  visibleDailyChallengeQuestions,
  visibleForPlan,
  visibleMocksForPlan,
} from "@/lib/access"
import { MOCKS_PER_COMPANY, mocksForCompany } from "@/lib/data/mocks"

describe("plan access", () => {
  it("states that free users can enter every learning path and start each one", () => {
    expect(PLAN_FEATURES).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          feature: "Company tracks",
          free: "All 7 tracks visible",
        }),
        expect.objectContaining({
          feature: "Learning chapters",
          free: "First two starter lessons in every learning path, including each programming language, DSA and SQL/DBMS",
          premium: "Every chapter, full chapter practice sets and advanced placement-level content",
        }),
      ]),
    )
  })

  it("opens the first chapter of every path for free users and every chapter for premium", () => {
    expect(canAccessLearningSection(0, false)).toBe(true)
    expect(canAccessLearningSection(1, false)).toBe(true)
    expect(canAccessLearningSection(4, true)).toBe(true)

    expect(canAccessLearningChapter(0, 0, false, 0)).toBe(true)
    expect(canAccessLearningChapter(0, 1, false, 1)).toBe(false)
    expect(canAccessLearningChapter(3, 8, false, 0)).toBe(true)
    expect(canAccessLearningChapter(3, 9, false, 1)).toBe(false)
    expect(canAccessLearningChapter(5, 3, true, 9)).toBe(true)

    expect(canAccessChapterPractice(0, 0, false, 0)).toBe(true)
    expect(canAccessChapterPractice(0, 1, false, 1)).toBe(false)
    expect(canAccessChapterPractice(2, 0, false, 0)).toBe(true)
    expect(canAccessChapterPractice(2, 4, true, 4)).toBe(true)
  })


  it("never widens daily-challenge questions beyond the free chapter-practice policy", () => {
    const questions = [
      { id: "e1", difficulty: "easy" },
      { id: "m1", difficulty: "medium" },
      { id: "h1", difficulty: "hard" },
    ]
    expect(visibleDailyChallengeQuestions(questions, false, "language")).toEqual(questions.slice(0, 2))
    expect(visibleDailyChallengeQuestions(questions, false, "sql-dbms")).toEqual(questions.slice(0, 2))
    expect(visibleDailyChallengeQuestions(questions, false, "dsa")).toEqual(questions)
    expect(visibleDailyChallengeQuestions(questions, true, "language")).toEqual(questions)
    const largeBank = Array.from({ length: FREE_CHAPTER_PRACTICE_LIMIT + 10 }, (_, index) => ({ id: String(index), difficulty: "easy" }))
    expect(visibleDailyChallengeQuestions(largeBank, false)).toHaveLength(FREE_CHAPTER_PRACTICE_LIMIT)
  })

  it("keeps item-level free limits while premium receives the full list", () => {
    const items = ["first", "second", "third"]

    expect(visibleForPlan(items, false, 1)).toEqual(["first"])
    expect(visibleForPlan(items, true, 1)).toEqual(items)
  })

  it("centralizes exact free-plan quotas for each limited surface", () => {
    expect(FREE_SECTION_INDEX).toBe(0)
    expect(FREE_LESSONS_PER_PATH).toBe(2)
    expect(FREE_CHAPTERS_PER_PATH).toBe(1)
    expect(FREE_PYQ_LIMIT).toBe(15)
    expect(FREE_INTERVIEW_LIMIT).toBe(12)
    expect(FREE_CODING_PROBLEM_LIMIT).toBe(0)
    expect(FREE_CHAPTER_PRACTICE_LIMIT).toBe(50)
    expect(FREE_MOCK_COMPANY).toBe("general")
    expect(FREE_MOCK_LIMIT).toBe(1)
  })

  it("gives free users the first paper in each company series and premium users all papers", () => {
    const coreMocks = mocksForCompany(FREE_MOCK_COMPANY)
    const tcsMocks = mocksForCompany("tcs")

    expect(coreMocks).toHaveLength(MOCKS_PER_COMPANY + 1)
    expect(tcsMocks).toHaveLength(MOCKS_PER_COMPANY)
    expect(visibleMocksForPlan(coreMocks, FREE_MOCK_COMPANY, false)).toHaveLength(FREE_MOCK_LIMIT)
    expect(visibleMocksForPlan(tcsMocks, "tcs", false)).toHaveLength(FREE_MOCK_LIMIT)
    expect(visibleMocksForPlan(tcsMocks, "tcs", true)).toHaveLength(MOCKS_PER_COMPANY)
    expect(lockedCount(coreMocks.length, FREE_MOCK_LIMIT)).toBe(coreMocks.length - FREE_MOCK_LIMIT)
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
    expect(premiumPriceLabel()).toBe("₹299/6 months or ₹499/year")
  })
})

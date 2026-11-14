import { describe, expect, it } from "vitest"
import {
  canAccessChapterPractice,
  canAccessLearningChapter,
  FREE_CHAPTER_PRACTICE_LIMIT,
  FREE_CHAPTERS_PER_PATH,
  FREE_LESSONS_PER_PATH,
  FREE_MOCK_LIMIT,
  FREE_PYQ_LIMIT,
  visibleDailyChallengeQuestions,
  visibleMocksForPlan,
} from "@/lib/access"
import { isPremiumActive } from "@/lib/premium-guard"

const NOW = Date.parse("2026-11-13T12:00:00.000Z")

describe("Free and Premium access contract", () => {
  it("grants Free users the documented starter curriculum only", () => {
    expect(FREE_LESSONS_PER_PATH).toBe(2)
    expect(FREE_CHAPTERS_PER_PATH).toBe(1)
    expect(canAccessLearningChapter(0, 0, false, 0)).toBe(true)
    expect(canAccessLearningChapter(0, 1, false, 1)).toBe(false)
    expect(canAccessChapterPractice(0, 0, false, 0)).toBe(true)
    expect(canAccessChapterPractice(0, 1, false, 1)).toBe(false)
  })

  it("grants active Premium users all chapters regardless of path index", () => {
    for (const index of [0, 1, 5, 20, 100]) {
      expect(canAccessLearningChapter(4, 9, true, index)).toBe(true)
      expect(canAccessChapterPractice(4, 9, true, index)).toBe(true)
    }
  })

  it("expires Premium access at the exact expiry instant and fails closed", () => {
    expect(isPremiumActive(true, new Date(NOW + 1).toISOString(), NOW)).toBe(true)
    expect(isPremiumActive(true, new Date(NOW).toISOString(), NOW)).toBe(false)
    expect(isPremiumActive(true, "invalid-expiry", NOW)).toBe(false)
    expect(isPremiumActive(false, null, NOW)).toBe(false)
  })

  it("keeps Free question and mock quotas bounded while Premium receives full access", () => {
    expect(FREE_PYQ_LIMIT).toBe(15)
    expect(FREE_MOCK_LIMIT).toBe(1)
    expect(FREE_CHAPTER_PRACTICE_LIMIT).toBe(50)
    const mocks = ["one", "two", "three"]
    expect(visibleMocksForPlan(mocks, "general", false)).toEqual(["one"])
    expect(visibleMocksForPlan(mocks, "general", true)).toEqual(mocks)
  })

  it("does not widen Free daily challenges beyond the configured question quota", () => {
    const questions = Array.from({ length: 80 }, (_, index) => ({
      id: String(index),
      difficulty: index % 3 === 0 ? "hard" : "easy",
    }))
    expect(visibleDailyChallengeQuestions(questions, false, "language").length).toBeLessThanOrEqual(FREE_CHAPTER_PRACTICE_LIMIT)
    expect(visibleDailyChallengeQuestions(questions, true, "language")).toHaveLength(80)
  })
})

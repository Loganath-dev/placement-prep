import { describe, it, expect } from "vitest"
import { generateDrills, generateDrillsByDifficulty, DRILL_SECTIONS } from "@/lib/data/question-bank"

describe("question generator", () => {
  it("produces structurally valid questions for every section", () => {
    for (const { id } of DRILL_SECTIONS) {
      if (id === "verbal" || id === "cs-core") {
        // these draw from curated lists; still validate structure
      }
      for (let seed = 1; seed <= 50; seed++) {
        const qs = generateDrills(id, 20, seed)
        if (id === "mixed") expect(qs.length).toBe(20)
        for (const q of qs) {
          expect(q.options.length).toBe(4)
          expect(new Set(q.options).size).toBe(4) // all options unique
          expect(q.answer).toBeGreaterThanOrEqual(0)
          expect(q.answer).toBeLessThan(4)
          expect(q.prompt.length).toBeGreaterThan(0)
          expect(q.explanation.length).toBeGreaterThan(0)
        }
        expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length)
        expect(new Set(qs.map((q) => q.prompt.trim().toLowerCase())).size).toBe(qs.length)
      }
    }
  })

  it("is deterministic for a given seed", () => {
    const a = generateDrills("quant", 10, 12345)
    const b = generateDrills("quant", 10, 12345)
    expect(a.map((q) => q.prompt)).toEqual(b.map((q) => q.prompt))
    expect(a.map((q) => q.answer)).toEqual(b.map((q) => q.answer))
  })

  it("can intentionally generate easy, medium and hard drills without repeated prompts", () => {
    for (const { id } of DRILL_SECTIONS) {
      for (const difficulty of ["easy", "medium", "hard"] as const) {
        const qs = generateDrillsByDifficulty(id, 5, difficulty, 9001)
        if (qs.length === 0) continue
        expect(qs.every((q) => q.difficulty === difficulty)).toBe(true)
        expect(new Set(qs.map((q) => q.prompt.trim().toLowerCase())).size).toBe(qs.length)
        for (const q of qs) {
          expect(q.options.length).toBe(4)
          expect(new Set(q.options).size).toBe(4)
          expect(q.answer).toBeGreaterThanOrEqual(0)
          expect(q.answer).toBeLessThan(4)
        }
      }
    }
  })

  it("builds five stable daily questions that rotate by date", async () => {
    const { dailyChallengeQuestions } = await import("@/lib/data/pyqs")
    for (const category of ["general", "aptitude", "coding"] as const) {
      const today = dailyChallengeQuestions(category, "2026-06-08")
      const sameDay = dailyChallengeQuestions(category, "2026-06-08")
      const nextDay = dailyChallengeQuestions(category, "2026-06-09")

      expect(today.length).toBe(5)
      expect(today.map((q) => q.id)).toEqual(sameDay.map((q) => q.id))
      expect(today.map((q) => q.id)).not.toEqual(nextDay.map((q) => q.id))
    }
  }, 120_000)

  it("uses mainstream programming language questions in the coding daily challenge", async () => {
    const { dailyChallengeQuestions } = await import("@/lib/data/pyqs")
    const topics = dailyChallengeQuestions("coding", "2026-06-08").map((q) => q.topic)
    expect(topics).toEqual([
      "C Programming",
      "C++ Programming",
      "Java Programming",
      "Python Programming",
      "JavaScript Programming",
    ])
  }, 120_000)
})

import { describe, expect, it } from "vitest"
import { buildMockAnalysis, mockPressureLabel } from "@/lib/domain/mock-analysis"

describe("mock analysis domain", () => {
  it("summarizes weak topics and next tasks", () => {
    const analysis = buildMockAnalysis(
      [
        { topic: "Percentages", correct: false, difficulty: "medium", timeSpentSec: 95, questionIndex: 0 },
        { topic: "Percentages", correct: true, difficulty: "easy", timeSpentSec: 45, questionIndex: 1 },
        { topic: "Series", correct: false, difficulty: "hard", timeSpentSec: 50, questionIndex: 2 },
      ],
      62,
      70,
    )

    expect(analysis.weakTopics[0]).toEqual({ topic: "Percentages", total: 2, wrong: 1 })
    expect(analysis.nextTasks[0]).toBe("Revise Percentages")
    expect(analysis.carelessRisk).toContain("close to cutoff")
  })

  it("builds section percentile, loss buckets and heatmap data", () => {
    const analysis = buildMockAnalysis(
      [
        { topic: "Percentages", correct: false, difficulty: "medium", timeSpentSec: 120, questionIndex: 0 },
        { topic: "Averages", correct: true, difficulty: "easy", timeSpentSec: 35, questionIndex: 1 },
        { topic: "Series", correct: false, difficulty: "easy", timeSpentSec: 30, questionIndex: 2 },
        { topic: "Syllogism", correct: true, difficulty: "hard", timeSpentSec: 70, questionIndex: 3 },
      ],
      50,
      70,
      {
        timeLimitSec: 240,
        sections: [
          { id: "quant", label: "Quant", questionCount: 2, durationMinutes: 2, source: "mixed" },
          { id: "reasoning", label: "Reasoning", questionCount: 2, durationMinutes: 2, source: "mixed" },
        ],
      },
    )

    expect(analysis.sectionStats).toHaveLength(2)
    expect(analysis.sectionStats[0].estimatedPercentile).toBeGreaterThan(0)
    expect(analysis.lossBreakdown.speed).toBe(1)
    expect(analysis.lossBreakdown.careless).toBe(1)
    expect(analysis.difficultyStats.find((item) => item.difficulty === "easy")?.total).toBe(2)
    expect(analysis.cutoffPrediction.status).toBe("near")
  })

  it("labels mock pressure from question count and timer", () => {
    expect(mockPressureLabel(80, 90 * 60)).toBe("high")
    expect(mockPressureLabel(40, 75 * 60)).toBe("medium")
    expect(mockPressureLabel(10, 30 * 60)).toBe("warm-up")
  })
})

import { describe, expect, it } from "vitest"
import { buildPlacementDeadlines, daysUntil } from "@/lib/data/deadlines"

describe("placement deadline planner", () => {
  it("creates urgent mock, learning, interview and drive events for the primary track", () => {
    const today = new Date("2026-06-11T00:00:00")
    const deadlines = buildPlacementDeadlines({
      primary: "tcs",
      interested: ["tcs", "wipro"],
      hasMockScore: false,
      today,
      nextLearning: {
        sectionId: "quant",
        sectionShort: "Aptitude",
        chapterTitle: "Percentages & Ratios",
        href: "/learn/tcs/quant/quant-percentages",
      },
    })

    expect(deadlines.some((event) => event.title === "TCS NQT in 12 days")).toBe(true)
    expect(deadlines.some((event) => event.title === "TCS mock cutoff practice due today")).toBe(true)
    expect(deadlines.some((event) => event.title === "3 days left to finish Aptitude basics")).toBe(true)
    expect(deadlines.some((event) => event.type === "interview")).toBe(true)
    expect(deadlines.some((event) => event.companyId === "wipro")).toBe(true)
  })

  it("computes relative days from an absolute date", () => {
    expect(daysUntil("2026-06-23", new Date("2026-06-11T00:00:00"))).toBe(12)
  })
})

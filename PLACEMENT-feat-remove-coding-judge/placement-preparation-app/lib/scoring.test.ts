import { describe, it, expect } from "vitest"
import {
  PRI_WEIGHTS,
  EMPTY_PROGRESS,
  computePRI,
  placementProbability,
  priBand,
  probabilityBand,
  levelThreshold,
  levelFromXP,
  sectionMastery,
  overallReadiness,
  expectedPriGain,
  outcomeCalibration,
} from "@/lib/scoring"
import { getSections } from "@/lib/data/content"
import type { AppState, CompanyProgress, DriveOutcome } from "@/lib/types"

describe("PRI weights", () => {
  it("sum to exactly 1", () => {
    const sum = Object.values(PRI_WEIGHTS).reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(1, 6)
  })
})

describe("computePRI", () => {
  it("is 0 for empty progress (skipping never inflates)", () => {
    expect(computePRI("tcs", EMPTY_PROGRESS)).toBe(0)
  })

  it("rises above 0 once a chapter is genuinely passed", () => {
    const sections = getSections("tcs")
    const quant = sections.find((s) => s.id === "quant")!
    const chapters: CompanyProgress["chapters"] = {
      [quant.chapters[0].id]: { bestScore: 100, passed: true, skipped: false, attempts: 1 },
    }
    expect(computePRI("tcs", { chapters, mockScores: [] })).toBeGreaterThan(0)
  })

  it("does NOT count skipped chapters", () => {
    const sections = getSections("tcs")
    const quant = sections.find((s) => s.id === "quant")!
    const chapters: CompanyProgress["chapters"] = {
      [quant.chapters[0].id]: { bestScore: 90, passed: false, skipped: true, attempts: 1 },
    }
    expect(computePRI("tcs", { chapters, mockScores: [] })).toBe(0)
  })
})

describe("expectedPriGain", () => {
  it("is positive for an unpassed chapter and 0 once already passed", () => {
    const quant = getSections("tcs").find((s) => s.id === "quant")!
    const chId = quant.chapters[0].id

    const gainFromEmpty = expectedPriGain("tcs", chId, EMPTY_PROGRESS)
    expect(gainFromEmpty).toBeGreaterThan(0)

    const alreadyPassed: CompanyProgress = {
      chapters: { [chId]: { bestScore: 100, passed: true, skipped: false, attempts: 1 } },
      mockScores: [],
    }
    expect(expectedPriGain("tcs", chId, alreadyPassed)).toBe(0)
  })

  it("never returns a negative number", () => {
    const quant = getSections("tcs").find((s) => s.id === "quant")!
    expect(expectedPriGain("tcs", quant.chapters[0].id)).toBeGreaterThanOrEqual(0)
  })
})

describe("sectionMastery", () => {
  it("is 100 when every chapter in the section is passed at 100", () => {
    const quant = getSections("tcs").find((s) => s.id === "quant")!
    const chapters: CompanyProgress["chapters"] = {}
    for (const ch of quant.chapters) {
      chapters[ch.id] = { bestScore: 100, passed: true, skipped: false, attempts: 1 }
    }
    expect(sectionMastery("tcs", "quant", { chapters, mockScores: [] })).toBe(100)
  })

  it("is 0 for empty progress", () => {
    expect(sectionMastery("tcs", "quant", EMPTY_PROGRESS)).toBe(0)
  })
})

describe("placementProbability", () => {
  it("is bounded to [2, 97] regardless of input", () => {
    expect(placementProbability("tcs", -1000)).toBeGreaterThanOrEqual(2)
    expect(placementProbability("tcs", 100000)).toBeLessThanOrEqual(97)
  })

  it("increases as PRI increases", () => {
    expect(placementProbability("tcs", 80)).toBeGreaterThan(placementProbability("tcs", 40))
  })
})

describe("priBand", () => {
  it("maps scores to the right band", () => {
    expect(priBand(80).tone).toBe("success")
    expect(priBand(60).tone).toBe("info")
    expect(priBand(40).tone).toBe("warning")
    expect(priBand(10).tone).toBe("danger")
  })
})

describe("probabilityBand", () => {
  it("maps probabilities to the right band", () => {
    expect(probabilityBand(80).tone).toBe("success")
    expect(probabilityBand(50).tone).toBe("info")
    expect(probabilityBand(30).tone).toBe("warning")
    expect(probabilityBand(10).tone).toBe("danger")
  })
})

describe("levels", () => {
  it("levelThreshold matches the documented curve", () => {
    expect(levelThreshold(1)).toBe(0)
    expect(levelThreshold(2)).toBe(250)
    expect(levelThreshold(5)).toBe(1800)
    expect(levelThreshold(6)).toBe(2700) // 1800 + (6-5)*900
  })

  it("levelFromXP picks the right level at boundaries", () => {
    expect(levelFromXP(0).level).toBe(1)
    expect(levelFromXP(249).level).toBe(1)
    expect(levelFromXP(250).level).toBe(2)
  })

  it("reports progress within a level as a 0-100 percentage", () => {
    const r = levelFromXP(125) // halfway into level 1 (span 250)
    expect(r.pct).toBeGreaterThanOrEqual(0)
    expect(r.pct).toBeLessThanOrEqual(100)
  })
})

describe("overallReadiness", () => {
  const base: AppState = {
    onboarded: true,
    premium: false,
    profile: { name: "", college: "", branch: "", gradYear: "", cgpa: "", backlogs: "" },
    interested: [],
    primary: "general",
    xp: 0,
    streak: { count: 0, lastActive: "" },
    badges: [],
    progress: {},
    topicStats: {},
    daily: { date: "", general: false, aptitude: false, coding: false },
    codingAttempts: [],
    mistakes: [],
    outcomes: [],
  }

  it("is 0 when no companies are tracked", () => {
    expect(overallReadiness(base)).toBe(0)
  })
})

describe("outcomeCalibration", () => {
  const outcome = (partial: Partial<DriveOutcome>): DriveOutcome => ({
    id: "o1",
    companyId: "tcs",
    result: "selected",
    stageReached: "offer",
    priAtDrive: 70,
    ts: 0,
    ...partial,
  })

  it("returns null metrics when there is nothing decided", () => {
    const c = outcomeCalibration([outcome({ result: "in-progress" })])
    expect(c.total).toBe(1)
    expect(c.decided).toBe(0)
    expect(c.separation).toBeNull()
    expect(c.agreement).toBeNull()
  })

  it("reports positive separation when higher PRI tracked selection", () => {
    const c = outcomeCalibration([
      outcome({ id: "a", result: "selected", priAtDrive: 80 }),
      outcome({ id: "b", result: "rejected", priAtDrive: 30, stageReached: "online-test" }),
    ])
    expect(c.selected).toBe(1)
    expect(c.rejected).toBe(1)
    expect(c.avgPriSelected).toBe(80)
    expect(c.avgPriRejected).toBe(30)
    expect(c.separation).toBe(50)
    // Both drives agree with the readiness band (ready→selected, not-ready→rejected).
    expect(c.agreement).toBe(1)
  })

  it("counts a low-PRI selection as disagreement with the band", () => {
    const c = outcomeCalibration([
      outcome({ id: "a", result: "selected", priAtDrive: 20 }),
      outcome({ id: "b", result: "rejected", priAtDrive: 20, stageReached: "online-test" }),
    ])
    // selected-but-not-ready disagrees; rejected-and-not-ready agrees → 0.5
    expect(c.agreement).toBe(0.5)
  })
})

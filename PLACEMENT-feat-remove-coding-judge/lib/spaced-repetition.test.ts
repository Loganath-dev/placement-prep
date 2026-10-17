import { describe, expect, it } from "vitest"
import {
  boxOf,
  dueCount,
  dueForReview,
  dueLabel,
  intervalDaysForBox,
  isDue,
  isMastered,
  LEITNER_INTERVALS_DAYS,
  MAX_BOX,
  masteryPercent,
  nextSchedule,
} from "@/lib/spaced-repetition"
import type { Mistake } from "@/lib/types"

const DAY = 24 * 60 * 60 * 1000
const NOW = 1_700_000_000_000

function card(partial: Partial<Mistake>): Mistake {
  return {
    questionId: "q1",
    prompt: "p",
    options: ["a", "b"],
    answer: 0,
    chosen: 1,
    explanation: "",
    topic: "t",
    difficulty: "easy",
    ts: NOW,
    ...partial,
  }
}

describe("intervalDaysForBox", () => {
  it("maps boxes 1..MAX_BOX to the Leitner intervals", () => {
    expect(intervalDaysForBox(1)).toBe(0)
    expect(intervalDaysForBox(2)).toBe(1)
    expect(intervalDaysForBox(MAX_BOX)).toBe(LEITNER_INTERVALS_DAYS[MAX_BOX - 1])
  })

  it("clamps out-of-range boxes", () => {
    expect(intervalDaysForBox(0)).toBe(LEITNER_INTERVALS_DAYS[0])
    expect(intervalDaysForBox(99)).toBe(LEITNER_INTERVALS_DAYS[MAX_BOX - 1])
  })
})

describe("boxOf", () => {
  it("defaults an unscheduled card to box 1", () => {
    expect(boxOf(card({}))).toBe(1)
  })
  it("clamps to the valid range", () => {
    expect(boxOf(card({ box: 0 }))).toBe(1)
    expect(boxOf(card({ box: 999 }))).toBe(MAX_BOX)
  })
})

describe("nextSchedule", () => {
  it("promotes one box on a correct review and pushes due out", () => {
    const next = nextSchedule(card({ box: 1 }), true, NOW)
    expect(next.box).toBe(2)
    expect(next.due).toBe(NOW + 1 * DAY)
    expect(next.reviews).toBe(1)
    expect(next.lapses).toBe(0)
  })

  it("does not promote past the top box", () => {
    const next = nextSchedule(card({ box: MAX_BOX }), true, NOW)
    expect(next.box).toBe(MAX_BOX)
  })

  it("resets to box 1 and counts a lapse on a wrong review", () => {
    const next = nextSchedule(card({ box: 4, lapses: 2 }), false, NOW)
    expect(next.box).toBe(1)
    expect(next.due).toBe(NOW) // box 1 interval is 0 days → due immediately
    expect(next.lapses).toBe(3)
  })

  it("accumulates review counts", () => {
    expect(nextSchedule(card({ reviews: 5 }), true, NOW).reviews).toBe(6)
  })
})

describe("isDue / isMastered", () => {
  it("treats an unscheduled card as due now", () => {
    expect(isDue(card({}), NOW)).toBe(true)
  })
  it("respects a future due date", () => {
    expect(isDue(card({ due: NOW + DAY }), NOW)).toBe(false)
    expect(isDue(card({ due: NOW - DAY }), NOW)).toBe(true)
  })
  it("flags the top box as mastered", () => {
    expect(isMastered(card({ box: MAX_BOX }))).toBe(true)
    expect(isMastered(card({ box: 2 }))).toBe(false)
  })
})

describe("dueForReview", () => {
  it("returns only due cards, weakest box first", () => {
    const cards = [
      card({ questionId: "strong", box: 4, due: NOW - DAY }),
      card({ questionId: "weak", box: 1, due: NOW - DAY }),
      card({ questionId: "future", box: 1, due: NOW + DAY }),
    ]
    const due = dueForReview(cards, NOW)
    expect(due.map((m) => m.questionId)).toEqual(["weak", "strong"])
  })

  it("orders most-overdue first within the same box", () => {
    const cards = [
      card({ questionId: "recent", box: 2, due: NOW - DAY }),
      card({ questionId: "old", box: 2, due: NOW - 5 * DAY }),
    ]
    expect(dueForReview(cards, NOW).map((m) => m.questionId)).toEqual(["old", "recent"])
  })
})

describe("dueCount", () => {
  it("counts cards due now", () => {
    const cards = [card({ due: NOW - DAY }), card({ due: NOW + DAY }), card({})]
    expect(dueCount(cards, NOW)).toBe(2)
  })
})

describe("masteryPercent", () => {
  it("is 0 for an empty notebook", () => {
    expect(masteryPercent([])).toBe(0)
  })
  it("is 0 when every card is in box 1", () => {
    expect(masteryPercent([card({ box: 1 }), card({ box: 1 })])).toBe(0)
  })
  it("is 100 when every card is mastered", () => {
    expect(masteryPercent([card({ box: MAX_BOX }), card({ box: MAX_BOX })])).toBe(100)
  })
  it("is proportional in between", () => {
    // one card at box 3 of 5 → (3-1)/(5-1) = 50%
    expect(masteryPercent([card({ box: 3 })])).toBe(50)
  })
})

describe("dueLabel", () => {
  it("labels overdue and near-term cards", () => {
    expect(dueLabel(card({ due: NOW - DAY }), NOW)).toBe("Due now")
    expect(dueLabel(card({ due: NOW + DAY }), NOW)).toBe("Due tomorrow")
    expect(dueLabel(card({ due: NOW + 5 * DAY }), NOW)).toBe("Due in 5 days")
  })
})

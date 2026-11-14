import { describe, expect, it } from "vitest"
import type { AppState } from "@/lib/types"
import { BADGES, earnedBadges } from "@/lib/data/badges"

const baseState = (): AppState => ({
  onboarded: false,
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
})

describe("StudyBench achievements", () => {
  it("defines exactly 15 unique badges", () => {
    expect(BADGES).toHaveLength(15)
    expect(new Set(BADGES.map((badge) => badge.id)).size).toBe(15)
  })

  it("shows only badge IDs returned by the trusted server award ledger", () => {
    const state = baseState()
    expect(earnedBadges(state)).toEqual([])
    state.onboarded = true
    state.xp = 1000
    state.progress.general = { mockScores: [], chapters: { forged: { bestScore: 100, passed: true, skipped: false, attempts: 1 } } }
    // Client-editable counters and snapshots must not create earned badges.
    expect(earnedBadges(state)).toEqual([])
    state.badges = ["first-steps", "xp-250"]
    expect(earnedBadges(state).map((badge) => badge.id)).toEqual(["first-steps", "xp-250"])
  })

  it("does not award untrusted historical progress as a current achievement", () => {
    const state = baseState()
    state.progress.general = {
      mockScores: [],
      chapters: { old: { bestScore: 100, passed: true, skipped: false, attempts: 5,
        learning: { completedCardIds: [], completedLessonIds: [], passedLessonIds: ["old-lesson"], recallCompletedAt: 123, practiceAttempts: [{ score: 100, correct: 10, total: 10, completedAt: 123 }], savedCards: [] } } },
    }
    expect(earnedBadges(state)).toEqual([])
  })
})

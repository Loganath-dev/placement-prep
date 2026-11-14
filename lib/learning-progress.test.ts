import { describe, expect, it } from "vitest"
import { getPassedLessonIds, getSafeLearningCardIndex, isLessonPassed, LESSON_PASS_THRESHOLD, onlyCompletedLessonSets, updatePassedLessonIds } from "./learning-progress"

describe("lesson checkpoint mastery", () => {
  it("uses 60 percent as the lesson pass threshold", () => {
    expect(LESSON_PASS_THRESHOLD).toBe(60)
    expect(isLessonPassed(59)).toBe(false)
    expect(isLessonPassed(60)).toBe(true)
    expect(isLessonPassed(100)).toBe(true)
  })

  it("does not mark a lesson passed after a failed attempt", () => {
    expect(updatePassedLessonIds(["lesson-1"], "lesson-2", 55)).toEqual(["lesson-1"])
  })

  it("marks a passed lesson once and preserves earlier mastery", () => {
    expect(updatePassedLessonIds(["lesson-1"], "lesson-2", 60)).toEqual(["lesson-1", "lesson-2"])
    expect(updatePassedLessonIds(["lesson-1", "lesson-2"], "lesson-2", 90)).toEqual(["lesson-1", "lesson-2"])
  })

  it("recovers mastery from old saved practice attempts", () => {
    expect([...getPassedLessonIds({
      practiceAttempts: [
        { lessonId: "passed", score: 60 },
        { lessonId: "failed", score: 50 },
      ],
    })]).toEqual(["passed"])
  })

  it("builds challenge material exclusively from this user's passed lessons", () => {
    const lessons = [
      { id: "lesson-passed" },
      { id: "lesson-in-progress" },
      { id: "lesson-not-started" },
    ]
    const questionSets = [
      [{ id: "q-passed" }],
      [{ id: "q-in-progress" }],
      [{ id: "q-not-started" }],
    ]

    expect(onlyCompletedLessonSets(lessons, questionSets, new Set(["lesson-passed"]))).toEqual([
      { lesson: lessons[0], questions: [{ id: "q-passed" }] },
    ])
  })

  it("does not create challenge material when no lessons have been passed", () => {
    expect(onlyCompletedLessonSets(
      [{ id: "lesson-1" }],
      [[{ id: "q1" }]],
      new Set(),
    )).toEqual([])
  })

})

describe("verified lesson card resume position", () => {
  it("clamps a stale resume pointer to the first unfinished card", () => {
    expect(getSafeLearningCardIndex(4, 3, 8)).toBe(3)
  })

  it("allows reviewing earlier cards without skipping the next unfinished card", () => {
    expect(getSafeLearningCardIndex(1, 3, 8)).toBe(1)
  })

  it("allows any card after every card is verified", () => {
    expect(getSafeLearningCardIndex(6, -1, 8)).toBe(6)
  })

  it("handles empty lists and invalid indexes safely", () => {
    expect(getSafeLearningCardIndex(4, 0, 0)).toBe(0)
    expect(getSafeLearningCardIndex(Number.NaN, 2, 5)).toBe(0)
    expect(getSafeLearningCardIndex(-10, 2, 5)).toBe(0)
  })
})

import { describe, expect, it } from "vitest"
import { deriveVerifiedProgress, type ProgressEvent } from "@/lib/learning-progress-events"

function event(overrides: Partial<ProgressEvent>): ProgressEvent {
  return {
    id: crypto.randomUUID(), company_id: "general", section_id: "quant", chapter_id: "chapter-1",
    lesson_id: null, event_type: "lesson_card_completed", selected_answers: null,
    score_percent: null, passed: null, created_at: new Date().toISOString(), ...overrides,
  }
}

describe("deriveVerifiedProgress", () => {
  it("only unlocks lessons and chapters from passed server events", () => {
    const result = deriveVerifiedProgress([
      event({ event_type: "lesson_practice_submitted", lesson_id: "lesson-a", score_percent: 55, passed: false }),
      event({ event_type: "lesson_practice_submitted", lesson_id: "lesson-a", score_percent: 60, passed: true }),
      event({ event_type: "chapter_recall_completed", passed: true }),
      event({ event_type: "chapter_assessment_submitted", score_percent: 69, passed: false }),
      event({ event_type: "chapter_assessment_submitted", score_percent: 70, passed: true }),
    ])
    expect(result.passedLessonIdsByChapter.get("chapter-1")?.has("lesson-a")).toBe(true)
    expect(result.recalledChapterIds.has("chapter-1")).toBe(true)
    expect(result.passedChapterIds.has("chapter-1")).toBe(true)
    expect(result.latestLessonScores.get("chapter-1:lesson-a")).toBe(60)
  })

  it("does not treat failed Recall or failed assessments as completion", () => {
    const result = deriveVerifiedProgress([
      event({ event_type: "chapter_recall_completed", passed: false }),
      event({ event_type: "chapter_assessment_submitted", score_percent: 69, passed: false }),
    ])
    expect(result.recalledChapterIds.has("chapter-1")).toBe(false)
    expect(result.passedChapterIds.has("chapter-1")).toBe(false)
  })

  it("deduplicates card IDs when deriving completed cards", () => {
    const result = deriveVerifiedProgress([
      event({ selected_answers: { cardId: "card-1" } }),
      event({ selected_answers: { cardId: "card-1" } }),
    ])
    expect([...result.completedCardIdsByChapter.get("chapter-1") ?? []]).toEqual(["card-1"])
  })
})

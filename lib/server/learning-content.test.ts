import { describe, expect, it } from "vitest"
import { buildLessonPracticeSets } from "@/lib/server/learning-content"
import type { Chapter, Question } from "@/lib/types"

function question(id: string, difficulty: Question["difficulty"]): Question {
  return {
    id,
    topic: "Foundations",
    difficulty,
    prompt: `Question ${id}`,
    options: ["A", "B", "C", "D"],
    answer: 0,
    explanation: `Explanation for ${id}`,
    curated: true,
  }
}

describe("lesson practice construction", () => {
  it("caps every lesson checkpoint at exactly 20 questions when the bank is larger", () => {
    const chapter: Chapter = {
      id: "twenty-question-limit",
      title: "Twenty question limit",
      summary: "A checkpoint must never exceed twenty questions.",
      lessons: [{ id: "lesson-1", title: "Foundations", minutes: 5, body: "Explain the foundation." }],
      quiz: Array.from({ length: 32 }, (_, index) => ({
        ...question(`q-${index + 1}`, index < 12 ? "easy" : index < 24 ? "medium" : "hard"),
        lessonId: "lesson-1",
      })),
    }

    const sets = buildLessonPracticeSets(chapter, "general", "quant")
    expect(sets).toHaveLength(1)
    expect(sets[0]).toHaveLength(20)
    expect(sets[0].every((item) => item.lessonId === "lesson-1")).toBe(true)
  })

  it("keeps each lesson's questions in easy-to-hard order", () => {
    const chapter: Chapter = {
      id: "test-topic",
      title: "Test topic",
      summary: "Test summary",
      lessons: [
        { id: "lesson-1", title: "Foundations", minutes: 5, body: "Explain the foundation." },
        { id: "lesson-2", title: "Application", minutes: 5, body: "Apply the foundation." },
      ],
      quiz: [
        question("easy-1", "easy"),
        question("medium-1", "medium"),
        question("hard-1", "hard"),
        question("easy-2", "easy"),
        question("medium-2", "medium"),
        question("hard-2", "hard"),
      ],
    }

    const sets = buildLessonPracticeSets(chapter, "general", "quant")
    expect(sets).toHaveLength(2)
    expect(sets[0].map((item) => item.difficulty)).toEqual(["easy", "easy", "medium", "medium", "hard", "hard"])
    expect(sets[1]).toEqual([])
  })

  it("maps explicitly tagged questions to their matching lesson instead of round-robin mixing", () => {
    const chapter: Chapter = {
      id: "mapped-topic",
      title: "Quantitative aptitude",
      summary: "Test summary",
      lessons: [
        { id: "percentages", title: "Percentages", minutes: 5, body: "Calculate percentage increase and decrease." },
        { id: "averages", title: "Averages", minutes: 5, body: "Calculate arithmetic mean and weighted average." },
      ],
      quiz: [
        { ...question("percentage-q", "easy"), topic: "Percentages" },
        { ...question("average-q", "medium"), topic: "Averages" },
        { ...question("explicit-q", "hard"), topic: "General", lessonId: "percentages" },
      ],
    }

    const sets = buildLessonPracticeSets(chapter, "general", "quant")
    expect(sets[0].map((item) => item.id)).toEqual(["percentage-q", "explicit-q"])
    expect(sets[1].map((item) => item.id)).toEqual(["average-q"])
  })

  it("does not invent filler questions when a chapter has a small authored bank", () => {
    const chapter: Chapter = {
      id: "small-topic",
      title: "Small topic",
      summary: "Test summary",
      lessons: [
        { id: "lesson-1", title: "One", minutes: 5, body: "A complete explanation." },
        { id: "lesson-2", title: "Two", minutes: 5, body: "A worked example." },
      ],
      quiz: [question("only-authored", "easy")],
    }

    const sets = buildLessonPracticeSets(chapter, "general", "quant")
    expect(sets.flat()).toEqual([])
  })

  it("removes duplicate IDs and duplicate prompts", () => {
    const duplicatePrompt = { ...question("different-id", "easy"), prompt: "Question same-id" }
    const chapter: Chapter = {
      id: "duplicate-topic",
      title: "Duplicate topic",
      summary: "Test summary",
      lessons: [{ id: "lesson-1", title: "One", minutes: 5, body: "Explain." }],
      quiz: [question("same-id", "easy"), duplicatePrompt],
    }

    const sets = buildLessonPracticeSets(chapter, "general", "quant")
    expect(sets.flat()).toHaveLength(0)
  })
})

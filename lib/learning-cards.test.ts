import { describe, expect, it } from "vitest"
import { COMPANIES } from "@/lib/data/companies"
import { getSections, getChapter } from "@/lib/data/content"
import { buildChapterLearningDeck, buildChapterRecallDeck } from "@/lib/learning-cards"
import { PROGRAMMING_CHAPTERS } from "@/lib/data/programming-curriculum"

describe("lesson-scoped learning cards", () => {
  it("creates stable cards with the actual lesson ID for every published lesson", () => {
    let lessonCount = 0
    for (const company of COMPANIES) {
      for (const section of getSections(company.id)) {
        for (const chapter of section.chapters) {
          const deck = buildChapterLearningDeck(chapter)
          for (const lesson of chapter.lessons) {
            lessonCount += 1
            const lessonCards = deck.filter((card) => card.lessonId === lesson.id)
            expect(lessonCards.length, `${company.id}/${chapter.id}/${lesson.id} should have authored learning content`).toBeGreaterThan(0)
            expect(new Set(lessonCards.map((card) => card.id)).size).toBe(lessonCards.length)
            expect(lessonCards.every((card) => card.id.includes(lesson.id))).toBe(true)
            expect(lessonCards.every((card) => card.answer.trim().length > 0)).toBe(true)
          }
          expect(deck.every((card) => card.lessonId !== "chapter")).toBe(true)
        }
      }
    }
    expect(lessonCount).toBeGreaterThan(0)
  })

  it("keeps concept, example and strategy material inside the lesson that authored it", () => {
    const chapter = getChapter("general", "quant", "quant-percentages")
    expect(chapter).toBeTruthy()
    const deck = buildChapterLearningDeck(chapter!)
    const lesson = chapter!.lessons[0]!
    const cards = deck.filter((card) => card.lessonId === lesson.id)
    expect(cards.length).toBeGreaterThan(0)
    expect(cards.every((card) => card.lessonId === lesson.id)).toBe(true)
    expect(cards.some((card) => card.answer.includes("30% = 30/100 = 0.30"))).toBe(true)
  })

  it("keeps code examples within their programming lesson", () => {
    const languageChapters = PROGRAMMING_CHAPTERS.filter((chapter) => chapter.pathKind === "language")
    const paths = new Set(languageChapters.map((chapter) => chapter.pathId))
    for (const path of ["lang-c", "lang-cpp", "lang-java", "lang-python", "lang-javascript", "lang-csharp", "lang-php"]) {
      expect(paths.has(path), `${path} path is missing`).toBe(true)
      const pathChapters = languageChapters.filter((chapter) => chapter.pathId === path)
      expect(pathChapters.some((chapter) => buildChapterLearningDeck(chapter).some((card) => card.answer.includes("```"))), `${path} should include code examples in lesson cards`).toBe(true)
    }
  })


  it("builds a compact 1–3 card chapter recall deck from taught lesson material", () => {
    for (const company of COMPANIES) {
      for (const section of getSections(company.id)) {
        for (const chapter of section.chapters) {
          const recall = buildChapterRecallDeck(chapter)
          expect(recall.length, `${company.id}/${chapter.id} recall deck size`).toBeGreaterThanOrEqual(1)
          expect(recall.length, `${company.id}/${chapter.id} recall deck size`).toBeLessThanOrEqual(3)
          expect(new Set(recall.map((card) => card.id)).size).toBe(recall.length)
          expect(recall.every((card) => card.answer.trim().length > 0)).toBe(true)
          for (const lesson of chapter.lessons) {
            expect(recall.some((card) => card.answer.includes(lesson.title)), `${company.id}/${chapter.id} recall must include ${lesson.title}`).toBe(true)
          }
        }
      }
    }
  })

  it("uses lesson-level practice authorization and retains the separate chapter assessment", async () => {
    const fs = await import("node:fs/promises")
    const lessonRoute = await fs.readFile("app/api/content/chapter/route.ts", "utf8")
    const practiceRoute = await fs.readFile("app/api/content/lesson-practice/route.ts", "utf8")
    const chapterRoute = await fs.readFile("app/api/content/chapter-practice/route.ts", "utf8")
    expect(lessonRoute).toContain("buildChapterLearningDeck")
    expect(lessonRoute).toContain("buildChapterRecallDeck")
    expect(lessonRoute).toContain("chapterRecallCards")
    expect(practiceRoute).toContain("requiredIds.every")
    expect(practiceRoute).toContain("buildLessonPracticeSets")
    expect(chapterRoute).toContain("requiredCardIds.every")
    const chapterPage = await fs.readFile("app/(app)/learn/[company]/[section]/[chapter]/page.tsx", "utf8")
    expect(chapterPage).toContain('passThreshold={practiceMode === "lesson" ? LESSON_PASS_THRESHOLD : 70}')
    expect(chapterPage).toContain("Complete the Chapter Recall node first")
  })
})

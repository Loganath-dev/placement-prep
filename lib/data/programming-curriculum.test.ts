import { describe, expect, it } from "vitest"
import { chapterPracticeQuestions, getSections } from "@/lib/data/content"
import { PROGRAMMING_PATHS } from "@/lib/data/programming-curriculum"
import { FREE_LESSONS_PER_PATH } from "@/lib/access"
import { buildLessonPracticeSets } from "@/lib/server/learning-content"

describe("programming learning paths", () => {
  it("includes seven independent programming-language paths plus DSA and SQL/DBMS", () => {
    const languagePaths = PROGRAMMING_PATHS.filter((path) => path.kind === "language")
    expect(languagePaths.map((path) => path.short)).toEqual(["C", "C++", "Java", "Python", "JavaScript", "C#", "PHP"])
    expect(PROGRAMMING_PATHS.some((path) => path.id === "dsa" && path.kind === "dsa")).toBe(true)
    expect(PROGRAMMING_PATHS.some((path) => path.id === "sql-dbms" && path.kind === "sql-dbms")).toBe(true)
  })

  it("provides a complete beginner-to-advanced chapter sequence and two free starter lessons for every language", () => {
    const coding = getSections("general").find((section) => section.id === "coding")
    expect(coding).toBeDefined()
    for (const path of PROGRAMMING_PATHS.filter((item) => item.kind === "language")) {
      const chapters = coding!.chapters.filter((chapter) => chapter.pathId === path.id)
      expect(chapters).toHaveLength(15)
      // The student roadmap contract is two substantial learning lessons per chapter.
      // Do not inflate the visible lesson count with duplicate review/practice records.
      expect(chapters.every((chapter) => chapter.lessons.length === 2)).toBe(true)
      expect(chapters.every((chapter) => chapter.lessons.every((lesson) => lesson.body.trim().split(/\s+/).filter(Boolean).length >= 60))).toBe(true)
      expect(FREE_LESSONS_PER_PATH).toBe(2)
      expect(chapters.every((chapter) => chapter.lessons.length >= FREE_LESSONS_PER_PATH)).toBe(true)
      expect(chapters.every((chapter) => chapter.quiz.length > 0)).toBe(true)
      expect(chapters.every((chapter) => chapter.quiz.length >= 3)).toBe(true)
      expect(chapters.every((chapter) => chapter.pathKind === "language")).toBe(true)
    }
  })

  it("provides authored, focused practice for each language and SQL starter chapter", () => {
    const coding = getSections("general").find((section) => section.id === "coding")!
    for (const path of PROGRAMMING_PATHS.filter((item) => item.kind === "language" || item.kind === "sql-dbms")) {
      const chapter = coding.chapters.find((item) => item.pathId === path.id)
      expect(chapter, `${path.name} starter chapter should exist`).toBeDefined()
      const questions = chapterPracticeQuestions("general", "coding", chapter!.id)
      expect(questions.length).toBeGreaterThan(0)
      expect(new Set(questions.map((question) => question.prompt.trim().toLowerCase())).size).toBe(questions.length)
      expect(questions.filter((question) => question.sourceId !== "studybench-curriculum").map((question) => question.id), `${path.id}/${chapter!.id} practice must retain curriculum provenance`).toEqual([])
    }
  })


  it("provides topic-matched checkpoint practice for every programming-language lesson", () => {
    const coding = getSections("general").find((section) => section.id === "coding")!
    for (const path of PROGRAMMING_PATHS.filter((item) => item.kind === "language")) {
      const chapters = coding.chapters.filter((chapter) => chapter.pathId === path.id)
      for (const chapter of chapters) {
        const sets = buildLessonPracticeSets(chapter, "general", "coding")
        expect(sets, `${path.id}/${chapter.id} should have one practice set per lesson`).toHaveLength(chapter.lessons.length)
        chapter.lessons.forEach((lesson, index) => {
          expect(sets[index]?.length ?? 0, `${path.id}/${chapter.id}/${lesson.id} needs topic-matched practice`).toBeGreaterThan(0)
          expect(sets[index].length, `${path.id}/${chapter.id}/${lesson.id} must respect the 20-question checkpoint cap`).toBeLessThanOrEqual(20)
        })
      }
    }
  })

  it("provides a 14-chapter DSA roadmap and typed recall across core learning areas", () => {
    const sections = getSections("general")
    const technical = sections.find((section) => section.id === "coding")!
    expect(technical.chapters.filter((chapter) => chapter.pathId === "dsa")).toHaveLength(14)

    const python = technical.chapters.filter((chapter) => chapter.pathId === "lang-python")
    expect(python.some((chapter) => chapter.quiz.some((question) => question.type === "fill_blank"))).toBe(true)

    for (const sectionId of ["quant", "reasoning", "verbal", "cs-core"] as const) {
      const section = sections.find((item) => item.id === sectionId)!
      expect(
        section.chapters.some((chapter) => chapter.quiz.some((question) => question.type === "fill_blank")),
        `${sectionId} should include at least one typed-recall exercise`,
      ).toBe(true)
    }
    expect(
      technical.chapters.some((chapter) => chapter.pathId === "dsa" && chapter.quiz.some((question) => question.type === "fill_blank")),
    ).toBe(true)
  })

  it("serves a full SQL-specific chapter bank with StudyBench provenance", () => {
    const coding = getSections("general").find((section) => section.id === "coding")!
    const sqlChapters = coding.chapters.filter((chapter) => chapter.pathId === "sql-dbms")
    expect(sqlChapters).toHaveLength(3)

    for (const chapter of sqlChapters) {
      const questions = chapterPracticeQuestions("general", "coding", chapter.id)
      expect(questions.length).toBeGreaterThan(0)
      expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length)
      expect(new Set(questions.map((question) => question.prompt.trim().toLowerCase())).size).toBe(questions.length)
      expect(questions.every((question) => question.sourceId === "studybench-curriculum")).toBe(true)
      expect(new Set(questions.map((question) => question.answer)).size).toBeGreaterThan(1)
      expect(chapter.quiz.every((question) => question.sourceId === "studybench-curriculum")).toBe(true)
    }
  })

  it("teaches advanced SQL query reasoning with CTEs, NULL semantics and window functions", () => {
    const coding = getSections("general").find((section) => section.id === "coding")!
    const sql = coding.chapters.find((chapter) => chapter.pathId === "sql-dbms" && chapter.id.includes("joins-transactions"))
    expect(sql, "SQL joins and transactions chapter should exist").toBeDefined()
    const lessonText = sql!.lessons.map((lesson) => lesson.body).join("\n")
    expect(lessonText).toContain("WITH department_averages AS")
    expect(lessonText).toContain("DENSE_RANK() OVER")
    expect(lessonText).toContain("NOT IN")
    expect(lessonText).toContain("PARTITION BY")
    const prompts = sql!.quiz.map((question) => question.prompt.toLowerCase()).join("\n")
    expect(prompts).toContain("not in")
    expect(prompts).toContain("partition by")
    expect(prompts).toContain("dense_rank")
  })

  it("keeps authored question prompts distinct within each technical path", () => {
    const coding = getSections("general").find((section) => section.id === "coding")!
    for (const path of PROGRAMMING_PATHS.filter((item) => item.kind === "language" || item.kind === "sql-dbms")) {
      const questions = coding.chapters
        .filter((chapter) => chapter.pathId === path.id)
        .flatMap((chapter) => chapter.quiz)
      expect(new Set(questions.map((question) => question.prompt.trim().toLowerCase())).size)
        .toBe(questions.length)
    }
  })

  it("keeps chapter and lesson identifiers unique across the general learning catalogue", () => {
    const chapters = getSections("general").flatMap((section) => section.chapters)
    const chapterIds = chapters.map((chapter) => chapter.id)
    const lessonIds = chapters.flatMap((chapter) => chapter.lessons.map((lesson) => lesson.id))
    expect(new Set(chapterIds).size).toBe(chapterIds.length)
    expect(new Set(lessonIds).size).toBe(lessonIds.length)
  })

  it("keeps DSA chapters and the SQL/DBMS path separately addressable", () => {
    const coding = getSections("general").find((section) => section.id === "coding")
    expect(coding!.chapters.filter((chapter) => chapter.pathId === "dsa").length).toBeGreaterThanOrEqual(5)
    expect(coding!.chapters.filter((chapter) => chapter.pathId === "sql-dbms")).toHaveLength(3)
  })
})

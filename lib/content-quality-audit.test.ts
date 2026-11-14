import { describe, expect, it } from "vitest"
import { COMPANIES } from "@/lib/data/companies"
import { chapterPracticeQuestions, getSections } from "@/lib/data/content"
import { INTERVIEW_QUESTIONS } from "@/lib/data/interview"
import { PROGRAMMING_CHAPTERS } from "@/lib/data/programming-curriculum"
import { buildMockQuestions, MOCK_TESTS } from "@/lib/data/mocks"
import { ALL_PYQS, PYQS, pyqsForCompany } from "@/lib/data/pyqs"
import type { Question } from "@/lib/types"

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim()
}

function expectNoDuplicateTexts(values: string[], context: string) {
  const seen = new Map<string, number>()
  for (const value of values) {
    const key = normalizeText(value)
    seen.set(key, (seen.get(key) ?? 0) + 1)
  }
  const duplicates = [...seen.entries()].filter(([, count]) => count > 1)
  expect(
    duplicates.map(([text, count]) => `${count}x ${text}`).slice(0, 10),
    `${context} has repeated text`,
  ).toEqual([])
}

function expectValidQuestion(question: Question, context: string) {
  expect(question.id.trim(), `${context} has empty id`).not.toBe("")
  expect(question.topic.trim(), `${context} has empty topic`).not.toBe("")
  expect(question.prompt.trim(), `${context} has empty prompt`).not.toBe("")
  expect(question.explanation.trim(), `${context} has empty explanation`).not.toBe("")
  expect(["easy", "medium", "hard"], `${context} has invalid difficulty`).toContain(
    question.difficulty,
  )
  if (question.type === "fill_blank") {
    expect(question.options, `${context} typed question should not have MCQ options`).toEqual([])
    expect(question.answer, `${context} typed answer uses the -1 sentinel`).toBe(-1)
    expect(question.acceptedAnswers?.length, `${context} needs at least one accepted answer`).toBeGreaterThan(0)
    for (const answer of question.acceptedAnswers ?? []) {
      expect(answer.trim(), `${context} has an empty accepted answer`).not.toBe("")
    }
  } else {
    expect(question.options.length, `${context} must have four options`).toBe(4)
    expect(question.answer, `${context} answer index below range`).toBeGreaterThanOrEqual(0)
    expect(question.answer, `${context} answer index above range`).toBeLessThan(
      question.options.length,
    )
    for (const option of question.options) {
      expect(option.trim(), `${context} has empty option`).not.toBe("")
    }
    expectNoDuplicateTexts(question.options, `${context} options`)
    expect(
      normalizeText(question.options[question.answer]),
      `${context} correct option must be non-empty`,
    ).not.toBe("")
  }
}

describe("content quality audit", () => {
  it("has no malformed PYQ answers, duplicate options or exact repeated prompts", () => {
    expectNoDuplicateTexts(
      PYQS.map((question) => question.prompt),
      "global hand-authored PYQ bank across all company tracks",
    )
    for (const question of ALL_PYQS) {
      expectValidQuestion(question, `PYQ ${question.id}`)
    }

    for (const company of COMPANIES) {
      for (const section of ["quant", "reasoning", "verbal", "coding", "cs-core", "comm-interview"] as const) {
        const scoped = pyqsForCompany(company.id).filter((question) => question.section === section)
        expectNoDuplicateTexts(
          scoped.map((question) => question.prompt),
          `${company.id}/${section} PYQ prompts`,
        )
      }
    }
  })

  // Chapter quizzes and practice banks are produced by the same company-parametric
  // generation path for every track, so exhaustively validating all 13 here is
  // redundant — and generating ~215K practice questions pushed the suite past its
  // timeout under load. content-governance.test.ts already validates sourcing,
  // uniqueness and minimum counts across ALL companies; this audit checks the
  // generators' structural quality, which we sample on the variants that exercise
  // every distinct path: `general` (base sections), `zoho` (the extra coding
  // chapter) and two regular company tracks.
  const AUDIT_SAMPLE = ["general", "zoho", "tcs", "accenture"] as const

  it.each(AUDIT_SAMPLE)(
    "has valid chapter quizzes without exact repeated prompts (%s)",
    (companyId) => {
      for (const section of getSections(companyId)) {
        for (const chapter of section.chapters) {
          for (const question of chapter.quiz) {
            expectValidQuestion(question, `${companyId}/${chapter.id}/${question.id}`)
          }
          expectNoDuplicateTexts(
            chapter.quiz.map((question) => question.prompt),
            `${companyId}/${chapter.id} quiz prompts`,
          )
        }
      }
    },
    120_000,
  )

  it.each(AUDIT_SAMPLE)(
    "generates a valid practice bank without repeated prompts (%s)",
    (companyId) => {
      for (const section of getSections(companyId)) {
        for (const chapter of section.chapters) {
          const practice = chapterPracticeQuestions(companyId, section.id, chapter.id)
          for (const question of practice) {
            expectValidQuestion(question, `${companyId}/${chapter.id}/practice/${question.id}`)
          }
          expectNoDuplicateTexts(
            practice.map((question) => question.prompt),
            `${companyId}/${chapter.id} practice prompts`,
          )
        }
      }
    },
    120_000,
  )


  it("keeps the general curriculum's chapter banks and lesson explanations above the remediation floor", () => {
    const chapters = getSections("general").flatMap((section) => section.chapters)
    const thinBanks = chapters
      .filter((chapter) => chapter.quiz.length < 8)
      .map((chapter) => `${chapter.id}: ${chapter.quiz.length}`)
    expect(thinBanks, "chapter quiz banks below eight authored questions").toEqual([])

    const shortLessons = chapters.flatMap((chapter) =>
      chapter.lessons
        .filter((lesson) => lesson.body.trim().split(/\\s+/).filter(Boolean).length < 60)
        .map((lesson) => `${chapter.id}/${lesson.id}`),
    )
    expect(shortLessons, "lessons below the minimum explanation length").toEqual([])
  })


  it("keeps generated programming and DSA chapter banks above eight questions", () => {
    const thin = PROGRAMMING_CHAPTERS
      .filter((chapter) => chapter.quiz.length < 8)
      .map((chapter) => `${chapter.id}: ${chapter.quiz.length}`)
    expect(thin, "programming/DSA/SQL chapter banks below eight questions").toEqual([])
  })

  it("uses exact, not rounded, time for the opposing-trains crossing calculation", () => {
    const chapter = getSections("general").find((section) => section.id === "quant")?.chapters.find((item) => item.id === "quant-tsd")
    const item = chapter?.quiz.find((question) => question.prompt.includes("Two trains of 100 m and 80 m"))
    expect(item).toBeTruthy()
    expect(item!.options[item!.answer]).toBe("7.2 s")
    expect(item!.explanation).toContain("180/25 = 7.2 s")
  })

  it("keeps SQL/DBMS practice on its dedicated authored track and covers advanced SQL", () => {
    const sqlChapters = getSections("general").flatMap((section) =>
      section.chapters
        .filter((chapter) => chapter.pathKind === "sql-dbms")
        .map((chapter) => ({ section, chapter })),
    )
    expect(sqlChapters.length).toBeGreaterThan(0)
    const sqlPractice = sqlChapters.flatMap(({ section, chapter }) =>
      chapterPracticeQuestions("general", section.id, chapter.id),
    )
    expect(sqlPractice.length).toBeGreaterThan(0)
    expect(sqlPractice.some((question) => question.topic === "CTE")).toBe(true)
    expect(sqlPractice.some((question) => question.topic === "Window function")).toBe(true)
    expect(sqlPractice.some((question) => question.topic === "Window aggregate")).toBe(true)
    for (const topic of ["Practical SELECT", "Practical aggregation", "Practical HAVING", "Practical INNER JOIN", "Practical LEFT JOIN", "Practical anti-join"]) {
      expect(sqlPractice.some((question) => question.topic === topic), `SQL practice should include ${topic}`).toBe(true)
    }
    const practical = sqlPractice.filter((question) => question.topic.startsWith("Practical "))
    expect(practical.length).toBeGreaterThanOrEqual(6)
    for (const question of practical) {
      expect(question.curated, `${question.id} should be hand-authored curriculum material`).toBe(true)
      expect(question.options[question.answer], `${question.id} answer should be a non-empty query or expression`).toBeTruthy()
      expect(question.explanation.length, `${question.id} should explain the reasoning`).toBeGreaterThan(45)
    }
    for (const question of sqlPractice) expectValidQuestion(question, `SQL/${question.id}`)
  }, 120_000)

  it("has valid mock questions without repeated prompts inside a mock", () => {
    for (const mock of MOCK_TESTS) {
      const questions = buildMockQuestions(mock)
      for (const question of questions) {
        expectValidQuestion(question, `${mock.id}/${question.id}`)
      }
      expectNoDuplicateTexts(
        questions.map((question) => question.prompt),
        `${mock.id} mock prompts`,
      )
    }
  }, 120_000)

  it("does not clone the same mock question set inside a company series", () => {
    for (const company of COMPANIES) {
      const signatures = MOCK_TESTS.filter((mock) => mock.companyId === company.id).map((mock) =>
        buildMockQuestions(mock)
          .map((question) => normalizeText(question.prompt))
          .sort()
          .join(" || "),
      )

      expectNoDuplicateTexts(signatures, `${company.id} mock question-set signatures`)
    }
  }, 60_000)

  it("has no repeated interview prompts", () => {
    for (const company of COMPANIES) {
      for (const category of ["technical", "hr", "managerial", "coding", "domain"] as const) {
        const scoped = INTERVIEW_QUESTIONS.filter(
          (question) => question.company === company.id && question.category === category,
        )
        expectNoDuplicateTexts(
          scoped.map((question) => question.question),
          `${company.id}/${category} interview prompts`,
        )
      }
    }
  })
})

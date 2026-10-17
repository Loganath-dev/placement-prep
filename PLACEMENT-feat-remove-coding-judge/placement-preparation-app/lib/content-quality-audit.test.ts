import { describe, expect, it } from "vitest"
import { COMPANIES } from "@/lib/data/companies"
import { ALL_CODING_PROBLEMS } from "@/lib/data/coding-problems"
import { chapterPracticeQuestions, getSections } from "@/lib/data/content"
import { INTERVIEW_QUESTIONS } from "@/lib/data/interview"
import { buildMockQuestions, MOCK_TESTS } from "@/lib/data/mocks"
import { ALL_PYQS, pyqsForCompany } from "@/lib/data/pyqs"
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

describe("content quality audit", () => {
  it("has no malformed PYQ answers, duplicate options or exact repeated prompts", () => {
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

  it("has no repeated coding problems, coding test cases or interview prompts", () => {
    expectNoDuplicateTexts(
      ALL_CODING_PROBLEMS.map((problem) => problem.title),
      "coding problem titles",
    )
    for (const problem of ALL_CODING_PROBLEMS) {
      expect(problem.prompt.trim(), `${problem.id} prompt is empty`).not.toBe("")
      expect(problem.editorial.trim(), `${problem.id} editorial is empty`).not.toBe("")
      expectNoDuplicateTexts(
        problem.testCases.map((test) => `${test.input} -> ${test.output}`),
        `${problem.id} test cases`,
      )
    }

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

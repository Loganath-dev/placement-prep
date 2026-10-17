import { describe, expect, it } from "vitest"
import { COMPANIES } from "@/lib/data/companies"
import { ALL_CODING_PROBLEMS, codingProblemsForCompany } from "@/lib/data/coding-problems"
import { CHAPTER_PRACTICE_TARGET, chapterPracticeQuestions, getSections } from "@/lib/data/content"
import { INTERVIEW_QUESTIONS } from "@/lib/data/interview"
import { MOCKS_PER_COMPANY, MOCK_TESTS, buildMockQuestions } from "@/lib/data/mocks"
import { ALL_PYQS, EXPANDED_PYQS, FLAGSHIP_PYQS, PYQS, pyqsForCompany } from "@/lib/data/pyqs"
import { generateDrills } from "@/lib/data/question-bank"
import { SOURCES, sourceById } from "@/lib/data/sources"
import type { Question } from "@/lib/types"

const APPROVED_SOURCE_KINDS = ["official", "book", "reference", "youtube"] as const

function expectKnownSource(id: string | undefined, context: string) {
  expect(id, `${context} is missing sourceId`).toBeTruthy()
  expect(sourceById(id), `${context} has unknown sourceId: ${id}`).toBeTruthy()
}

function expectGovernedQuestion(q: Question, context: string) {
  expectKnownSource(q.sourceId, `${context} (${q.id})`)
  expect(q.prompt.trim().length, `${context} (${q.id}) prompt is empty`).toBeGreaterThan(0)
  expect(q.explanation.trim().length, `${context} (${q.id}) explanation is empty`).toBeGreaterThan(0)
}

function expectUniqueIds(ids: string[], context: string) {
  expect(new Set(ids).size, `${context} contains duplicate IDs`).toBe(ids.length)
}

describe("content source governance", () => {
  it("registers only approved source kinds and links official sources", () => {
    for (const source of Object.values(SOURCES)) {
      expect(source.id.trim().length).toBeGreaterThan(0)
      expect(source.publisher.trim().length).toBeGreaterThan(0)
      expect(source.note.trim().length).toBeGreaterThan(0)
      expect(APPROVED_SOURCE_KINDS).toContain(source.kind)

      if (source.kind === "official") {
        expect(source.url, `${source.id} official source must have a citation URL`).toMatch(/^https:\/\//)
      }
    }
  })

  it("keeps company eligibility cards tied to official sources", () => {
    for (const company of COMPANIES) {
      if (!company.eligibility) continue

      const source = sourceById(company.eligibility.sourceId)
      expect(source, `${company.id} eligibility has unknown source`).toBeTruthy()
      expect(source?.kind, `${company.id} eligibility must cite an official source`).toBe("official")
      expect(company.eligibility.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it("keeps IDs unique across scalable content banks", () => {
    expectUniqueIds(ALL_PYQS.map((q) => q.id), "ALL_PYQS")
    expectUniqueIds(INTERVIEW_QUESTIONS.map((q) => q.id), "INTERVIEW_QUESTIONS")
    expectUniqueIds(ALL_CODING_PROBLEMS.map((p) => p.id), "CODING_PROBLEMS")
    expectUniqueIds(MOCK_TESTS.map((m) => m.id), "MOCK_TESTS")
  })

  it("sources every seeded lesson and chapter quiz question", () => {
    for (const company of COMPANIES) {
      for (const section of getSections(company.id)) {
        for (const chapter of section.chapters) {
          const quizMin = 150
          expect(chapter.quiz.length, `${company.id}/${chapter.id} needs a larger quiz`).toBeGreaterThanOrEqual(quizMin)
          for (const difficulty of ["easy", "medium", "hard"] as const) {
            expect(
              chapter.quiz.filter((question) => question.difficulty === difficulty).length,
              `${company.id}/${chapter.id} needs enough ${difficulty} questions for lesson-wise practice`,
            ).toBeGreaterThanOrEqual(chapter.lessons.length)
          }
          expectUniqueIds(chapter.quiz.map((question) => question.id), `${company.id}/${chapter.id} quiz IDs`)
          expect(
            new Set(chapter.quiz.map((question) => question.prompt.trim().toLowerCase())).size,
            `${company.id}/${chapter.id} contains duplicate quiz prompts`,
          ).toBe(chapter.quiz.length)
          for (const lesson of chapter.lessons) {
            expect(lesson.sourceIds?.length, `${lesson.id} is missing sourceIds`).toBeGreaterThan(0)
            for (const sourceId of lesson.sourceIds ?? []) {
              expectKnownSource(sourceId, `lesson ${lesson.id}`)
            }
          }

          for (const question of chapter.quiz) {
            expectGovernedQuestion(question, `chapter quiz ${chapter.id}`)
          }
        }
      }
    }
  }, 180_000)

  it("sources every PYQ reconstruction and interview question", () => {
    for (const pyq of ALL_PYQS) {
      expectGovernedQuestion(pyq, `pyq ${pyq.company}`)
    }

    for (const question of INTERVIEW_QUESTIONS) {
      expectKnownSource(question.sourceId, `interview question ${question.id}`)
      expect(question.guidance.trim().length, `${question.id} guidance is empty`).toBeGreaterThan(0)
    }
  }, 60_000)

  it("keeps every company PYQ bank at serious starter scale", () => {
    for (const company of COMPANIES) {
      const min = company.id === "zoho" ? 560 : company.id === "general" ? 580 : 450
      expect(pyqsForCompany(company.id).length, `${company.id} needs more PYQs`).toBeGreaterThanOrEqual(min)
      expect(
        pyqsForCompany(company.id).filter((question) => question.difficulty === "hard").length,
        `${company.id} needs a meaningful hard-question layer`,
      ).toBeGreaterThanOrEqual(company.id === "zoho" ? 90 : 60)
    }
    expect(PYQS.length, "curated PYQ starter bank should remain present").toBeGreaterThan(100)
  })

  it("validates full-scale coding and mock content", () => {
    for (const problem of ALL_CODING_PROBLEMS) {
      expectKnownSource(problem.sourceId, `coding problem ${problem.id}`)
      expect(problem.prompt.trim().length).toBeGreaterThan(0)
      expect(problem.editorial.trim().length).toBeGreaterThan(0)
      expect(problem.testCases.length, `${problem.id} needs visible and hidden tests`).toBeGreaterThanOrEqual(4)
      expect(problem.testCases.some((tc) => !tc.hidden), `${problem.id} needs visible tests`).toBe(true)
      expect(problem.testCases.some((tc) => tc.hidden), `${problem.id} needs hidden tests`).toBe(true)
      expect(problem.estimatedMinutes).toBeGreaterThan(0)
      expect(problem.status).toMatch(/^(draft|reviewed|live|needs_revision)$/)
    }

    for (const mock of MOCK_TESTS) {
      expectKnownSource(mock.sourceId, `mock ${mock.id}`)
      expect(mock.sections.length).toBeGreaterThan(0)
      expect(mock.cutoffPercent).toBeGreaterThan(0)
      const expectedCount = mock.sections.reduce((sum, section) => sum + section.questionCount, 0)
      expect(buildMockQuestions(mock).length, `${mock.id} did not build expected question count`).toBe(expectedCount)
    }

    for (const company of COMPANIES) {
      const mocks = MOCK_TESTS.filter((mock) => mock.companyId === company.id)
      expect(mocks.length, `${company.id} should have ${MOCKS_PER_COMPANY} mock tests`).toBe(MOCKS_PER_COMPANY)
      expect(new Set(mocks.map((mock) => mock.id)).size, `${company.id} mock IDs should be unique`).toBe(MOCKS_PER_COMPANY)
    }
  })

  it("keeps company coding and interview banks at recruiter-useful scale", () => {
    for (const company of COMPANIES) {
      const codingMin = company.id === "zoho" ? 70 : company.id === "general" ? 25 : 40
      expect(codingProblemsForCompany(company.id).length, `${company.id} needs more coding practice`).toBeGreaterThanOrEqual(codingMin)

      const commPyqs = pyqsForCompany(company.id).filter((q) => q.section === "comm-interview")
      expect(commPyqs.length, `${company.id} needs communication/interview PYQs`).toBeGreaterThanOrEqual(70)
      expect(
        commPyqs.filter((q) => q.difficulty === "hard").length,
        `${company.id} needs harder communication/interview scenarios`,
      ).toBeGreaterThanOrEqual(10)

      const interviewQuestions = INTERVIEW_QUESTIONS.filter((q) => q.company === company.id)
      const interviewMin = company.id === "zoho" || company.id === "general" ? 100 : 90
      expect(interviewQuestions.length, `${company.id} needs more interview questions`).toBeGreaterThanOrEqual(interviewMin)
      expect(new Set(interviewQuestions.map((q) => q.category)).size, `${company.id} should cover all interview categories`).toBeGreaterThanOrEqual(5)
    }
  })

  it("marks hand-authored content as curated and generated volume as not", () => {
    // The hand-authored PYQ starter bank is the curated/flagship layer.
    for (const pyq of PYQS) {
      expect(pyq.curated, `pyq ${pyq.id} should be marked curated`).toBe(true)
    }
    // The programmatically expanded PYQs are generated volume — not curated, so
    // we never pass auto-generated questions off as expert-written.
    for (const pyq of EXPANDED_PYQS) {
      expect(pyq.curated, `expanded pyq ${pyq.id} must not be curated`).toBeFalsy()
    }
    // ALL_PYQS is therefore a genuine mix of both layers.
    expect(ALL_PYQS.some((q) => q.curated)).toBe(true)
    expect(ALL_PYQS.some((q) => !q.curated)).toBe(true)

    // Chapter quizzes are a genuine mix: a hand-authored curated core plus
    // programmatically generated padding (supp-* templated practice). Every
    // non-curated question must be recognizably generated, and each chapter
    // must keep a real curated core — we never inflate the curated count with
    // generated volume.
    for (const section of getSections("general")) {
      for (const chapter of section.chapters) {
        const curated = chapter.quiz.filter((q) => q.curated)
        expect(curated.length, `chapter ${chapter.id} should have a curated core`).toBeGreaterThan(0)
        for (const question of chapter.quiz) {
          if (question.curated) continue
          expect(
            question.id.startsWith("supp-") || question.id.startsWith("boost-q-"),
            `uncurated chapter question ${question.id} must be recognizably generated`,
          ).toBe(true)
        }
      }
    }
    // Parametric drill volume must NOT claim to be curated.
    const drills = generateDrills("mixed", 60, 20260617)
    for (const drill of drills) {
      expect(drill.curated, `generated drill ${drill.id} must not be curated`).toBeFalsy()
    }
  }, 60_000)

  it("holds the flagship bank to its deeper authoring contract", () => {
    expect(FLAGSHIP_PYQS.length, "flagship bank should not be empty").toBeGreaterThan(0)
    for (const q of FLAGSHIP_PYQS) {
      expectGovernedQuestion(q, `flagship ${q.topic}`)
      expect(q.curated, `flagship ${q.id} must be curated`).toBe(true)
      // The defining feature: a rationale for every option, parallel to options.
      expect(q.optionNotes, `flagship ${q.id} must have optionNotes`).toBeTruthy()
      expect(
        q.optionNotes?.length,
        `flagship ${q.id} optionNotes must be parallel to options`,
      ).toBe(q.options.length)
      for (const note of q.optionNotes ?? []) {
        expect(note.trim().length, `flagship ${q.id} has an empty option note`).toBeGreaterThan(0)
      }
      expect(q.answer, `flagship ${q.id} answer index out of range`).toBeGreaterThanOrEqual(0)
      expect(q.answer).toBeLessThan(q.options.length)
    }
    // Flagship questions flow into the served bank and stay marked curated.
    expect(ALL_PYQS.filter((q) => q.optionNotes?.length).length).toBe(FLAGSHIP_PYQS.length)
  })

  it("builds a unique 300-question practice bank for every foundation chapter", () => {
    for (const section of getSections("general")) {
      for (const chapter of section.chapters) {
        const questions = chapterPracticeQuestions("general", section.id, chapter.id)
        expect(
          questions.length,
          `general/${chapter.id} needs ${CHAPTER_PRACTICE_TARGET} chapter practice questions`,
        ).toBe(CHAPTER_PRACTICE_TARGET)
        expectUniqueIds(questions.map((q) => q.id), `general/${chapter.id} practice IDs`)
        expect(
          new Set(questions.map((q) => q.prompt.trim().toLowerCase())).size,
          `general/${chapter.id} practice contains duplicate prompts`,
        ).toBe(questions.length)
      }
    }
  }, 300_000)
})

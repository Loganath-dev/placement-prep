import { describe, expect, it } from "vitest"
import { codingFeedback, solveSignature, studentHint } from "@/lib/domain/coding-practice"
import type { CodingProblem } from "@/lib/types"

const problem: CodingProblem = {
  id: "problem-test",
  companyId: "general",
  title: "Array Sum",
  level: "beginner",
  difficulty: "easy",
  topics: ["arrays"],
  prompt: "Given numbers, return sum.",
  inputFormat: "First line n. Second line has n integers.",
  outputFormat: "Print sum.",
  constraints: ["1 <= n <= 10"],
  solution: "function solve(arr) {\n  return 0\n}",
  testCases: [],
  editorial: "Loop once.",
  estimatedMinutes: 10,
  sourceId: "studybench-curriculum",
  originalStatus: "original",
  status: "reviewed",
  reviewedBy: "StudyBench SME Review",
  lastReviewed: "2026-06-07",
}

describe("coding practice domain", () => {
  it("extracts solve signatures and student hints", () => {
    expect(solveSignature(problem)).toBe("Use: function solve(arr) { ... return answer }")
    expect(studentHint(problem)).toContain("only the count")
  })

  it("returns feedback from runner results", () => {
    expect(
      codingFeedback([{ index: 0, status: "passed", input: "1", expected: "1", actual: "1" }], "general"),
    ).toContain("Samples are passing")
    expect(
      codingFeedback([{ index: 0, status: "timeout", input: "1", expected: "1" }], "general"),
    ).toContain("taking too long")
  })
})

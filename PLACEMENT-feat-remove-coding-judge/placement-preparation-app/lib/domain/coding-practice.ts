import type { CodingProblem, CompanyId } from "@/lib/types"

export type CodingRunResult = {
  index: number
  status: "passed" | "failed" | "error" | "timeout"
  input: string
  expected: string
  actual?: string
  error?: string
}

export function codingFeedback(results: CodingRunResult[], companyId: CompanyId): string {
  const passed = results.filter((result) => result.status === "passed").length
  if (passed === results.length) {
    return companyId === "zoho"
      ? "Good. Now try one extra case yourself before reading the explanation, because Zoho-style rounds often test corner cases."
      : "Good. Samples are passing. Now check one edge case and explain your time complexity in one sentence."
  }
  const firstProblem = results.find((result) => result.status !== "passed")
  if (firstProblem?.status === "timeout") {
    return "Your code is taking too long. Look for an infinite loop or a nested loop that can be replaced with a single pass."
  }
  if (firstProblem?.status === "error") {
    return "Fix the runtime error first. Check spelling, missing return statements, undefined variables and array indexes."
  }
  return "Compare expected and actual output. Most sample failures come from extra spaces, missing returns, or not handling the first/last element."
}

export function solveSignature(problem: CodingProblem): string {
  const match = problem.solution.match(/function\s+solve\s*\(([^)]*)\)/)
  const params = match?.[1]?.trim()
  return `Use: function solve(${params ?? "input"}) { ... return answer }`
}

export function studentHint(problem: CodingProblem): string {
  const text = `${problem.inputFormat} ${problem.prompt}`.toLowerCase()
  if (text.includes("first line n k")) {
    return "The first number is the array size and k is the target or rotation value. The runner sends the second line as arr and k as the second argument."
  }
  if (text.includes("first line n. next n lines")) {
    return "The first line tells the matrix size. The runner sends only the matrix to solve, so you can use matrix.length for n."
  }
  if (text.includes("first line r c")) {
    return "The first line tells rows and columns. The runner sends the remaining rows as a 2D matrix."
  }
  if (text.includes("first line n. second line")) {
    return "The first line is only the count. The runner sends the numbers from the second line as an array."
  }
  if (text.includes("two lines")) {
    return "Each input line becomes one function argument, so solve(a, b) receives the first and second strings."
  }
  if (text.includes("four integers")) {
    return "The four values are passed separately to solve(a, b, c, d)."
  }
  if (text.includes("one line of text")) {
    return "The complete line is passed as a string. Trim spaces only when your logic needs it."
  }
  if (text.includes("single integer") || text.includes("one integer")) {
    return "The value is passed as a number, so you can compare it or use arithmetic directly."
  }
  return "Read the sample input first, decide what each value means, then return the final answer from solve."
}

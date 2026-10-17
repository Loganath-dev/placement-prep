import { describe, expect, it } from "vitest"
import {
  badInterviewAnswer,
  interviewFollowUps,
  shortInterviewAnswer,
} from "@/lib/domain/interview-coaching"
import type { InterviewQuestion } from "@/lib/types"

const baseQuestion: InterviewQuestion = {
  id: "interview-test",
  company: "general",
  category: "coding",
  question: "Explain edge cases.",
  guidance: "Explain calmly.",
  difficulty: "medium",
  tags: ["edge-cases"],
}

describe("interview coaching domain", () => {
  it("returns coding-specific coaching", () => {
    expect(shortInterviewAnswer(baseQuestion)).toContain("clarify the input")
    expect(badInterviewAnswer(baseQuestion)).toContain("silently write code")
    expect(interviewFollowUps(baseQuestion)).toContain("What is the time complexity?")
  })

  it("returns HR-specific coaching", () => {
    const question = { ...baseQuestion, category: "hr" as const }

    expect(shortInterviewAnswer(question)).toContain("one real example")
    expect(badInterviewAnswer(question)).toContain("memorised answer")
    expect(interviewFollowUps(question)).toContain("What did you learn from it?")
  })
})

import type { InterviewCategory, InterviewQuestion } from "@/lib/types"

export const INTERVIEW_CATEGORY_LABEL: Record<InterviewCategory, string> = {
  technical: "Technical",
  coding: "Coding",
  domain: "Company / Domain",
  hr: "HR",
  managerial: "Managerial",
}

export function shortInterviewAnswer(question: InterviewQuestion): string {
  if (question.category === "coding") {
    return "I will clarify the input, mention the simple idea, improve it if needed, dry-run one sample, then code with edge cases in mind."
  }
  if (question.category === "hr") {
    return "I will answer with one real example, what I personally did, and what I learned from it."
  }
  if (question.category === "domain") {
    return "I will connect what I know about the company to my skills, projects and first-job goals."
  }
  if (question.category === "managerial") {
    return "I will clarify the goal, break the work into steps, communicate early and take ownership."
  }
  return "I will define the concept simply, give one example, and mention a practical use or trade-off."
}

export function badInterviewAnswer(question: InterviewQuestion): string {
  if (question.category === "coding") return "Do not silently write code without explaining edge cases or complexity."
  if (question.category === "hr") return "Do not give a perfect-sounding memorised answer with no real incident."
  if (question.category === "domain") return "Do not say only that the company is good, famous or gives salary."
  if (question.category === "managerial") return "Do not blame teammates or say you will handle everything alone."
  return "Do not recite only textbook lines without showing where the concept is used."
}

export function interviewFollowUps(question: InterviewQuestion): string[] {
  if (question.category === "coding") {
    return ["What is the time complexity?", "Which edge case can break this?", "Can you optimize it?"]
  }
  if (question.category === "hr") {
    return ["What did you learn from it?", "What would you do differently?", "Can you give a real example?"]
  }
  if (question.category === "domain") {
    return ["What do you know about our process?", "Which role interests you?", "Why this company over others?"]
  }
  if (question.category === "managerial") {
    return ["How will you update your lead?", "What if the deadline changes?", "How will you handle conflict?"]
  }
  return ["Can you give an example?", "Where did you use this?", "What is the trade-off?"]
}

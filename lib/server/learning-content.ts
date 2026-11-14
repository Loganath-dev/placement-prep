import type { Chapter, Difficulty, Question, SectionId } from "@/lib/types"
import { chapterPracticeQuestions } from "@/lib/data/content"
import { LESSON_PRACTICE_TARGET } from "@/lib/learning-progress"

const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard"]

/**
 * Build lesson practice only from questions explicitly attached to this chapter.
 * We intentionally do not pad thin chapters with unrelated section-wide drills:
 * a smaller accurate set is better than falsely-labelled practice.
 */
export function buildLessonPracticeSets(
  chapter: Chapter,
  companyId: string,
  sectionId: SectionId,
): Question[][] {
  const lessonCount = chapter.lessons.length
  if (!lessonCount) return []

  const sql = chapter.pathKind === "sql-dbms"
  const chapterBank = sql
    ? chapterPracticeQuestions("general", "coding", chapter.id)
    : []

  const seenIds = new Set<string>()
  const seenPrompts = new Set<string>()
  const uniqueQuestions: Question[] = []

  for (const question of [...chapter.quiz, ...chapterBank]) {
    const promptKey = question.prompt.trim().toLowerCase().replace(/\s+/g, " ")
    if (seenIds.has(question.id) || seenPrompts.has(promptKey)) continue
    seenIds.add(question.id)
    seenPrompts.add(promptKey)
    uniqueQuestions.push(question)
  }

  const normalizeTerms = (value: string) => new Set(
    value.toLowerCase().replace(/[^a-z0-9+#.]/g, " ").split(/\s+/)
      .filter((term) => term.length >= 4 && !new Set(["this", "that", "with", "from", "what", "when", "where", "which", "their", "there", "about", "into", "then", "than", "have", "will", "your", "does", "using", "used", "each", "more", "most", "some", "such", "only", "also", "lesson", "topic", "question", "practice"]).has(term)),
  )
  const lessonTerms = chapter.lessons.map((lesson) => normalizeTerms(`${lesson.title} ${lesson.body}`))
  const sets: Question[][] = Array.from({ length: lessonCount }, () => [])

  for (const question of uniqueQuestions) {
    let targetIndex = question.lessonId
      ? chapter.lessons.findIndex((lesson) => lesson.id === question.lessonId)
      : -1
    if (targetIndex < 0) {
      const questionTerms = normalizeTerms([
        question.topic,
        ...(question.topicTags ?? []),
        question.prompt,
        question.explanation,
      ].join(" "))
      let bestScore = 0
      lessonTerms.forEach((terms, index) => {
        let score = 0
        for (const term of terms) if (questionTerms.has(term)) score += 1
        const topicTerms = normalizeTerms([question.topic, ...(question.topicTags ?? [])].join(" "))
        for (const term of terms) if (topicTerms.has(term)) score += 3
        if (score > bestScore) {
          bestScore = score
          targetIndex = index
        }
      })
      // Require a meaningful topic/tag match. A word appearing only in a long
      // prompt or explanation is not sufficient evidence that the question
      // belongs to this lesson.
      if (bestScore < 3) targetIndex = -1
    }
    if (targetIndex >= 0) {
      sets[targetIndex].push(question)
    }
  }

  // Never borrow a question from another lesson merely to fill a checkpoint.
  // If the topic cannot be mapped confidently, leave it unassigned and surface
  // the content gap to the learner/content team rather than mislabel the item.

  // Keep a predictable easy -> medium -> hard progression in each lesson.
  const rank = new Map(DIFFICULTY_ORDER.map((difficulty, index) => [difficulty, index]))
  for (const set of sets) set.sort((a, b) => (rank.get(a.difficulty) ?? 0) - (rank.get(b.difficulty) ?? 0))

  // A lesson checkpoint is deliberately capped at 20 questions. Keep the
  // authored bank intact for chapter assessments, PYQs and mock tests.
  return sets.map((set) => set.slice(0, LESSON_PRACTICE_TARGET))
}

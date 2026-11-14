/** Shared mastery rules for lesson checkpoints and review targets. */
export const LESSON_PASS_THRESHOLD = 60
export const LESSON_PRACTICE_TARGET = 20

export function isLessonPassed(score: number): boolean {
  return Number.isFinite(score) && score >= LESSON_PASS_THRESHOLD
}

export function updatePassedLessonIds(existing: readonly string[], lessonId: string, score: number): string[] {
  if (!isLessonPassed(score)) return [...existing]
  return [...new Set([...existing, lessonId])]
}

/** Recover checkpoint passes from older saved attempts created before passedLessonIds existed. */
export function getPassedLessonIds(learning?: {
  passedLessonIds?: string[]
  practiceAttempts?: Array<{ lessonId?: string; score: number }>
}): Set<string> {
  const passed = new Set(learning?.passedLessonIds ?? [])
  for (const attempt of learning?.practiceAttempts ?? []) {
    if (attempt.lessonId && isLessonPassed(attempt.score)) passed.add(attempt.lessonId)
  }
  return passed
}

/** Return practice sets only for lessons this learner has explicitly passed. */
export function onlyCompletedLessonSets<TLesson extends { id: string }, TQuestion>(
  lessons: readonly TLesson[],
  questionSets: readonly (readonly TQuestion[])[],
  passedLessonIds: ReadonlySet<string>,
): Array<{ lesson: TLesson; questions: TQuestion[] }> {
  return lessons.flatMap((lesson, index) => {
    if (!passedLessonIds.has(lesson.id)) return []
    const questions = questionSets[index] ?? []
    return questions.length ? [{ lesson, questions: [...questions] }] : []
  })
}

/**
 * Resume only at or before the first card not yet verified by the server.
 * A stale local resume pointer must never skip an incomplete card.
 */
export function getSafeLearningCardIndex(
  requestedIndex: number,
  firstUnfinishedIndex: number,
  cardCount: number,
): number {
  if (cardCount <= 0) return 0
  const lastIndex = cardCount - 1
  const allowedLastIndex = firstUnfinishedIndex >= 0
    ? Math.min(firstUnfinishedIndex, lastIndex)
    : lastIndex
  const normalized = Number.isFinite(requestedIndex) ? Math.trunc(requestedIndex) : 0
  return Math.min(Math.max(normalized, 0), allowedLastIndex)
}

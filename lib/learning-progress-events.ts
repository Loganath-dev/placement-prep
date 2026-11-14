export type ProgressEvent = {
  id: string
  company_id: string
  section_id: string
  chapter_id: string
  lesson_id: string | null
  event_type: string
  selected_answers: Record<string, unknown> | null
  score_percent: number | null
  passed: boolean | null
  created_at: string
}

export function deriveVerifiedProgress(events: ProgressEvent[]) {
  const completedCardIdsByChapter = new Map<string, Set<string>>()
  const passedLessonIdsByChapter = new Map<string, Set<string>>()
  const recalledChapterIds = new Set<string>()
  const passedChapterIds = new Set<string>()
  const latestLessonScores = new Map<string, number>()

  for (const event of events) {
    if (event.event_type === "lesson_card_completed") {
      const cardId = typeof event.selected_answers?.cardId === "string" ? event.selected_answers.cardId : null
      if (cardId) {
        const set = completedCardIdsByChapter.get(event.chapter_id) ?? new Set<string>()
        set.add(cardId)
        completedCardIdsByChapter.set(event.chapter_id, set)
      }
    }
    if (event.event_type === "lesson_practice_submitted" && event.lesson_id && event.score_percent !== null) {
      const key = `${event.chapter_id}:${event.lesson_id}`
      latestLessonScores.set(key, Math.max(latestLessonScores.get(key) ?? 0, event.score_percent))
      if (event.passed) {
        const set = passedLessonIdsByChapter.get(event.chapter_id) ?? new Set<string>()
        set.add(event.lesson_id)
        passedLessonIdsByChapter.set(event.chapter_id, set)
      }
    }
    if (event.event_type === "chapter_recall_completed" && event.passed === true) recalledChapterIds.add(event.chapter_id)
    if (event.event_type === "chapter_assessment_submitted" && event.passed === true) passedChapterIds.add(event.chapter_id)
  }

  return { events, completedCardIdsByChapter, passedLessonIdsByChapter, recalledChapterIds, passedChapterIds, latestLessonScores }
}


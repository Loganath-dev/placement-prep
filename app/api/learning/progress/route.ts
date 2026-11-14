import { NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"
import { hasTrustedRequestOrigin } from "@/lib/security/request-origin"
import { readJsonBody } from "@/lib/security/read-json-body"
import { readEntitlement } from "@/lib/premium-guard"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getSection, chapterPracticeQuestions } from "@/lib/data/content"
import { getSections } from "@/lib/data/content-catalog"
import { buildChapterLearningDeck, buildChapterRecallDeck } from "@/lib/learning-cards"
import { buildLessonPracticeSets } from "@/lib/server/learning-content"
import { readVerifiedProgress } from "@/lib/server/verified-progress"
import { ensureLearningRewards } from "@/lib/server/learning-rewards"
import { FREE_CHAPTER_PRACTICE_LIMIT, FREE_LESSONS_PER_PATH, canAccessLearningChapter } from "@/lib/access"
import { LESSON_PASS_THRESHOLD } from "@/lib/learning-progress"
import type { CompanyId, SectionId, Question } from "@/lib/types"

export const runtime = "nodejs"

const noStore = { "Cache-Control": "private, no-store, max-age=0" }
const jsonError = (error: string, status: number) => NextResponse.json({ error }, { status, headers: noStore })

export async function POST(request: Request) {
  if (!hasTrustedRequestOrigin(request)) return jsonError("Cross-origin request rejected.", 403)
  let entitlement: Awaited<ReturnType<typeof readEntitlement>>
  try {
    entitlement = await readEntitlement()
  } catch {
    return NextResponse.json(
      { error: "We could not verify your subscription. Please retry shortly." },
      { status: 503, headers: { "Cache-Control": "private, no-store", "Retry-After": "5" } },
    )
  }
  if (!entitlement) return jsonError("Sign in to save learning progress.", 401)
  try {
    const limit = await rateLimit(`learning-progress:${entitlement.userId}`, 30, 10 * 60 * 1000)
    if (!limit.allowed) return NextResponse.json({ error: "Too many learning submissions. Please wait and retry." }, { status: 429, headers: { ...noStore, "Retry-After": "60" } })
  } catch {
    return NextResponse.json({ error: "Learning service is temporarily unavailable. Please retry shortly." }, { status: 503, headers: { ...noStore, "Retry-After": "10" } })
  }
  const body = await readJsonBody<Record<string, unknown>>(request, 32 * 1024)
  if (!body) return jsonError("Invalid or oversized request body.", 400)
  const companyId = body.companyId as CompanyId
  const sectionId = body.sectionId as SectionId
  const chapterId = typeof body.chapterId === "string" ? body.chapterId : ""
  const eventType = body.eventType
  const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey : ""
  if (!companyId || !sectionId || !chapterId || !/^[0-9a-f-]{36}$/i.test(idempotencyKey)) return jsonError("Missing or invalid learning identifiers.", 400)

  const section = getSection(companyId, sectionId)
  const chapter = section?.chapters.find((item) => item.id === chapterId)
  if (!section || !chapter || sectionId === "comm-interview" || (sectionId === "coding" && companyId !== "general")) return jsonError("Learning chapter not found.", 404)

  const sections = getSections(companyId)
  const sectionIndex = sections.findIndex((item) => item.id === sectionId)
  const pathChapters = section.chapters.filter((item) => (item.pathId ?? section.id) === (chapter.pathId ?? section.id))
  const pathIndex = pathChapters.findIndex((item) => item.id === chapterId)
  const chapterIndex = section.chapters.findIndex((item) => item.id === chapterId)
  if (!canAccessLearningChapter(sectionIndex, chapterIndex, entitlement.premium, pathIndex)) return jsonError("Premium access is required for this chapter.", 402)

  const lessons = entitlement.premium ? chapter.lessons : chapter.lessons.slice(0, FREE_LESSONS_PER_PATH)
  const lessonId = typeof body.lessonId === "string" ? body.lessonId : null
  if (lessonId && !lessons.some((lesson) => lesson.id === lessonId)) return jsonError("This lesson requires Premium access.", 402)

  let progress
  try { progress = await readVerifiedProgress(entitlement.userId, companyId) } catch { return jsonError("Could not verify your learning history.", 500) }
  const previousChapter = pathIndex > 0 ? pathChapters[pathIndex - 1] : null
  if (previousChapter && !progress.passedChapterIds.has(previousChapter.id)) return jsonError("Pass the previous chapter using a verified assessment first.", 403)

  const lessonIndex = lessonId ? lessons.findIndex((lesson) => lesson.id === lessonId) : -1
  if (lessonIndex > 0 && !lessons.slice(0, lessonIndex).every((lesson) => progress.passedLessonIdsByChapter.get(chapterId)?.has(lesson.id))) {
    return jsonError("Pass the previous lesson checkpoint first.", 403)
  }

  let event: Record<string, unknown> | null = null
  if (eventType === "lesson_card_completed") {
    if (!lessonId || typeof body.cardId !== "string") return jsonError("A lesson and card are required.", 400)
    const deck = buildChapterLearningDeck(chapter, lessons)
    const lessonDeck = deck.filter((item) => item.lessonId === lessonId)
    const cardIndex = lessonDeck.findIndex((item) => item.id === body.cardId)
    if (cardIndex < 0) return jsonError("Unknown learning card.", 400)
    const completed = progress.completedCardIdsByChapter.get(chapterId) ?? new Set<string>()
    if (!lessonDeck.slice(0, cardIndex).every((item) => completed.has(item.id))) return jsonError("Complete lesson cards in their learning order.", 409)
    event = { event_type: eventType, lesson_id: lessonId, selected_answers: { cardId: lessonDeck[cardIndex].id }, passed: true }
  } else if (eventType === "chapter_recall_completed") {
    const recallDeck = buildChapterRecallDeck(chapter, lessons)
    const submitted = Array.isArray(body.cardIds) ? body.cardIds.filter((value): value is string => typeof value === "string") : []
    const required = recallDeck.length ? recallDeck.map((card) => card.id) : [`recall-${chapter.id}-summary`]
    if (submitted.length !== required.length || new Set(submitted).size !== required.length || !required.every((id) => submitted.includes(id))) return jsonError("Complete every official Chapter Recall card first.", 400)
    if (!lessons.every((lesson) => progress.passedLessonIdsByChapter.get(chapterId)?.has(lesson.id))) return jsonError("Pass every lesson checkpoint before Chapter Recall.", 423)
    event = { event_type: eventType, selected_answers: { cardIds: required }, passed: true }
  } else if (eventType === "lesson_practice_submitted" || eventType === "chapter_assessment_submitted") {
    const isLesson = eventType === "lesson_practice_submitted"
    if (isLesson && !lessonId) return jsonError("A lesson is required.", 400)
    if (!Array.isArray(body.answers)) return jsonError("Answer submissions are required.", 400)
    const allChapterQuestions = chapter.pathKind === "sql-dbms"
      ? chapterPracticeQuestions("general", "coding", chapterId)
      : chapter.quiz
    const difficultyRank = { easy: 0, medium: 1, hard: 2 } as const
    const orderedChapterQuestions = [...allChapterQuestions].sort((a, b) => difficultyRank[a.difficulty] - difficultyRank[b.difficulty])
    const visibleChapterQuestions = !entitlement.premium && (chapter.pathKind === "language" || chapter.pathKind === "sql-dbms")
      ? orderedChapterQuestions.filter((question) => question.difficulty !== "hard")
      : orderedChapterQuestions
    const questionSet: Question[] = isLesson
      ? (buildLessonPracticeSets(chapter, companyId, sectionId)[lessonIndex] ?? [])
      : entitlement.premium ? visibleChapterQuestions : visibleChapterQuestions.slice(0, FREE_CHAPTER_PRACTICE_LIMIT)
    if (!isLesson) {
      if (!lessons.every((lesson) => progress.passedLessonIdsByChapter.get(chapterId)?.has(lesson.id))) return jsonError("Pass every lesson checkpoint first.", 423)
    } else {
      const requiredCards = buildChapterLearningDeck(chapter, lessons).filter((card) => card.lessonId === lessonId).map((card) => card.id)
      const completed = progress.completedCardIdsByChapter.get(chapterId) ?? new Set<string>()
      if (!requiredCards.length || !requiredCards.every((id) => completed.has(id))) return jsonError("Complete every learning card in this lesson first.", 423)
      if (progress.passedLessonIdsByChapter.get(chapterId)?.has(lessonId!)) return jsonError("This lesson is already passed.", 409)
    }
    const answers = body.answers as Array<{ questionId?: unknown; selected?: unknown; responseText?: unknown }>
    if (answers.length !== questionSet.length || answers.length === 0) return jsonError("Submit every question in this checkpoint.", 400)
    const byId = new Map(questionSet.map((question) => [question.id, question]))
    const seen = new Set<string>()
    let correct = 0
    const canonicalAnswers: Record<string, unknown> = {}
    for (const answer of answers) {
      if (typeof answer.questionId !== "string" || seen.has(answer.questionId)) return jsonError("Invalid or duplicate question answer.", 400)
      const question = byId.get(answer.questionId)
      if (!question) return jsonError("A submitted question does not belong to this checkpoint.", 400)
      seen.add(question.id)
      let isCorrect = false
      if (question.type === "fill_blank") {
        if (typeof answer.responseText !== "string" || answer.responseText.length > 500) return jsonError("Invalid typed answer.", 400)
        const normalized = answer.responseText.trim().toLocaleLowerCase().replace(/\s+/g, " ")
        isCorrect = (question.acceptedAnswers ?? []).some((accepted) => accepted.trim().toLocaleLowerCase().replace(/\s+/g, " ") === normalized)
        canonicalAnswers[question.id] = { responseText: answer.responseText.trim() }
      } else {
        if (typeof answer.selected !== "number" || !Number.isInteger(answer.selected) || answer.selected < 0 || answer.selected >= question.options.length) return jsonError("Invalid selected option.", 400)
        isCorrect = answer.selected === question.answer
        canonicalAnswers[question.id] = { selected: answer.selected }
      }
      if (isCorrect) correct++
    }
    const score = Math.round((correct / questionSet.length) * 100)
    const passed = score >= (isLesson ? LESSON_PASS_THRESHOLD : 70)
    event = { event_type: eventType, lesson_id: isLesson ? lessonId : null, question_ids: questionSet.map((question) => question.id), selected_answers: canonicalAnswers, score_percent: score, passed }
  } else {
    return jsonError("Unsupported learning event.", 400)
  }

  const server = await createServerClient()
  const { data: { user } } = await server.auth.getUser()
  if (!user || user.id !== entitlement.userId) return jsonError("Your session changed. Sign in again.", 401)
  const admin = createAdminClient()
  const { data: existing, error: existingError } = await admin.from("learning_progress_events").select("id,event_type,company_id,section_id,chapter_id,lesson_id,score_percent,passed").eq("user_id", entitlement.userId).eq("idempotency_key", idempotencyKey).maybeSingle()
  if (existingError) return jsonError("Could not verify the previous submission. Please retry.", 503)
  if (existing) {
    if (existing.event_type !== event.event_type || existing.company_id !== companyId || existing.section_id !== sectionId || existing.chapter_id !== chapterId || existing.lesson_id !== (event.lesson_id ?? null)) return jsonError("Idempotency key was already used for another action.", 409)
    let rewards: { xp: number; badges: string[] }
    try { rewards = await ensureLearningRewards(entitlement.userId, existing.id) } catch { return jsonError("Your result is saved, but rewards could not be refreshed yet.", 503) }
    return NextResponse.json({ ok: true, duplicate: true, score: existing.score_percent, passed: existing.passed, rewards }, { headers: noStore })
  }
  const { data: inserted, error } = await admin.from("learning_progress_events").insert({
    user_id: entitlement.userId,
    company_id: companyId,
    section_id: sectionId,
    chapter_id: chapterId,
    idempotency_key: idempotencyKey,
    ...event,
  }).select("id").single()
  if (error?.code === "23505") {
    const { data: saved, error: savedError } = await admin.from("learning_progress_events")
      .select("id,event_type,company_id,section_id,chapter_id,lesson_id,score_percent,passed")
      .eq("user_id", entitlement.userId).eq("idempotency_key", idempotencyKey).maybeSingle()
    if (savedError) return jsonError("The submission may have been saved, but its status could not be confirmed. Retry safely.", 503)
    let duplicateEvent = saved
    if (!duplicateEvent && event.event_type === "lesson_card_completed") {
      const cardId = (event.selected_answers as { cardId?: string }).cardId
      const fallback = await admin.from("learning_progress_events").select("id,event_type,company_id,section_id,chapter_id,lesson_id,score_percent,passed")
        .eq("user_id", entitlement.userId).eq("company_id", companyId).eq("chapter_id", chapterId)
        .eq("event_type", event.event_type).contains("selected_answers", { cardId }).maybeSingle()
      if (fallback.error) return jsonError("Could not confirm the previous card completion.", 503)
      duplicateEvent = fallback.data
    } else if (!duplicateEvent && event.event_type === "chapter_recall_completed") {
      const fallback = await admin.from("learning_progress_events").select("id,event_type,company_id,section_id,chapter_id,lesson_id,score_percent,passed")
        .eq("user_id", entitlement.userId).eq("company_id", companyId).eq("chapter_id", chapterId)
        .eq("event_type", event.event_type).maybeSingle()
      if (fallback.error) return jsonError("Could not confirm the previous recall completion.", 503)
      duplicateEvent = fallback.data
    }
    if (!duplicateEvent || duplicateEvent.event_type !== event.event_type || duplicateEvent.company_id !== companyId || duplicateEvent.section_id !== sectionId || duplicateEvent.chapter_id !== chapterId || duplicateEvent.lesson_id !== (event.lesson_id ?? null)) return jsonError("This action conflicts with an existing submission.", 409)
    let rewards: { xp: number; badges: string[] }
    try { rewards = await ensureLearningRewards(entitlement.userId, duplicateEvent.id) } catch { return jsonError("Your result is saved, but rewards could not be refreshed yet.", 503) }
    return NextResponse.json({ ok: true, duplicate: true, score: duplicateEvent.score_percent, passed: duplicateEvent.passed, rewards }, { headers: noStore })
  }
  if (error) return jsonError("Could not save verified learning progress. Please retry.", 500)

  const score = typeof event.score_percent === "number" ? event.score_percent : null
  if (!inserted) return jsonError("Progress was saved, but its reward source could not be confirmed.", 503)
  let rewards: { xp: number; badges: string[] }
  try { rewards = await ensureLearningRewards(entitlement.userId, inserted.id) } catch {
    return jsonError("Progress was saved, but rewards could not be refreshed. Reload your dashboard to retry.", 503)
  }
  return NextResponse.json({ ok: true, score, passed: event.passed === true, rewards }, { headers: noStore })
}

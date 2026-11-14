import { getPassedLessonIds } from "@/lib/learning-progress"
import { NextResponse } from "next/server"
import { readEntitlement } from "@/lib/premium-guard"
import { getSections } from "@/lib/data/content-catalog"
import { chapterPracticeQuestions, getSection } from "@/lib/data/content"
import { buildChapterLearningDeck } from "@/lib/learning-cards"
import { canAccessLearningChapter, FREE_CHAPTER_PRACTICE_LIMIT, FREE_LESSONS_PER_PATH } from "@/lib/access"
import type { CompanyId, SectionId } from "@/lib/types"
import { readVerifiedProgress } from "@/lib/server/verified-progress"

export const runtime = "nodejs"

export async function GET(request: Request) {
  let entitlement: Awaited<ReturnType<typeof readEntitlement>>
  try {
    entitlement = await readEntitlement()
  } catch {
    return NextResponse.json(
      { error: "We could not verify your subscription. Please retry shortly." },
      { status: 503, headers: { "Cache-Control": "private, no-store", "Retry-After": "5" } },
    )
  }
  if (!entitlement) return NextResponse.json({ error: "Sign in to access practice." }, { status: 401 })
  const url = new URL(request.url)
  const companyId = (url.searchParams.get("company") ?? "general") as CompanyId
  const sectionId = url.searchParams.get("section") as SectionId | null
  const chapterId = url.searchParams.get("chapter")
  if (!sectionId || !chapterId) return NextResponse.json({ error: "Choose a section and chapter." }, { status: 400 })
  const section = getSection(companyId, sectionId)
  const chapter = section?.chapters.find((item) => item.id === chapterId)
  if (!section || !chapter) return NextResponse.json({ error: "Chapter not found." }, { status: 404 })
  const sectionIndex = getSections(companyId).findIndex((item) => item.id === sectionId)
  const pathChapters = section.chapters.filter((item) => (item.pathId ?? section.id) === (chapter.pathId ?? section.id))
  const pathIndex = pathChapters.findIndex((item) => item.id === chapter.id)
  const previousChapter = pathIndex > 0 ? pathChapters[pathIndex - 1] : null
  let verified
  try { verified = await readVerifiedProgress(entitlement.userId, companyId) }
  catch { return NextResponse.json({ error: "Could not verify learning progress." }, { status: 500 }) }
  if (previousChapter && !verified.passedChapterIds.has(previousChapter.id)) {
    return NextResponse.json({ error: "Complete the previous chapter using a verified assessment first." }, { status: 403 })
  }
  const chapterIndex = section.chapters.findIndex((item) => item.id === chapter.id)
  if (!canAccessLearningChapter(sectionIndex, chapterIndex, entitlement.premium, pathIndex)) {
    return NextResponse.json({ error: "Premium access is required for this practice set." }, { status: 402 })
  }
  if (sectionId !== "comm-interview") {
    const lessons = entitlement.premium ? chapter.lessons : chapter.lessons.slice(0, FREE_LESSONS_PER_PATH)
    const requiredCardIds = buildChapterLearningDeck(chapter, lessons).map((card) => card.id)
    const completedCardIds = verified.completedCardIdsByChapter.get(chapterId) ?? new Set<string>()
    const passedLessonIds = verified.passedLessonIdsByChapter.get(chapterId) ?? new Set<string>()
    if (!lessons.every((lesson) => passedLessonIds.has(lesson.id))) {
      return NextResponse.json({ error: "Pass every lesson checkpoint with at least 60% before opening the chapter assessment.", lessonCheckpointsRequired: true }, { status: 423 })
    }
    if (!requiredCardIds.every((id) => completedCardIds.has(id))) {
      return NextResponse.json({ error: "Finish every learning card before opening the separate practice test.", learningRequired: true }, { status: 423 })
    }
  }
  const all = chapter.pathKind === "sql-dbms"
    ? chapterPracticeQuestions("general", "coding", chapterId)
    : chapter.quiz
  const difficultyRank = { easy: 0, medium: 1, hard: 2 } as const
  const ordered = [...all].sort((a, b) => difficultyRank[a.difficulty] - difficultyRank[b.difficulty])
  const filtered = !entitlement.premium && (chapter.pathKind === "language" || chapter.pathKind === "sql-dbms")
    ? ordered.filter((question) => question.difficulty !== "hard")
    : ordered
  const questions = entitlement.premium ? filtered : filtered.slice(0, FREE_CHAPTER_PRACTICE_LIMIT)
  return NextResponse.json({ questions, totalCount: filtered.length, premium: entitlement.premium }, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  })
}

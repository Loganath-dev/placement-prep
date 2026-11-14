import { NextResponse } from "next/server"
import { readEntitlement } from "@/lib/premium-guard"
import { getSections } from "@/lib/data/content-catalog"
import { getSection } from "@/lib/data/content"
import { buildChapterLearningDeck } from "@/lib/learning-cards"
import { buildLessonPracticeSets } from "@/lib/server/learning-content"
import { canAccessLearningChapter, FREE_LESSONS_PER_PATH } from "@/lib/access"
import { getPassedLessonIds, LESSON_PRACTICE_TARGET } from "@/lib/learning-progress"
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
  if (!entitlement) return NextResponse.json({ error: "Sign in to access lesson practice." }, { status: 401 })
  const url = new URL(request.url)
  const companyId = (url.searchParams.get("company") ?? "general") as CompanyId
  const sectionId = url.searchParams.get("section") as SectionId | null
  const chapterId = url.searchParams.get("chapter")
  const lessonId = url.searchParams.get("lesson")
  if (!sectionId || !chapterId || !lessonId) return NextResponse.json({ error: "Choose a lesson to practise." }, { status: 400 })
  const section = getSection(companyId, sectionId)
  const chapter = section?.chapters.find((item) => item.id === chapterId)
  if (!section || !chapter) return NextResponse.json({ error: "Lesson not found." }, { status: 404 })
  const lessons = entitlement.premium ? chapter.lessons : chapter.lessons.slice(0, FREE_LESSONS_PER_PATH)
  if (!lessons.some((item) => item.id === lessonId)) return NextResponse.json({ error: "This lesson requires Premium access." }, { status: 402 })

  const sectionIndex = getSections(companyId).findIndex((item) => item.id === sectionId)
  const pathChapters = section.chapters.filter((item) => (item.pathId ?? section.id) === (chapter.pathId ?? section.id))
  const pathIndex = pathChapters.findIndex((item) => item.id === chapter.id)
  const chapterIndex = section.chapters.findIndex((item) => item.id === chapter.id)
  if (!canAccessLearningChapter(sectionIndex, chapterIndex, entitlement.premium, pathIndex)) return NextResponse.json({ error: "Premium access is required for this lesson." }, { status: 402 })

  let verified
  try { verified = await readVerifiedProgress(entitlement.userId, companyId) }
  catch { return NextResponse.json({ error: "Could not verify lesson progress." }, { status: 500 }) }
  const previousChapter = pathIndex > 0 ? pathChapters[pathIndex - 1] : null
  if (previousChapter && !verified.passedChapterIds.has(previousChapter.id)) return NextResponse.json({ error: "Complete the previous chapter using a verified assessment first." }, { status: 403 })

  const lessonIndex = lessons.findIndex((item) => item.id === lessonId)
  const passedLessonIds = verified.passedLessonIdsByChapter.get(chapterId) ?? new Set<string>()
  if (lessonIndex > 0 && !lessons.slice(0, lessonIndex).every((item) => passedLessonIds.has(item.id))) {
    return NextResponse.json({ error: "Pass the previous lesson checkpoint before starting this lesson." }, { status: 403 })
  }
  if (passedLessonIds.has(lessonId)) {
    return NextResponse.json({ error: "You have already passed this lesson. Revisit its cards for revision." }, { status: 409 })
  }

  const requiredIds = buildChapterLearningDeck(chapter, lessons).filter((card) => card.lessonId === lessonId).map((card) => card.id)
  const completedIds = verified.completedCardIdsByChapter.get(chapterId) ?? new Set<string>()
  if (!requiredIds.length || !requiredIds.every((id) => completedIds.has(id))) return NextResponse.json({ error: "Finish this lesson's learning cards before practising.", learningRequired: true }, { status: 423 })

  const questions = buildLessonPracticeSets(chapter, companyId, sectionId)[lessonIndex] ?? []
  return NextResponse.json({ questions, lessonId, practiceAvailable: questions.length > 0, targetCount: LESSON_PRACTICE_TARGET, contentGap: questions.length < LESSON_PRACTICE_TARGET }, { headers: { "Cache-Control": "private, no-store, max-age=0" } })
}

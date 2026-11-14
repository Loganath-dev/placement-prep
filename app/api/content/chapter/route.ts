import { NextResponse } from "next/server"
import { readEntitlement } from "@/lib/premium-guard"
import { COMPANY_BY_ID } from "@/lib/data/companies"
import { getSection } from "@/lib/data/content"
import { FREE_LESSONS_PER_PATH, canAccessLearningChapter } from "@/lib/access"
import { buildChapterLearningDeck, buildChapterRecallDeck } from "@/lib/learning-cards"
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
  if (!entitlement) return NextResponse.json({ error: "Sign in to access this lesson." }, { status: 401 })

  const url = new URL(request.url)
  const companyId = url.searchParams.get("company") as CompanyId | null
  const sectionId = url.searchParams.get("section") as SectionId | null
  const chapterId = url.searchParams.get("chapter")
  if (!companyId || !COMPANY_BY_ID[companyId] || !sectionId || !chapterId) {
    return NextResponse.json({ error: "Choose a valid learning chapter." }, { status: 400 })
  }

  const section = getSection(companyId, sectionId)
  const chapter = section?.chapters.find((item) => item.id === chapterId)
  if (!section || !chapter || sectionId === "comm-interview" || (sectionId === "coding" && companyId !== "general")) {
    return NextResponse.json({ error: "Learning chapter not found." }, { status: 404 })
  }

  const sections = (await import("@/lib/data/content-catalog")).getSections(companyId)
  const sectionIndex = sections.findIndex((item) => item.id === sectionId)
  const pathChapters = section.chapters.filter((item) => (item.pathId ?? section.id) === (chapter.pathId ?? section.id))
  const pathIndex = pathChapters.findIndex((item) => item.id === chapter.id)
  const previousChapter = pathIndex > 0 ? pathChapters[pathIndex - 1] : null
  if (previousChapter) {
    let verified
    try { verified = await readVerifiedProgress(entitlement.userId, companyId) }
    catch { return NextResponse.json({ error: "Could not verify learning progress." }, { status: 500 }) }
    if (!verified.passedChapterIds.has(previousChapter.id)) {
      return NextResponse.json({ error: "Complete the previous chapter using a verified assessment before opening this one." }, { status: 403 })
    }
  }
  const nextChapter = pathChapters[pathIndex + 1] ?? null
  if (!canAccessLearningChapter(sectionIndex, section.chapters.findIndex((item) => item.id === chapter.id), entitlement.premium, pathIndex)) {
    return NextResponse.json({ error: "Premium access is required for this chapter." }, { status: 402 })
  }

  const lessons = entitlement.premium ? chapter.lessons : chapter.lessons.slice(0, FREE_LESSONS_PER_PATH)
  const learningCards = buildChapterLearningDeck(chapter, lessons)
  const chapterRecallCards = buildChapterRecallDeck(chapter, lessons)
  let verifiedProgress
  try { verifiedProgress = await readVerifiedProgress(entitlement.userId, companyId) }
  catch { return NextResponse.json({ error: "Could not verify learning progress." }, { status: 500 }) }
  return NextResponse.json({
    chapter: {
      id: chapter.id,
      title: chapter.title,
      summary: chapter.summary,
      pathId: chapter.pathId,
      pathName: chapter.pathName,
      pathKind: chapter.pathKind,
      lessons: lessons.map(({ id, title, minutes }) => ({ id, title, minutes })),
    },
    learningCards,
    chapterRecallCards,
    premium: entitlement.premium,
    verifiedProgress: {
      completedCardIds: [...(verifiedProgress.completedCardIdsByChapter.get(chapterId) ?? new Set<string>())],
      passedLessonIds: [...(verifiedProgress.passedLessonIdsByChapter.get(chapterId) ?? new Set<string>())],
      recalled: verifiedProgress.recalledChapterIds.has(chapterId),
      chapterPassed: verifiedProgress.passedChapterIds.has(chapterId),
      lessonScores: Object.fromEntries([...verifiedProgress.latestLessonScores.entries()].filter(([key]) => key.startsWith(`${chapterId}:`)).map(([key, score]) => [key.slice(chapterId.length + 1), score])),
    },
    totalLessons: chapter.lessons.length,
    sectionTitle: section.name,
    companyShort: COMPANY_BY_ID[companyId].short,
    pathIndex,
    previousChapter: previousChapter ? { id: previousChapter.id, title: previousChapter.title } : null,
    nextChapter: nextChapter ? { id: nextChapter.id, title: nextChapter.title } : null,
  }, { headers: { "Cache-Control": "private, no-store, max-age=0" } })
}

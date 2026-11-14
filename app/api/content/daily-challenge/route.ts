import { NextResponse } from "next/server"
import { readEntitlement } from "@/lib/premium-guard"
import { getSections } from "@/lib/data/content"
import { buildLessonPracticeSets } from "@/lib/server/learning-content"
import type { CompanyId, LearningPreferences, Question, SectionId } from "@/lib/types"
import { dateKeyInTimeZone, isValidTimeZone, weekStartKeyInTimeZone } from "@/lib/date-keys"
import { canAccessLearningChapter, visibleDailyChallengeQuestions, FREE_LESSONS_PER_PATH } from "@/lib/access"
import { onlyCompletedLessonSets } from "@/lib/learning-progress"
import { readVerifiedProgress } from "@/lib/server/verified-progress"
import { signRewardSubmission } from "@/lib/server/reward-submission-token"

export const runtime = "nodejs"

type LessonRef = { companyId: CompanyId; sectionId: SectionId; chapterId: string; lessonId: string; title: string; questions: Question[] }

function hash(value: string): number {
  let result = 2166136261
  for (let index = 0; index < value.length; index++) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

function planFor(preferences?: LearningPreferences) {
  const focus = preferences?.focusArea ?? "aptitude"
  const sections: SectionId[] = focus === "aptitude"
    ? ["quant"]
    : focus === "reasoning"
      ? ["reasoning", "verbal"]
      : focus === "cs-core"
        ? ["cs-core", "coding"]
        : ["coding"]
  const pathKind = focus === "programming" ? "language" : focus === "dsa" ? "dsa" : undefined
  const selectedLanguages = new Set(preferences?.selectedLanguages?.length ? preferences.selectedLanguages : ["lang-python"])
  const label = focus === "aptitude" ? "Aptitude" : focus === "reasoning" ? "Reasoning & verbal" : focus === "cs-core" ? "CS core" : focus === "dsa" ? "DSA" : "Programming"
  return { sections, pathKind, selectedLanguages, label, preferences }
}

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
  if (!entitlement) return NextResponse.json({ error: "Sign in to access personalized challenges." }, { status: 401 })

  const url = new URL(request.url)
  const period = url.searchParams.get("period") ?? "daily"
  const timeZone = url.searchParams.get("timeZone") ?? "UTC"
  if (!isValidTimeZone(timeZone)) {
    return NextResponse.json({ error: "Choose a valid IANA time zone." }, { status: 400 })
  }
  if (period !== "daily" && period !== "weekly") {
    return NextResponse.json({ error: "Choose daily or weekly." }, { status: 400 })
  }

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const stateResult = await supabase.from("user_state").select("primary_company,interested,learning_preferences").eq("id", entitlement.userId).maybeSingle()
  if (stateResult.error) {
    return NextResponse.json({ error: "Could not load your learning plan and completed chapters." }, { status: 500 })
  }

  const preferences = (stateResult.data?.learning_preferences ?? undefined) as LearningPreferences | undefined
  const plan = planFor(preferences)
  const companyIds = [...new Set<CompanyId>([
    "general",
    ...(stateResult.data?.primary_company ? [stateResult.data.primary_company as CompanyId] : []),
    ...((stateResult.data?.interested ?? []) as CompanyId[]),
  ])]
  const verifiedByCompany = new Map<CompanyId, Awaited<ReturnType<typeof readVerifiedProgress>>>()
  try {
    await Promise.all(companyIds.map(async (companyId) => verifiedByCompany.set(companyId, await readVerifiedProgress(entitlement.userId, companyId))))
  } catch {
    return NextResponse.json({ error: "Could not verify completed lessons for your challenge." }, { status: 500 })
  }
  const lessonRefs: LessonRef[] = []

  for (const companyId of companyIds) {
    const verified = verifiedByCompany.get(companyId)
    if (!verified) continue
    for (const sectionId of plan.sections) {
      const companySections = getSections(companyId)
      const sectionIndex = companySections.findIndex((item) => item.id === sectionId)
      const section = companySections[sectionIndex]
      if (!section) continue
      for (const chapter of section.chapters) {
        const passedLessonIds = verified.passedLessonIdsByChapter.get(chapter.id) ?? new Set<string>()
        if (!passedLessonIds.size) continue
        const chapterIndex = section.chapters.findIndex((item) => item.id === chapter.id)
        const chapterPath = chapter.pathId ?? section.id
        const pathChapters = section.chapters.filter((item) => (item.pathId ?? section.id) === chapterPath)
        const chapterPathIndex = pathChapters.findIndex((item) => item.id === chapter.id)
        if (!canAccessLearningChapter(sectionIndex, chapterIndex, entitlement.premium, chapterPathIndex)) continue
        if ((preferences?.focusArea ?? "aptitude") === "cs-core" && sectionId === "coding" && chapter.pathKind !== "sql-dbms") continue
        if (plan.pathKind && chapter.pathKind !== plan.pathKind) continue
        if (plan.pathKind === "language" && !plan.selectedLanguages.has(chapter.pathId ?? "")) continue
        const visibleLessons = entitlement.premium ? chapter.lessons : chapter.lessons.slice(0, FREE_LESSONS_PER_PATH)
        const lessonQuestionSets = buildLessonPracticeSets(chapter, companyId, sectionId)
        const completedLessonSets = onlyCompletedLessonSets(visibleLessons, lessonQuestionSets, passedLessonIds)
        for (const { lesson, questions: lessonQuestions } of completedLessonSets) {
          const questions = visibleDailyChallengeQuestions(lessonQuestions, entitlement.premium, chapter.pathKind)
          if (questions.length) lessonRefs.push({
            companyId, sectionId, chapterId: chapter.id, lessonId: lesson.id,
            title: `${chapter.title} · ${lesson.title}`, questions,
          })
        }
      }
    }
  }

  const now = new Date()
  const periodKey = period === "daily"
    ? dateKeyInTimeZone(now, timeZone)
    : weekStartKeyInTimeZone(now, timeZone)
  const uniqueLessons = new Map<string, LessonRef>()
  for (const lesson of lessonRefs) {
    const key = `${lesson.companyId}:${lesson.sectionId}:${lesson.chapterId}:${lesson.lessonId}`
    if (!uniqueLessons.has(key)) uniqueLessons.set(key, lesson)
  }
  const lessons = [...uniqueLessons.values()].sort((a, b) => a.title.localeCompare(b.title))
  const seed = `${entitlement.userId}:${period}:${periodKey}`
  const queues = lessons.map((lesson) => {
    const seenPrompts = new Set<string>()
    return lesson.questions
      .filter((question) => {
        const prompt = question.prompt.trim().toLocaleLowerCase()
        if (seenPrompts.has(prompt)) return false
        seenPrompts.add(prompt)
        return true
      })
      .map((question) => ({ question, lesson }))
      .sort((a, b) => hash(`${seed}:${a.question.id}`) - hash(`${seed}:${b.question.id}`))
  })
  const pool: Array<{ question: Question; lesson: LessonRef }> = []
  const usedPrompts = new Set<string>()
  while (queues.some((queue) => queue.length)) {
    for (const queue of queues) {
      const item = queue.shift()
      if (!item) continue
      const prompt = item.question.prompt.trim().toLocaleLowerCase()
      if (usedPrompts.has(prompt)) continue
      usedPrompts.add(prompt)
      pool.push(item)
    }
  }
  const desiredCount = period === "weekly"
    ? 20
    : preferences?.dailyMinutes === 10 ? 5 : preferences?.dailyMinutes === 20 ? 7 : preferences?.dailyMinutes === 30 ? 9 : 10
  const questions = pool.slice(0, desiredCount).map(({ question }) => question)
  const sourceLessons = [...new Map(pool.slice(0, desiredCount).map(({ lesson }) => [`${lesson.companyId}:${lesson.sectionId}:${lesson.chapterId}:${lesson.lessonId}`, {
    id: lesson.lessonId,
    title: lesson.title,
    href: `/learn/${lesson.companyId}/${lesson.sectionId}/${lesson.chapterId}`,
  }])).values()]

  const submissionToken = signRewardSubmission({
    userId: entitlement.userId,
    kind: period,
    subjectId: periodKey,
    periodKey,
    timeZone,
    companyId: "general",
    questions: questions.map((question) => ({ id: question.id, answer: question.answer, optionCount: question.options.length, acceptedAnswers: question.acceptedAnswers })),
    issuedAt: Date.now(),
  })

  return NextResponse.json({
    period,
    periodKey,
    submissionToken,
    plan: plan.label,
    questions: questions.map(({ answer: _answer, acceptedAnswers: _acceptedAnswers, ...safeQuestion }) => safeQuestion),
    completedLessonCount: lessons.length,
    sourceLessons,
    targetMinutes: period === "weekly" ? Math.max(20, (preferences?.dailyMinutes ?? 20) * 2) : preferences?.dailyMinutes ?? 20,
  }, { headers: { "Cache-Control": "private, no-store, max-age=0" } })
}

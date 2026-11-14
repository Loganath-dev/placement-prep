"use client"

import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/app-icon"
import { FlashcardStudySession } from "@/app/flashcard-study-session"
import { Prose } from "@/app/prose"
import { QuizRunner, type QuizResultItem } from "@/app/quiz-runner"
import { UpgradeBanner } from "@/app/upgrade-prompt"
import { useStore } from "@/lib/store"
import { hasPendingProgressSync, retryProgressSync } from "@/lib/supabase/progress-sync-queue"
import type { Chapter, ChapterLearningProgress, CompanyId, LearningCard, Question, SavedLearningCard, SectionId } from "@/lib/types"
import { track } from "@/lib/analytics"
import { getPassedLessonIds, getSafeLearningCardIndex, LESSON_PASS_THRESHOLD, LESSON_PRACTICE_TARGET } from "@/lib/learning-progress"

type LessonSummary = Pick<Chapter["lessons"][number], "id" | "title" | "minutes">
type ChapterPayload = {
  chapter: Omit<Chapter, "quiz" | "lessons"> & { lessons: LessonSummary[] }
  learningCards: LearningCard[]
  chapterRecallCards: LearningCard[]
  premium: boolean
  totalLessons: number
  sectionTitle: string
  companyShort: string
  pathIndex: number
  previousChapter: { id: string; title: string } | null
  nextChapter: { id: string; title: string } | null
  verifiedProgress: { completedCardIds: string[]; passedLessonIds: string[]; recalled: boolean; chapterPassed: boolean; lessonScores: Record<string, number> }
}

export default function ChapterPage() {
  const params = useParams<{ company: string; section: string; chapter: string }>()
  const searchParams = useSearchParams()
  const { state, userId, submitQuiz, recordLearningCard, toggleLearningBookmark, recordLessonPractice, recordMistake, completeChapterRecall, applyServerRewards } = useStore()
  const [content, setContent] = React.useState<ChapterPayload | null>(null)
  const [loadedRequestKey, setLoadedRequestKey] = React.useState<string | null>(null)
  const [contentError, setContentError] = React.useState<string | null>(null)
  const [practiceQuestions, setPracticeQuestions] = React.useState<Question[]>([])
  const [practiceLoading, setPracticeLoading] = React.useState(false)
  const [practiceError, setPracticeError] = React.useState<string | null>(null)
  const [practiceOpen, setPracticeOpen] = React.useState(false)
  const [practiceMode, setPracticeMode] = React.useState<"lesson" | "chapter">("lesson")
  const [practiceResult, setPracticeResult] = React.useState<{ score: number; passed: boolean } | null>(null)
  const [selectedCard, setSelectedCard] = React.useState<{ requestKey: string; cardId: string } | null>(null)
  const [selectedLessonId, setSelectedLessonId] = React.useState<string | null>(null)
  const [recallOpen, setRecallOpen] = React.useState(false)
  const [revealedRecallIds, setRevealedRecallIds] = React.useState<Set<string>>(() => new Set())

  const companyId = params.company as CompanyId
  const sectionId = params.section as SectionId
  const requestKey = `${params.company}/${params.section}/${params.chapter}`
  const chapterId = params.chapter
  const chapterProgress = state.progress[companyId]?.chapters[chapterId]
  const legacyLearning = chapterProgress?.learning
  const recallComplete = Boolean(content?.verifiedProgress?.recalled)

  React.useEffect(() => {
    let cancelled = false
    fetch(`/api/content/chapter?company=${encodeURIComponent(params.company)}&section=${encodeURIComponent(params.section)}&chapter=${encodeURIComponent(params.chapter)}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw Object.assign(new Error(result.error ?? "Could not load this lesson."), { status: response.status })
        return result as ChapterPayload
      })
      .then((result) => {
        if (cancelled) return
        setContent(result)
        setContentError(null)
        setPracticeQuestions([])
        setPracticeError(null)
        setPracticeOpen(false)
        setPracticeResult(null)
        setRecallOpen(false)
        setRevealedRecallIds(new Set())
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setContent(null)
          setContentError(error instanceof Error ? error.message : "Could not load this lesson.")
        }
      })
      .finally(() => { if (!cancelled) setLoadedRequestKey(requestKey) })
    return () => { cancelled = true }
  }, [params.company, params.section, params.chapter, requestKey])

  React.useEffect(() => {
    if (content?.chapter?.id) track("chapter_start", { company: companyId, section: sectionId, chapter: content.chapter.id })
  }, [content?.chapter?.id, companyId, sectionId])

  if (loadedRequestKey !== requestKey) return <div className="mx-auto max-w-3xl rounded-xl border p-8 text-sm text-muted-foreground">Loading lesson…</div>
  if (!content && contentError) {
    const premiumRequired = contentError.toLowerCase().includes("premium")
    return <div className="mx-auto max-w-2xl space-y-5"><Card><CardContent className="space-y-3 py-10 text-center"><Icon name={premiumRequired ? "Lock" : "BookOpen"} className="mx-auto size-8 text-primary" /><h1 className="font-heading text-xl font-bold">{premiumRequired ? "Unlock this learning chapter" : "Lesson unavailable"}</h1><p className="text-sm text-muted-foreground">{contentError}</p>{premiumRequired ? <UpgradeBanner /> : <Button onClick={() => window.location.reload()}>Try again</Button>}</CardContent></Card></div>
  }
  if (!content) return null

  const { chapter, learningCards, chapterRecallCards, sectionTitle, pathIndex, previousChapter, nextChapter } = content
  // Unlock state comes only from server-verified events. Legacy browser snapshots
  // remain available for non-security preferences such as bookmarks and resume position.
  const verifiedLessonScores = content.verifiedProgress.lessonScores as Record<string, number>
  const learning: ChapterLearningProgress = {
    ...(legacyLearning ?? { completedCardIds: [], completedLessonIds: [], practiceAttempts: [], savedCards: [] }),
    completedCardIds: content.verifiedProgress.completedCardIds,
    passedLessonIds: content.verifiedProgress.passedLessonIds,
    recallCompletedAt: content.verifiedProgress.recalled ? 1 : undefined,
    practiceAttempts: Object.entries(verifiedLessonScores).map(([lessonId, score]) => ({ lessonId, score, correct: 0, total: 0, completedAt: 0 })),
  }
  const lessons = chapter.lessons
  const savedLast = searchParams.get("card") ?? learning?.lastViewedCardId
  const resumedCard = savedLast ? learningCards.find((card) => card.id === savedLast) : undefined
  const lessonIndexFromResume = resumedCard ? lessons.findIndex((lesson) => lesson.id === resumedCard.lessonId) : -1
  const requestedLessonId = selectedLessonId ?? searchParams.get("lesson")
  const explicitLessonIndex = requestedLessonId ? lessons.findIndex((lesson) => lesson.id === requestedLessonId) : -1
  const passedLessonIds = getPassedLessonIds(learning)
  const firstUnpassedFound = lessons.findIndex((lesson) => !passedLessonIds.has(lesson.id))
  const firstUnpassedIndex = firstUnpassedFound < 0 ? Math.max(lessons.length - 1, 0) : firstUnpassedFound
  const requestedIndex = explicitLessonIndex >= 0 ? explicitLessonIndex : lessonIndexFromResume >= 0 ? lessonIndexFromResume : firstUnpassedIndex
  const activeLessonIndex = Math.min(Math.max(requestedIndex, 0), firstUnpassedIndex)
  const activeLesson = lessons[activeLessonIndex]
  const lessonCards = learningCards.filter((card) => card.lessonId === activeLesson?.id)
  const requestedCardIndex = selectedCard?.requestKey === requestKey ? lessonCards.findIndex((card) => card.id === selectedCard.cardId) : -1
  const resumedCardIndex = resumedCard?.lessonId === activeLesson?.id ? lessonCards.findIndex((card) => card.id === resumedCard.id) : -1
  const firstUnfinished = lessonCards.findIndex((card) => !(learning?.completedCardIds ?? []).includes(card.id))
  const preferredCardIndex = requestedCardIndex >= 0 ? requestedCardIndex : resumedCardIndex >= 0 ? resumedCardIndex : Math.max(firstUnfinished, 0)
  const currentIndex = getSafeLearningCardIndex(preferredCardIndex, firstUnfinished, lessonCards.length)
  const currentCard = lessonCards[currentIndex]
  const completedIds = new Set((learning?.completedCardIds ?? []).filter((id) => lessonCards.some((card) => card.id === id)))
  const learningComplete = lessonCards.length > 0 && lessonCards.every((card) => (learning?.completedCardIds ?? []).includes(card.id))
  const completedLessonIds = passedLessonIds
  const lessonBestScores = new Map<string, number>()
  for (const attempt of learning?.practiceAttempts ?? []) {
    if (!attempt.lessonId) continue
    lessonBestScores.set(attempt.lessonId, Math.max(lessonBestScores.get(attempt.lessonId) ?? 0, attempt.score))
  }
  const allChapterLessonsCompleted = lessons.length > 0 && lessons.every((lesson) => completedLessonIds.has(lesson.id))
  const activeLessonPassed = Boolean(activeLesson && completedLessonIds.has(activeLesson.id))
  const savedCard = Boolean((learning?.savedCards ?? []).some((card) => card.id === currentCard?.id))
  const backHref = companyId === "general" && sectionId === "coding"
    ? chapter.pathId === "dsa" ? "/learn/dsa" : chapter.pathId === "sql-dbms" ? "/learn/cs-core" : "/learn/programming-languages"
    : `/learn/${companyId}/${sectionId}`
  const gateLocked = false // The chapter API refuses to serve content until the previous chapter is verified.

  if (gateLocked && previousChapter) return (
    <div className="mx-auto max-w-2xl space-y-5"><BackLink href={backHref} label={sectionTitle} /><Card><CardContent className="flex flex-col items-center gap-4 py-12 text-center"><span className="grid size-16 place-items-center rounded-2xl bg-muted text-muted-foreground"><Icon name="Lock" className="size-8" /></span><div><h1 className="font-heading text-2xl font-bold">{chapter.title}</h1><p className="mx-auto mt-1 max-w-md text-muted-foreground">Complete <strong>{previousChapter.title}</strong> first to continue your path.</p></div><Button asChild><Link href={`/learn/${companyId}/${sectionId}/${previousChapter.id}`}>Go to {previousChapter.title} <Icon name="ArrowRight" className="size-4" /></Link></Button></CardContent></Card></div>
  )

  async function startPractice() {
    if (!learningComplete || practiceLoading || !activeLesson || activeLessonPassed) return
    setPracticeLoading(true)
    setPracticeError(null)
    try {
      if (userId) {
        await retryProgressSync(userId)
        if (hasPendingProgressSync(userId)) throw new Error("Your learning progress is still syncing. Try again in a moment.")
      }
      const response = await fetch(`/api/content/lesson-practice?company=${encodeURIComponent(companyId)}&section=${encodeURIComponent(sectionId)}&chapter=${encodeURIComponent(chapter.id)}&lesson=${encodeURIComponent(activeLesson.id)}`, { cache: "no-store" })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? "Could not load the practice test.")
      const questions = (result.questions ?? []) as Question[]
      if (!questions.length) throw new Error("Practice questions for this lesson are not available yet. Your learning progress is saved.")
      setPracticeQuestions(questions)
      setPracticeMode("lesson")
      setPracticeOpen(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load the practice test."
      setPracticeError(message)
      toast.error(message)
    } finally {
      setPracticeLoading(false)
    }
  }

  async function startChapterAssessment() {
    if (!allChapterLessonsCompleted || practiceLoading) return
    setPracticeLoading(true)
    setPracticeError(null)
    try {
      if (userId) {
        await retryProgressSync(userId)
        if (hasPendingProgressSync(userId)) throw new Error("Your learning progress is still syncing. Try again in a moment.")
      }
      const response = await fetch(`/api/content/chapter-practice?company=${encodeURIComponent(companyId)}&section=${encodeURIComponent(sectionId)}&chapter=${encodeURIComponent(chapter.id)}`, { cache: "no-store" })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? "Could not load the chapter assessment.")
      const questions = (result.questions ?? []) as Question[]
      if (!questions.length) throw new Error("Chapter assessment questions are not available right now. Please try again later.")
      setPracticeQuestions(questions)
      setPracticeMode("chapter")
      setPracticeOpen(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load the chapter assessment."
      setPracticeError(message)
      toast.error(message)
    } finally {
      setPracticeLoading(false)
    }
  }

  if (practiceOpen) return (
    <div className="mx-auto max-w-3xl space-y-4">
      <BackLink href="#" label="Return to learning cards" onClick={() => setPracticeOpen(false)} />
      <div>
        <p className="text-sm font-medium text-primary">{practiceMode === "lesson" ? "Lesson checkpoint" : "Chapter assessment"}</p>
        <h1 className="font-heading text-2xl font-bold">{practiceMode === "lesson" ? activeLesson?.title : chapter.title}</h1>
        {practiceMode === "chapter" ? <p className="mt-1 text-sm text-muted-foreground">Pass this assessment to unlock the next chapter.</p> : null}
      </div>
      <QuizRunner
        key={`${requestKey}-${practiceMode}-practice`}
        questions={practiceQuestions}
        passThreshold={practiceMode === "lesson" ? LESSON_PASS_THRESHOLD : 70}
        shuffle
        passThresholdLabel={practiceMode === "lesson" ? "to pass this lesson checkpoint" : "to pass this chapter and unlock the next one"}
        questionCountLabel={practiceMode === "lesson" ? "" : "assessment questions"}
        onReturn={() => setPracticeOpen(false)}
        returnLabel="Learning cards"
        onMistake={recordMistake}
        onFinish={(results: QuizResultItem[]) => {
          void (async () => {
            try {
              const response = await fetch("/api/learning/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  eventType: practiceMode === "lesson" ? "lesson_practice_submitted" : "chapter_assessment_submitted",
                  companyId, sectionId, chapterId: chapter.id,
                  lessonId: practiceMode === "lesson" ? activeLesson?.id : undefined,
                  idempotencyKey: crypto.randomUUID(),
                  answers: results.map((result) => ({ questionId: result.questionId, selected: result.selected, responseText: result.responseText })),
                }),
              })
              const verified = await response.json()
              if (!response.ok) throw new Error(verified.error ?? "The server could not verify this attempt.")
              const answers = results.map((result) => ({ topic: result.topic, correct: result.correct }))
              const verifiedScore = Number(verified.score ?? 0)
              const passed = verified.passed === true
              if (practiceMode === "lesson" && activeLesson) {
                recordLessonPractice(companyId, chapter.id, activeLesson.id, answers, verifiedScore)
              } else {
                submitQuiz({ companyId, sectionId, chapterId: chapter.id, results: answers, verifiedScore })
              }
              if (verified.rewards) applyServerRewards(verified.rewards)
              setPracticeResult({ score: verifiedScore, passed })
              toast[passed ? "success" : "info"](passed ? `${practiceMode === "lesson" ? "Lesson checkpoint" : "Chapter assessment"} passed · ${verifiedScore}%` : `Assessment · ${verifiedScore}%`, {
                description: passed ? "Your server-verified result has been saved." : `You need ${practiceMode === "lesson" ? "60%" : "70%"} to pass. Review and retry.`,
              })
            } catch (error) {
              const message = error instanceof Error ? error.message : "Could not verify your attempt. Please retry."
              setPracticeError(message)
              toast.error(message)
            }
          })()
        }}
        doneActions={() => (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setPracticeOpen(false)}>Review cards</Button>
            {practiceMode === "lesson" && practiceResult?.passed && activeLessonIndex < lessons.length - 1 ? <Button onClick={() => { setPracticeOpen(false); setSelectedLessonId(lessons[activeLessonIndex + 1]?.id ?? null); setPracticeResult(null); setPracticeError(null) }}>Next lesson <Icon name="ArrowRight" className="size-4" /></Button> : null}
            {practiceMode === "lesson" && practiceResult?.passed && activeLessonIndex === lessons.length - 1 ? <Button variant="outline" onClick={() => setPracticeOpen(false)}>Return to chapter learning</Button> : null}
            {practiceMode === "chapter" && practiceResult?.passed && nextChapter ? <Button asChild><Link href={`/learn/${companyId}/${sectionId}/${nextChapter.id}`}>Next chapter <Icon name="ArrowRight" className="size-4" /></Link></Button> : null}
            {practiceMode === "chapter" && practiceResult?.passed && !nextChapter ? <Button asChild><Link href={backHref}>Finish path</Link></Button> : null}
            </div>
          </div>
        )}
      />
    </div>
  )

  const lessonHref = `/learn/${companyId}/${sectionId}/${chapter.id}`
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <BackLink href={backHref} label={sectionTitle} />
      <header className="space-y-1">
        <p className="text-sm font-medium text-primary">Chapter {pathIndex + 1}</p>
        <h1 className="font-heading text-2xl font-bold md:text-3xl">{chapter.title}</h1>
        <p className="text-muted-foreground">{chapter.summary}</p>
        <p className="pt-2 text-sm font-medium">Learn the core idea, work through examples and tricks, then practise on your own.</p>
      </header>

      <section className="space-y-3" aria-label="Lessons in this chapter">
        <div className="flex items-center justify-between gap-3"><h2 className="font-semibold">Chapter lessons</h2><span className="text-xs text-muted-foreground">{completedLessonIds.size} of {lessons.length} completed</span></div>
        <div className="grid gap-2 sm:grid-cols-2">
          {lessons.map((lesson, index) => {
            const locked = index > 0 && !lessons.slice(0, index).every((item) => completedLessonIds.has(item.id))
            const passed = completedLessonIds.has(lesson.id)
            return (
              <button key={lesson.id} type="button" onClick={() => { if (!locked) { setSelectedLessonId(lesson.id); setSelectedCard(null); setPracticeResult(null) } }} disabled={locked} aria-current={index === activeLessonIndex ? "step" : undefined} className={`rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${index === activeLessonIndex ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                <span className="flex items-center justify-between gap-2"><span className="text-xs font-medium text-muted-foreground">Lesson {index + 1} · {lesson.minutes} min</span><span className="flex items-center gap-2">{lessonBestScores.has(lesson.id) ? <span className={`text-xs font-semibold tabular-nums ${lessonBestScores.get(lesson.id)! >= LESSON_PASS_THRESHOLD ? "text-success" : "text-muted-foreground"}`}>Best {lessonBestScores.get(lesson.id)}%</span> : null}{passed ? <Icon name="CircleCheckBig" className="size-4 text-success" /> : locked ? <Icon name="Lock" className="size-4" /> : null}</span></span>
                <span className="mt-1 block text-sm font-semibold">{lesson.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{passed ? "Passed · revisit anytime" : locked ? "Pass the previous lesson to unlock" : "Learn, then pass 60% practice"}</span>
              </button>
            )
          })}
        </div>
      </section>

      {activeLesson ? <div className="space-y-1"><p className="text-xs font-semibold uppercase tracking-wide text-primary">Lesson {activeLessonIndex + 1} of {lessons.length}</p><h2 className="font-heading text-xl font-bold">{activeLesson.title}</h2></div> : null}

      <FlashcardStudySession
        key={`${requestKey}:${activeLesson?.id ?? "empty"}:${currentCard?.id ?? "empty"}`}
        cards={lessonCards}
        index={currentIndex}
        completedIds={completedIds}
        saved={savedCard}
        onNavigate={(nextIndex) => {
          const nextCard = lessonCards[nextIndex]
          if (!nextCard) return
          setSelectedCard({ requestKey, cardId: nextCard.id })
          recordLearningCard(companyId, chapter.id, nextCard.id, learningCards.length, false, nextCard.lessonId, false)
        }}
        onComplete={async (cardId) => {
          const card = learningCards.find((item) => item.id === cardId)
          if (!card) return false
          try {
            const response = await fetch("/api/learning/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventType: "lesson_card_completed", companyId, sectionId, chapterId: chapter.id, lessonId: card.lessonId, cardId, idempotencyKey: crypto.randomUUID() }) })
            const result = await response.json()
            if (!response.ok) throw new Error(result.error ?? "Could not verify card completion.")
            if (result.rewards) applyServerRewards(result.rewards)
            // The API response is the authority: advance the in-memory verified
            // card set only after the server has acknowledged this completion.
            // This keeps the next-card clamp in sync without trusting local drafts.
            setContent((previous) => previous ? ({
              ...previous,
              verifiedProgress: {
                ...previous.verifiedProgress,
                completedCardIds: [...new Set([...previous.verifiedProgress.completedCardIds, cardId])],
              },
            }) : previous)
            const lastCardInLesson = lessonCards.every((item) => item.id === cardId || (learning?.completedCardIds ?? []).includes(item.id))
            recordLearningCard(companyId, chapter.id, cardId, learningCards.length, true, card.lessonId, lastCardInLesson)
            return true
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not save this learning card.")
            return false
          }
        }}
        onStartPractice={() => void startPractice()}
        practiceError={practiceError}
        practiceDisabled={activeLessonPassed}
        onToggleSave={() => {
          if (!currentCard) return
          const card: SavedLearningCard = { id: currentCard.id, title: currentCard.title, href: `${lessonHref}?card=${encodeURIComponent(currentCard.id)}` }
          toggleLearningBookmark(companyId, chapter.id, card)
          toast.success(savedCard ? "Card removed from saved cards" : "Card saved for review")
        }}
      />

      {allChapterLessonsCompleted ? (
        <section className="space-y-3" aria-label="Chapter recall and assessment">
          <Card id="chapter-recall"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-semibold">1. Chapter Recall</p><p className="text-sm text-muted-foreground">Use {chapterRecallCards.length || 1} short self-check cards to refresh formulas, rules and key ideas. Chapter Recall is optional reflection; the assessment verifies mastery.</p></div>
            <Button variant={recallComplete ? "secondary" : "default"} onClick={() => setRecallOpen((open) => !open)}>{recallComplete ? "Review recall again" : "Start chapter recall"} <Icon name="BookOpen" className="size-4" /></Button>
          </CardContent></Card>
          {recallOpen ? <Card><CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between"><h3 className="font-semibold">Quick memory refresh</h3><span className="text-xs text-muted-foreground">{revealedRecallIds.size} / {chapterRecallCards.length || 1} completed</span></div>
            {(chapterRecallCards.length ? chapterRecallCards : [{ id: `recall-${chapter.id}-summary`, title: "Chapter key idea", answer: chapter.summary, type: "concept" as const, lessonId: lessons[0]?.id ?? "" }]).map((card, index) => {
              const revealed = revealedRecallIds.has(card.id)
              return <div key={card.id} className="rounded-xl border p-4">
                <p className="text-xs font-medium text-primary">Recall card {index + 1}</p><p className="mt-1 font-semibold">{card.title}</p>
                {revealed ? <div className="mt-3 text-sm leading-relaxed"><Prose body={card.answer} /></div> : <p className="mt-3 text-sm text-muted-foreground">Try to recall the key idea or formula before revealing it.</p>}
                <Button className="mt-3" size="sm" variant="outline" onClick={() => setRevealedRecallIds((previous) => new Set(previous).add(card.id))}>{revealed ? "Completed" : "Reveal answer"}</Button>
              </div>
            })}
            <Button className="w-full" disabled={revealedRecallIds.size < (chapterRecallCards.length || 1)} onClick={() => {
              void (async () => {
                try {
                  const response = await fetch("/api/learning/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventType: "chapter_recall_completed", companyId, sectionId, chapterId: chapter.id, cardIds: (chapterRecallCards.length ? chapterRecallCards : [{ id: `recall-${chapter.id}-summary` }]).map((card) => card.id), idempotencyKey: crypto.randomUUID() }) })
                  const result = await response.json()
                  if (!response.ok) throw new Error(result.error ?? "Could not verify Chapter Recall.")
                  if (result.rewards) applyServerRewards(result.rewards)
                  completeChapterRecall(companyId, chapter.id)
                  setRecallOpen(false)
                } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save Chapter Recall.") }
              })()
            }}>Finish memory refresh <Icon name="Check" className="size-4" /></Button>
          </CardContent></Card> : null}
          <Card id="chapter-assessment"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">2. Chapter assessment</p><p className="text-sm text-muted-foreground">{"Pass with at least 70% to complete this chapter and unlock the next one. Chapter Recall is an optional self-check."}</p></div><Button onClick={() => void startChapterAssessment()} disabled={practiceLoading}>{practiceLoading ? "Preparing…" : "Start chapter assessment"} <Icon name="ArrowRight" className="size-4" /></Button></CardContent></Card>
        </section>
      ) : null}

    </div>
  )
}

function BackLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  if (onClick) return <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><Icon name="ChevronRight" className="size-4 rotate-180" /> {label}</button>
  return <Link href={href} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><Icon name="ChevronRight" className="size-4 rotate-180" /> {label}</Link>
}

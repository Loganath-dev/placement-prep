"use client"

import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { QuizRunner, type QuizResultItem } from "@/components/app/quiz-runner"
import { Prose } from "@/components/app/prose"
import { UpgradeBanner } from "@/components/app/upgrade-prompt"
import { canAccessLearningChapter } from "@/lib/access"
import { COMPANY_BY_ID, getCompany } from "@/lib/data/companies"
import { getSection, getSections } from "@/lib/data/content"
import { generateDrills, generateDrillsByDifficulty } from "@/lib/data/question-bank"
import { EMPTY_PROGRESS } from "@/lib/scoring"
import { useStore } from "@/lib/store"
import type { CompanyId, Difficulty, Question, SectionId } from "@/lib/types"
import { cn } from "@/lib/utils"
import { track } from "@/lib/analytics"

// Every chapter serves a balanced 90-question practice bank, split across its
// lessons so each lesson holds at least ~10 questions with a clear difficulty mix.
const LESSON_PRACTICE_MIX = { easy: 10, medium: 40, hard: 40 } as const

export default function ChapterPage() {
  const params = useParams<{ company: string; section: string; chapter: string }>()
  const { state, submitQuiz, recordMistake } = useStore()
  const [practiceLessonIndex, setPracticeLessonIndex] = React.useState<number | null>(null)
  const [lessonResults, setLessonResults] = React.useState<Record<number, QuizResultItem[]>>({})

  const companyId = params.company as CompanyId
  const sectionId = params.section as SectionId
  if (!COMPANY_BY_ID[companyId]) notFound()
  const section = getSection(companyId, sectionId)
  if (!section) notFound()
  const sectionIndex = getSections(companyId).findIndex((item) => item.id === sectionId)
  const idx = section.chapters.findIndex((c) => c.id === params.chapter)
  if (idx === -1) notFound()

  const company = getCompany(companyId)
  const chapter = section.chapters[idx]
  const prevCh = idx > 0 ? section.chapters[idx - 1] : null
  const nextCh = section.chapters[idx + 1]
  const progress = state.progress[companyId] ?? EMPTY_PROGRESS
  const gateLocked = prevCh ? !progress.chapters[prevCh.id]?.passed : false
  const paywalled = !canAccessLearningChapter(sectionIndex, idx, state.premium)
  const backHref = `/learn/${companyId}/${sectionId}`
  const lessonPracticeSets = React.useMemo(
    () => lessonPracticeQuestions(chapter, sectionId),
    [chapter, sectionId],
  )
  const completedLessonCount = Object.keys(lessonResults).length
  const currentLessonIndex = Math.min(completedLessonCount, chapter.lessons.length - 1)
  const currentLesson = chapter.lessons[currentLessonIndex]
  const allLessonResults = Object.values(lessonResults).flat()
  const chapterPracticeScore = allLessonResults.length
    ? Math.round(
        (allLessonResults.filter((result) => result.correct).length / allLessonResults.length) *
          100,
      )
    : 0
  const chapterComplete = completedLessonCount === chapter.lessons.length

  React.useEffect(() => {
    if (!paywalled) track("chapter_start", { company: companyId, section: sectionId, chapter: chapter.id })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter.id])

  if (paywalled) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <BackLink href={backHref} label={section.name} />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <span className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Icon name="Lock" className="size-8" />
            </span>
            <div>
              <h1 className="font-heading text-2xl font-bold">{chapter.title}</h1>
              <p className="mt-1 text-muted-foreground">
                Free users get all of Section 1 in every track.
                Upgrade to unlock Sections 2 onwards and go deeper.
              </p>
            </div>
          </CardContent>
        </Card>
        <UpgradeBanner />
      </div>
    )
  }

  if (gateLocked && prevCh) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <BackLink href={backHref} label={section.name} />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <span className="grid size-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Icon name="Lock" className="size-8" />
            </span>
            <div>
              <h1 className="font-heading text-2xl font-bold">{chapter.title}</h1>
              <p className="mx-auto mt-1 max-w-md text-muted-foreground">
                Complete <strong>{prevCh.title}</strong> first to continue your path.
              </p>
            </div>
            <Button asChild>
              <Link href={`/learn/${companyId}/${sectionId}/${prevCh.id}`}>
                Go to {prevCh.title} <Icon name="ArrowRight" className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <BackLink href={backHref} label={section.name} />

      <div>
        <p className="text-sm font-medium text-primary">
          {company.short} - {section.short} - Chapter {idx + 1}
        </p>
        <h1 className="font-heading text-2xl font-bold md:text-3xl">{chapter.title}</h1>
        <p className="mt-1 text-muted-foreground">{chapter.summary}</p>
      </div>

      {practiceLessonIndex === null ? (
        chapterComplete ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-heading text-lg font-semibold">
                Chapter practice score: {chapterPracticeScore}%
              </p>
                <p className="text-sm text-muted-foreground">
                  {chapterPracticeScore >= 70
                  ? "Great work. Your best chapter score is saved."
                  : "Retake the chapter later — placement cutoffs are 70%+."}
                </p>
            </div>
            {nextCh && chapterPracticeScore >= 70 ? (
              <Button asChild>
                <Link href={`/learn/${companyId}/${sectionId}/${nextCh.id}`}>
                  Next chapter <Icon name="ArrowRight" className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href={backHref}>Back to {section.short}</Link>
              </Button>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="space-y-4 pt-6">
              {/* Lesson progress stepper */}
              <LessonStepper
                total={chapter.lessons.length}
                current={currentLessonIndex}
                completedCount={completedLessonCount}
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Lesson {currentLessonIndex + 1} of {chapter.lessons.length}
                  </p>
                  <h2 className="font-heading text-xl font-semibold">{currentLesson.title}</h2>
                </div>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon name="BookOpen" className="size-3.5" /> {currentLesson.minutes} min
                </span>
              </div>
              <Prose body={currentLesson.body} />
              <div className="flex flex-col gap-2 rounded-xl bg-muted/45 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">
                    Practice this lesson
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {(lessonPracticeSets[currentLessonIndex] ?? []).length} questions
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Build confidence on this topic before moving to the next lesson.
                  </p>
                  <LessonDifficultyBreakdown questions={lessonPracticeSets[currentLessonIndex] ?? []} />
                </div>
                <Button onClick={() => setPracticeLessonIndex(currentLessonIndex)}>
                  Start questions <Icon name="ArrowRight" className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <QuizRunner
          key={`${chapter.id}-${practiceLessonIndex}`}
          questions={lessonPracticeSets[practiceLessonIndex] ?? []}
          passThreshold={70}
          shuffle
          passThresholdLabel="for this lesson practice (placement cutoff is 70%)"
          onReturn={() => setPracticeLessonIndex(null)}
          returnLabel="Lesson"
          onMistake={recordMistake}
          onFinish={(results) => {
            const nextResults = { ...lessonResults, [practiceLessonIndex]: results }
            setLessonResults(nextResults)

            const completedAllLessons = chapter.lessons.every(
              (_, lessonIndex) => nextResults[lessonIndex],
            )
            if (!completedAllLessons) {
              toast.success("Lesson practice saved", {
                description: "Continue with the next lesson.",
              })
              return
            }

            const combinedResults = Object.values(nextResults).flat()
            const res = submitQuiz({ companyId, sectionId, chapterId: chapter.id, results: combinedResults })
            if (res.newlyPassed) {
              toast.success(`Chapter cleared! +${res.xpGained} XP`, {
                description: nextCh ? "Next chapter unlocked." : "Section complete.",
              })
            } else if (res.passed) {
              toast.success(`Nice - ${res.score}%. +${res.xpGained} XP`)
            } else {
              toast(`${res.score}% - keep going`, {
                description: "Review the weaker questions and try again.",
              })
            }
          }}
          doneActions={() => (
            <Button variant="outline" onClick={() => setPracticeLessonIndex(null)}>
              {practiceLessonIndex + 1 < chapter.lessons.length ? "Continue" : "See chapter result"}
            </Button>
          )}
        />
      )}
    </div>
  )
}

function practiceSeed(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

/** Even round-robin difficulty order honouring the 10/40/40 target. */
function chapterDifficultySequence(mix: {
  easy: number
  medium: number
  hard: number
}): Difficulty[] {
  const targets: [Difficulty, number][] = [
    ["easy", mix.easy],
    ["medium", mix.medium],
    ["hard", mix.hard],
  ]
  const total = mix.easy + mix.medium + mix.hard
  const counts: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 }
  const out: Difficulty[] = []
  for (let k = 0; k < total; k++) {
    let best: Difficulty | null = null
    let bestScore = Infinity
    for (const [d, t] of targets) {
      if (t === 0 || counts[d] >= t) continue
      const score = (counts[d] + 0.5) / t
      if (score < bestScore) {
        bestScore = score
        best = d
      }
    }
    if (!best) break
    counts[best] += 1
    out.push(best)
  }
  return out
}

interface LessonPracticeChapter {
  id: string
  quiz: Question[]
  lessons: { id: string }[]
}

/**
 * Builds the chapter's lesson-practice sets: a balanced 90-question bank
 * (10 easy / 40 medium / 40 hard) drawn from the chapter quiz first and topped
 * up with computed generators so the difficulty target is always met, then split
 * across the chapter's lessons so each lesson holds at least ~10 questions with a
 * representative easy/medium/hard mix.
 */
function lessonPracticeQuestions(
  chapter: LessonPracticeChapter,
  sectionId: SectionId,
): Question[][] {
  const lessonCount = chapter.lessons.length
  if (lessonCount <= 0) return []

  const seed = practiceSeed(`${sectionId}:${chapter.id}`)
  const byDifficulty: Record<Difficulty, Question[]> = {
    easy: chapter.quiz.filter((question) => question.difficulty === "easy"),
    medium: chapter.quiz.filter((question) => question.difficulty === "medium"),
    hard: chapter.quiz.filter((question) => question.difficulty === "hard"),
  }

  const usedIds = new Set<string>()
  const usedPrompts = new Set<string>()
  const pool: Record<Difficulty, Question[]> = { easy: [], medium: [], hard: [] }

  function take(question: Question, into: Question[]): boolean {
    const promptKey = question.prompt.trim().toLowerCase().replace(/\s+/g, " ")
    if (usedIds.has(question.id) || usedPrompts.has(promptKey)) return false
    usedIds.add(question.id)
    usedPrompts.add(promptKey)
    into.push(question)
    return true
  }

  ;(["easy", "medium", "hard"] as Difficulty[]).forEach((difficulty) => {
    const want = LESSON_PRACTICE_MIX[difficulty]
    for (const question of byDifficulty[difficulty]) {
      if (pool[difficulty].length >= want) break
      take(question, pool[difficulty])
    }
    if (pool[difficulty].length < want) {
      const generated = generateDrillsByDifficulty(
        sectionId,
        (want - pool[difficulty].length) * 4,
        difficulty,
        seed + difficulty.length,
      )
      for (const question of generated) {
        if (pool[difficulty].length >= want) break
        take(question, pool[difficulty])
      }
    }
    if (pool[difficulty].length < want) {
      const generated = generateDrills(sectionId, (want - pool[difficulty].length) * 6, seed + 7)
      for (const question of generated) {
        if (pool[difficulty].length >= want) break
        take(question, pool[difficulty])
      }
    }
  })

  // Interleave the difficulties so the order alternates by the 10/40/40 target.
  const sequence = chapterDifficultySequence(LESSON_PRACTICE_MIX)
  const cursors: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 }
  const ordered: Question[] = []
  for (const difficulty of sequence) {
    const question = pool[difficulty][cursors[difficulty]]
    if (question) {
      cursors[difficulty] += 1
      ordered.push(question)
    }
  }
  for (const difficulty of ["easy", "medium", "hard"] as Difficulty[]) {
    for (let i = cursors[difficulty]; i < pool[difficulty].length; i++) {
      ordered.push(pool[difficulty][i])
    }
  }

  // Split into per-lesson chunks (contiguous slices of the interleaved order).
  const counts = splitChapterCounts(lessonCount, ordered.length)
  const sets: Question[][] = []
  let pos = 0
  for (const count of counts) {
    sets.push(ordered.slice(pos, pos + count))
    pos += count
  }
  return sets
}

function splitChapterCounts(lessonCount: number, total: number) {
  if (lessonCount <= 0) return []
  const base = Math.floor(total / lessonCount)
  const remainder = total % lessonCount
  return Array.from({ length: lessonCount }, (_, index) => base + (index < remainder ? 1 : 0))
}

function LessonDifficultyBreakdown({ questions }: { questions: Question[] }) {
  if (questions.length === 0) return null
  const counts: Record<Difficulty, number> = {
    easy: questions.filter((q) => q.difficulty === "easy").length,
    medium: questions.filter((q) => q.difficulty === "medium").length,
    hard: questions.filter((q) => q.difficulty === "hard").length,
  }
  const chips: { label: string; value: number; className: string }[] = [
    { label: "Easy", value: counts.easy, className: "bg-success/15 text-[color:var(--success)]" },
    { label: "Medium", value: counts.medium, className: "bg-warning/15 text-warning-foreground" },
    { label: "Hard", value: counts.hard, className: "bg-destructive/10 text-destructive" },
  ]
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {chips
        .filter((chip) => chip.value > 0)
        .map((chip) => (
          <span
            key={chip.label}
            className={cn("rounded-full px-2 py-0.5 text-xs font-medium", chip.className)}
          >
            {chip.value} {chip.label}
          </span>
        ))}
    </div>
  )
}

function LessonStepper({
  total,
  current,
  completedCount,
}: {
  total: number
  current: number
  completedCount: number
}) {
  if (total <= 1) return null
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const done = i < completedCount
        const active = i === current
        return (
          <React.Fragment key={i}>
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-all",
                done
                  ? "border-success/50 bg-success/15 text-[color:var(--success)]"
                  : active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-muted/50 text-muted-foreground",
              )}
            >
              {done ? <Icon name="Check" className="size-3.5" /> : i + 1}
            </div>
            {i < total - 1 ? (
              <div
                className={cn(
                  "h-0.5 flex-1 rounded-full transition-colors",
                  done ? "bg-success/40" : "bg-border",
                )}
              />
            ) : null}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <Icon name="ChevronRight" className="size-4 rotate-180" /> {label}
    </Link>
  )
}

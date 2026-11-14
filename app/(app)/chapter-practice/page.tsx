"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"
import { Icon } from "@/components/app-icon"
import { PageHeader } from "@/app/page-header"
import { QuizRunner } from "@/app/quiz-runner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  canAccessChapterPractice,
  FREE_CHAPTER_PRACTICE_LIMIT,
  lockedCount,
  visibleForPlan,
} from "@/lib/access"
import { getSections } from "@/lib/data/content-catalog"
import { useStore } from "@/lib/store"
import type { SectionId } from "@/lib/types"

export default function ChapterPracticePage() {
  const { state, recordMistake, submitQuiz } = useStore()
  const searchParams = useSearchParams()
  const sections = React.useMemo(() => getSections("general"), [])
  const requestedSection = sections.find((item) => item.id === searchParams.get("section"))
  const [sectionId, setSectionId] = React.useState<SectionId>(requestedSection?.id ?? sections[0]?.id ?? "quant")
  const section = sections.find((s) => s.id === sectionId) ?? sections[0]
  const requestedChapter = section?.chapters.find((item) => item.id === searchParams.get("chapter"))
  const [chapterId, setChapterId] = React.useState(requestedChapter?.id ?? section?.chapters[0]?.id ?? "")
  const chapter = section?.chapters.find((c) => c.id === chapterId) ?? section?.chapters[0]
  const [playing, setPlaying] = React.useState(false)
  const [questions, setQuestions] = React.useState<import("@/lib/types").Question[]>([])
  const [questionsLoading, setQuestionsLoading] = React.useState(false)
  const [questionError, setQuestionError] = React.useState<string | null>(null)
  const [learningRequired, setLearningRequired] = React.useState(false)
  const sectionIndex = sections.findIndex((s) => s.id === sectionId)
  const chapterIndex = section?.chapters.findIndex((c) => c.id === chapterId) ?? -1
  const selectedPathId = chapter?.pathId ?? section?.id
  const selectedPathIndex = section?.chapters
    .filter((item) => (item.pathId ?? section?.id) === selectedPathId)
    .findIndex((item) => item.id === chapter?.id) ?? -1
  const canStartPractice = canAccessChapterPractice(sectionIndex, chapterIndex, state.premium, selectedPathIndex)

  async function startPractice() {
    if (!canStartPractice || questionsLoading) return
    setQuestionsLoading(true)
    setQuestionError(null)
    try {
      const response = await fetch(`/api/content/chapter-practice?company=general&section=${encodeURIComponent(sectionId)}&chapter=${encodeURIComponent(chapterId)}`, { cache: "no-store" })
      const result = await response.json()
      if (!response.ok) {
        setLearningRequired(Boolean(result.learningRequired))
        throw new Error(result.error ?? "Could not load chapter practice.")
      }
      setQuestions(result.questions ?? [])
      setLearningRequired(false)
      setPlaying(true)
    } catch (error) {
      setQuestionError(error instanceof Error ? error.message : "Could not load chapter practice.")
      toast.error(error instanceof Error ? error.message : "Could not load chapter practice.")
    } finally {
      setQuestionsLoading(false)
    }
  }


  if (playing) {
    return (
      <QuizRunner
        key={`general-${sectionId}-${chapterId}`}
        questions={questions}
        onReturn={() => setPlaying(false)}
        returnLabel="Practice setup"
        onMistake={recordMistake}
        onFinish={(results, scorePct) => {
          submitQuiz({ companyId: "general", sectionId, chapterId, results: results.map((result) => ({ topic: result.topic, correct: result.correct })) })
          toast.success(`Chapter practice complete - ${scorePct}%`, {
            description: "Your score and wrong answers were saved to your progress.",
          })
        }}
        doneActions={() => (
          <Button variant="outline" onClick={() => setPlaying(false)}>
            Done
          </Button>
        )}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Focused drills"
        title="Chapter Practice"
        description="Practise placement topics chapter by chapter with focused question sets."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-base">
            <Icon name="BookOpenCheck" className="size-4 text-primary" /> Chapter-wise practice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
            Choose a learning path and chapter to practise the concepts you have studied.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-medium">Section</span>
              <select
                value={section?.id ?? sectionId}
                onChange={(event) => {
                  const nextSectionId = event.target.value as SectionId
                  const nextSection = sections.find((s) => s.id === nextSectionId)
                  setSectionId(nextSectionId)
                  setChapterId(nextSection?.chapters[0]?.id ?? "")
                }}
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-medium">Chapter</span>
              <select
                value={chapter?.id ?? chapterId}
                onChange={(event) => setChapterId(event.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                {(section?.chapters ?? []).map((chapterOption, optionIndex) => {
                  const optionPathId = chapterOption.pathId ?? section?.id
                  const optionPathIndex = section?.chapters
                    .filter((item) => (item.pathId ?? section?.id) === optionPathId)
                    .findIndex((item) => item.id === chapterOption.id) ?? optionIndex
                  const accessible = canAccessChapterPractice(sectionIndex, optionIndex, state.premium, optionPathIndex)
                  return (
                    <option key={chapterOption.id} value={chapterOption.id} disabled={!accessible}>
                      {chapterOption.title}{!accessible ? " - Premium" : ""}
                    </option>
                  )
                })}
              </select>
            </label>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-2xl bg-muted/40 py-8 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Icon name="BookOpenCheck" className="size-7" />
            </span>
            <p className="font-medium">
              {chapter?.title ?? "Selected chapter"} practice set
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {state.premium
                ? "Finish the chapter learning cards and recap first. Then practise with new assessment questions."
                : "Finish the free starter chapter cards first. Premium unlocks the remaining chapters and full practice sets."}
            </p>
            <Button className="mt-1" onClick={startPractice} disabled={!canStartPractice || questionsLoading}>
              {questionsLoading ? "Loading questions…" : "Start chapter practice"} <Icon name="ArrowRight" className="size-4" />
            </Button>
          </div>

          {questionError ? <p role="alert" className="text-sm text-destructive">{questionError}</p> : null}
          {learningRequired ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
              <p className="text-sm">Practice unlocks after you finish every learning card and the recap.</p>
              <Button asChild variant="outline"><Link href={`/learn/general/${sectionId}/${chapterId}`}>Start learning cards <Icon name="ArrowRight" className="size-4" /></Link></Button>
            </div>
          ) : null}
          {!state.premium && !canStartPractice ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 py-6 text-center">
                <Icon name="Lock" className="size-6 text-primary" />
                <p className="font-medium">Unlock every chapter practice set</p>
                <p className="max-w-md text-sm text-muted-foreground">
                  Free gives one focused starting set. Premium opens all sections, all chapters and complete question depth.
                </p>
                <Button asChild className="mt-1">
                  <Link href="/pricing">View Premium plans</Link>
                </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}



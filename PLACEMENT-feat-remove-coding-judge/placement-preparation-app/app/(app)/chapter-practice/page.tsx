"use client"

import Link from "next/link"
import * as React from "react"
import { toast } from "sonner"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { QuizRunner } from "@/components/app/quiz-runner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  canAccessChapterPractice,
  FREE_CHAPTER_PRACTICE_LIMIT,
  FREE_SECTION_INDEX,
  lockedCount,
  premiumPriceLabel,
  visibleForPlan,
} from "@/lib/access"
import {
  chapterPracticeQuestions,
  getSections,
} from "@/lib/data/content"
import { useStore } from "@/lib/store"
import type { SectionId } from "@/lib/types"

export default function ChapterPracticePage() {
  const { state, recordMistake } = useStore()
  const sections = React.useMemo(() => getSections("general"), [])
  const [sectionId, setSectionId] = React.useState<SectionId>(sections[0]?.id ?? "quant")
  const section = sections.find((s) => s.id === sectionId) ?? sections[0]
  const [chapterId, setChapterId] = React.useState(section?.chapters[0]?.id ?? "")
  const chapter = section?.chapters.find((c) => c.id === chapterId) ?? section?.chapters[0]
  const [playing, setPlaying] = React.useState(false)
  const sectionIndex = sections.findIndex((s) => s.id === sectionId)
  const chapterIndex = section?.chapters.findIndex((c) => c.id === chapterId) ?? -1
  const canStartPractice = canAccessChapterPractice(sectionIndex, chapterIndex, state.premium)
  const freeSection = sections[FREE_SECTION_INDEX]
  const freeChapter = freeSection?.chapters[0]

  const allQuestions = React.useMemo(
    () => chapterPracticeQuestions("general", sectionId, chapterId),
    [chapterId, sectionId],
  )
  const questions = canStartPractice
    ? visibleForPlan(allQuestions, state.premium, FREE_CHAPTER_PRACTICE_LIMIT)
    : []
  const hiddenCount = lockedCount(allQuestions.length, questions.length)

  if (playing) {
    return (
      <QuizRunner
        key={`general-${sectionId}-${chapterId}`}
        questions={questions}
        onReturn={() => setPlaying(false)}
        returnLabel="Practice setup"
        onMistake={recordMistake}
        onFinish={(_results, scorePct) => {
          toast.success(`Chapter practice complete - ${scorePct}%`, {
            description: "Wrong answers were saved to your Mistake Notebook.",
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
            Choose a section and chapter, then practise from a deep set of questions across
            easy, medium and advanced levels.
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
                  <option
                    key={s.id}
                    value={s.id}
                    disabled={!canAccessChapterPractice(sections.findIndex((item) => item.id === s.id), 0, state.premium)}
                  >
                    {s.name}
                    {!canAccessChapterPractice(sections.findIndex((item) => item.id === s.id), 0, state.premium)
                      ? " - Premium"
                      : ""}
                  </option>
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
                {(section?.chapters ?? []).map((chapterOption, optionIndex) => (
                  <option
                    key={chapterOption.id}
                    value={chapterOption.id}
                    disabled={!canAccessChapterPractice(sectionIndex, optionIndex, state.premium)}
                  >
                    {chapterOption.title}
                    {!canAccessChapterPractice(sectionIndex, optionIndex, state.premium)
                      ? " - Premium"
                      : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-2xl bg-muted/40 py-8 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Icon name="BookOpenCheck" className="size-7" />
            </span>
            <p className="font-medium">
              {questions.length} practice questions for {chapter?.title ?? "selected chapter"}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {state.premium
                ? "Practise concepts, speed and accuracy with the complete chapter set."
                : `Free practice opens ${freeSection?.name ?? "the first section"} - ${freeChapter?.title ?? "the first chapter"} only.`}
            </p>
            <Button className="mt-1" onClick={() => setPlaying(true)} disabled={!canStartPractice}>
              Start chapter practice <Icon name="ArrowRight" className="size-4" />
            </Button>
          </div>

          {!state.premium && (hiddenCount > 0 || !canStartPractice) ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 py-6 text-center">
                <Icon name="Lock" className="size-6 text-primary" />
                <p className="font-medium">Unlock every chapter practice set</p>
                <p className="max-w-md text-sm text-muted-foreground">
                  Free gives one focused starting set. Premium opens all sections, all chapters and complete question depth.
                </p>
                <Button asChild className="mt-1">
                  <Link href="/settings">Go Premium - {premiumPriceLabel()}</Link>
                </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}



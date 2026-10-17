"use client"

import Link from "next/link"
import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/app/empty-state"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { QuizRunner } from "@/components/app/quiz-runner"
import { useStore } from "@/lib/store"
import {
  boxOf,
  dueForReview,
  dueLabel,
  isDue,
  isMastered,
  MAX_BOX,
  masteryPercent,
} from "@/lib/spaced-repetition"
import { cn } from "@/lib/utils"

type Mode = "idle" | "due" | "all"

export default function MistakesPage() {
  const { state, clearMistake, clearMistakes, reviewMistake } = useStore()
  const [mode, setMode] = React.useState<Mode>("idle")
  const mistakes = React.useMemo(() => state.mistakes ?? [], [state.mistakes])
  const [now] = React.useState(() => Date.now())
  const dueCards = React.useMemo(() => dueForReview(mistakes, now), [mistakes, now])
  const mastery = masteryPercent(mistakes)

  // The active session's question set. A review card uses its own questionId as the
  // question id so QuizRunner's results map straight back to reviewMistake().
  const sessionCards = mode === "due" ? dueCards : mistakes
  const sessionQuestions = sessionCards.map((m) => ({
    id: m.questionId,
    topic: m.topic,
    difficulty: m.difficulty,
    prompt: m.prompt,
    options: m.options,
    answer: m.answer,
    explanation: m.explanation,
  }))

  if (mode !== "idle" && sessionQuestions.length > 0) {
    return (
      <QuizRunner
        questions={sessionQuestions}
        onReturn={() => setMode("idle")}
        returnLabel="Mistakes"
        // No onMistake here: rescheduling (including resets on wrong answers) is
        // handled per-card in onFinish so we don't double-count a lapse.
        onFinish={(results, scorePct) => {
          let promoted = 0
          for (const r of results) {
            if (!r.questionId) continue
            reviewMistake(r.questionId, r.correct)
            if (r.correct) promoted++
          }
          toast.success(
            `Review complete — ${scorePct}%. ${promoted}/${results.length} cards moved up a level.`,
          )
        }}
        doneActions={() => (
          <Button variant="outline" onClick={() => setMode("idle")}>
            Done
          </Button>
        )}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Revision loop"
        title="Mistake Notebook"
        description="Every question you miss becomes a flashcard. Get it right on review and it comes back less often; miss it and it returns fast — so weak areas actually stick."
        actions={
          mistakes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setMode("due")} disabled={dueCards.length === 0}>
                <Icon name="Dumbbell" className="size-4" />
                {dueCards.length > 0 ? `Review due (${dueCards.length})` : "Nothing due"}
              </Button>
              <Button variant="outline" onClick={() => setMode("all")}>
                <Icon name="RefreshCw" className="size-4" /> Review all
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  clearMistakes()
                  toast("Notebook cleared")
                }}
              >
                <Icon name="Trash2" className="size-4" /> Clear all
              </Button>
            </div>
          ) : null
        }
      />

      {mistakes.length === 0 ? (
        <Card>
          <EmptyState
            tone="success"
            icon="CircleCheckBig"
            title="No mistakes saved yet"
            description="When you answer a quiz, daily challenge or mock question incorrectly, it lands here automatically so you can master it."
            action={
              <Button asChild>
                <Link href="/challenges">
                  Try a daily challenge <Icon name="ArrowRight" className="size-4" />
                </Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <ReviewSummary
            total={mistakes.length}
            due={dueCards.length}
            mastery={mastery}
          />
          <div className="space-y-3">
            {mistakes.map((m) => {
              const box = boxOf(m)
              const mastered = isMastered(m)
              const due = isDue(m, now)
              return (
                <Card key={m.questionId}>
                  <CardContent className="space-y-3 pt-5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
                        {m.topic}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 capitalize text-muted-foreground">
                        {m.difficulty}
                      </span>
                      <BoxDots box={box} />
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 font-medium",
                          mastered
                            ? "bg-success/10 text-[color:var(--success)]"
                            : due
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {mastered ? "Mastered" : dueLabel(m, now)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          clearMistake(m.questionId)
                          toast("Removed from notebook")
                        }}
                        className="ml-auto flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
                      >
                        <Icon name="Trash2" className="size-3.5" /> Remove
                      </button>
                    </div>

                    <p className="font-medium">{m.prompt}</p>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {m.options.map((opt, i) => {
                        const isAnswer = i === m.answer
                        const isChosen = i === m.chosen
                        return (
                          <div
                            key={i}
                            className={cn(
                              "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
                              isAnswer && "border-success/50 bg-success/10",
                              isChosen && !isAnswer && "border-destructive/50 bg-destructive/10",
                              !isAnswer && !isChosen && "border-border",
                            )}
                          >
                            <span>{opt}</span>
                            {isAnswer ? (
                              <Icon name="Check" className="size-4 text-[color:var(--success)]" />
                            ) : isChosen ? (
                              <span className="text-xs font-medium text-destructive">your pick</span>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>

                    <div className="rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
                      {m.explanation}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

/** Headline stats for the notebook: how many cards, how many due, overall retention. */
function ReviewSummary({ total, due, mastery }: { total: number; due: number; mastery: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <span className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
            <Icon name="BookMarked" className="size-5" />
          </span>
          <div>
            <p className="text-xl font-semibold tabular-nums">{total}</p>
            <p className="text-xs text-muted-foreground">cards in notebook</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <span
            className={cn(
              "grid size-10 place-items-center rounded-xl",
              due > 0 ? "bg-primary/10 text-primary" : "bg-success/10 text-[color:var(--success)]",
            )}
          >
            <Icon name={due > 0 ? "Dumbbell" : "CircleCheckBig"} className="size-5" />
          </span>
          <div>
            <p className="text-xl font-semibold tabular-nums">{due}</p>
            <p className="text-xs text-muted-foreground">due for review now</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <span className="grid size-10 place-items-center rounded-xl bg-success/10 text-[color:var(--success)]">
            <Icon name="TrendingUp" className="size-5" />
          </span>
          <div>
            <p className="text-xl font-semibold tabular-nums">{mastery}%</p>
            <p className="text-xs text-muted-foreground">retention strength</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/** Leitner box shown as filled/empty dots — a glanceable "how well known" meter. */
function BoxDots({ box }: { box: number }) {
  return (
    <span className="flex items-center gap-1" title={`Leitner box ${box} of ${MAX_BOX}`}>
      {Array.from({ length: MAX_BOX }, (_, i) => (
        <span
          key={i}
          className={cn(
            "size-1.5 rounded-full",
            i < box ? "bg-primary" : "bg-muted-foreground/25",
          )}
        />
      ))}
    </span>
  )
}

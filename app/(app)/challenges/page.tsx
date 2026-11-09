"use client"

import * as React from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { QuizRunner } from "@/components/app/quiz-runner"
import { dailyChallengeQuestions } from "@/lib/data/pyqs"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

type Cat = "general" | "aptitude" | "coding"
const CATS: { key: Cat; label: string; icon: string }[] = [
  { key: "general", label: "Mixed", icon: "BookOpen" },
  { key: "aptitude", label: "Aptitude", icon: "Calculator" },
  { key: "coding", label: "Coding", icon: "Code2" },
]
const MILESTONES = [7, 30, 100]

export default function ChallengesPage() {
  const { state, submitDaily, recordMistake } = useStore()
  const [cat, setCat] = React.useState<Cat>(() => {
    if (typeof window === "undefined") return "general"
    const p = new URLSearchParams(window.location.search).get("cat")
    return p === "general" || p === "aptitude" || p === "coding" ? p : "general"
  })
  const [playing, setPlaying] = React.useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const daily =
    state.daily.date === today
      ? state.daily
      : { general: false, aptitude: false, coding: false }

  const questions = React.useMemo(() => {
    return dailyChallengeQuestions(cat, today)
  }, [cat, today])

  const doneToday = daily[cat]
  const nextMilestone = MILESTONES.find((m) => m > state.streak.count) ?? MILESTONES[MILESTONES.length - 1]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Daily consistency"
        title="Daily Challenge"
        description="A quick set every day keeps your streak alive and earns XP."
      />

      {/* Streak banner */}
      <Card className="overflow-hidden border-warning/30 bg-warning/5">
        <CardContent className="flex items-center gap-4 p-5">
          <span className="grid size-14 place-items-center rounded-lg bg-warning/15">
            <Icon name="CalendarCheck" className="size-7 text-primary" />
          </span>
          <div className="flex-1">
            <p className="font-heading text-2xl font-bold tabular-nums">
              {state.streak.count}-day streak
            </p>
            <p className="text-sm text-muted-foreground">
              {state.streak.count >= 100
                ? "Legendary consistency!"
                : `${nextMilestone - state.streak.count} day${
                    nextMilestone - state.streak.count > 1 ? "s" : ""
                  } to your ${nextMilestone}-day milestone (+XP bonus).`}
            </p>
          </div>
          <div className="hidden gap-1.5 sm:flex">
            {MILESTONES.map((m) => (
              <span
                key={m}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-semibold",
                  state.streak.count >= m
                    ? "bg-success/15 text-[color:var(--success)]"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {m}d
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category tabs */}
      <div className="flex gap-2">
        {CATS.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => {
              setCat(c.key)
              setPlaying(false)
            }}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
              cat === c.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-muted/50",
            )}
          >
            <Icon name={c.icon} className="size-4" />
            {c.label}
            {daily[c.key] ? (
              <Icon name="CircleCheckBig" className="size-4 text-[color:var(--success)]" />
            ) : null}
          </button>
        ))}
      </div>

      {playing ? (
        <QuizRunner
          questions={questions}
          onReturn={() => setPlaying(false)}
          returnLabel="Challenges"
          onMistake={recordMistake}
          onFinish={(results) => {
            const { xpGained } = submitDaily(cat, results)
            toast.success(`Daily challenge done! +${xpGained} XP`)
          }}
          doneActions={() => (
            <Button variant="outline" onClick={() => setPlaying(false)}>
              Done
            </Button>
          )}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base">
              <Icon name={CATS.find((c) => c.key === cat)!.icon} className="size-4" />
              {CATS.find((c) => c.key === cat)!.label} challenge - {questions.length} questions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            {doneToday ? (
              <>
                <span className="grid size-14 place-items-center rounded-2xl bg-success/15 text-[color:var(--success)]">
                  <Icon name="CircleCheckBig" className="size-7" />
                </span>
                <p className="font-medium">Completed today - nice work!</p>
                <p className="text-sm text-muted-foreground">
                  Come back tomorrow, or replay for practice (no extra XP).
                </p>
              </>
            ) : (
              <>
                <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon name="CalendarCheck" className="size-7" />
                </span>
                <p className="font-medium">Ready for today&apos;s {cat} challenge?</p>
                <p className="text-sm text-muted-foreground">
                  +30 XP for completing, plus XP per correct answer.
                </p>
              </>
            )}
            <Button className="mt-1" onClick={() => setPlaying(true)}>
              {doneToday ? "Replay" : "Start challenge"}{" "}
              <Icon name="ArrowRight" className="size-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}



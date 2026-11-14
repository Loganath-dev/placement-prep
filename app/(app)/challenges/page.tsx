"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/app-icon"
import { PageHeader } from "@/app/page-header"
import { QuizRunner } from "@/app/quiz-runner"
import { useStore } from "@/lib/store"
import type { Question } from "@/lib/types"
import { cn } from "@/lib/utils"
import { browserTimeZone, dateKeyInTimeZone, weekStartKeyInTimeZone } from "@/lib/date-keys"

type Period = "daily" | "weekly"
type Challenge = {
  period: Period
  periodKey: string
  plan: string
  questions: Question[]
  completedLessonCount: number
  sourceLessons: Array<{ id: string; title: string; href: string }>
  targetMinutes: number
  submissionToken: string
}


export default function ChallengesPage() {
  const { state, submitDaily, submitWeekly, recordMistake, applyServerRewards } = useStore()
  const [period, setPeriod] = React.useState<Period>("daily")
  const [challenge, setChallenge] = React.useState<Challenge | null>(null)
  const [loadedRequest, setLoadedRequest] = React.useState("")
  const [error, setError] = React.useState("")
  const [playing, setPlaying] = React.useState(false)
  const [reload, setReload] = React.useState(0)
  const [timeZone, setTimeZone] = React.useState("")
  const requestKey = `${period}:${reload}:${timeZone}`

  React.useEffect(() => {
    setTimeZone(browserTimeZone())
  }, [])

  React.useEffect(() => {
    if (!timeZone) return
    let cancelled = false
    fetch(`/api/content/daily-challenge?period=${period}&timeZone=${encodeURIComponent(timeZone)}`, { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json()
        if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : "Could not load your challenge.")
        return body as Challenge
      })
      .then((data) => {
        if (!cancelled) {
          setChallenge(data)
          setError("")
          setLoadedRequest(requestKey)
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Could not load your challenge.")
          setLoadedRequest(requestKey)
        }
      })
    return () => { cancelled = true }
  }, [period, reload, requestKey, timeZone])

  const loading = loadedRequest !== requestKey

  const now = new Date()
  const today = timeZone ? dateKeyInTimeZone(now, timeZone) : ""
  const weekKey = timeZone ? weekStartKeyInTimeZone(now, timeZone) : ""
  const doneToday = Boolean(today) && state.daily.date === today && state.daily.general
  const doneThisWeek = Boolean(weekKey) && state.daily.weeklyDate === weekKey && state.daily.weeklyCompleted === true
  const done = period === "daily" ? doneToday : doneThisWeek
  const nextMilestone = [7, 30, 100].find((milestone) => milestone > state.streak.count) ?? 100

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Practice what you know"
        title="Challenges"
        description="Practise questions only from individual lessons you have passed."
      />

      <Card className="overflow-hidden border-warning/30 bg-warning/5">
        <CardContent className="flex items-center gap-4 p-5">
          <span className="grid size-14 place-items-center rounded-lg bg-warning/15">
            <Icon name="CalendarCheck" className="size-7 text-primary" />
          </span>
          <div className="flex-1">
            <p className="font-heading text-2xl font-bold tabular-nums">{state.streak.count}-day streak</p>
            <p className="text-sm text-muted-foreground">
              {state.streak.count >= 100 ? "Legendary consistency!" : `${nextMilestone - state.streak.count} more day${nextMilestone - state.streak.count === 1 ? "" : "s"} to your ${nextMilestone}-day milestone.`}
            </p>
          </div>
          <span className="hidden rounded-full bg-background px-3 py-1.5 text-sm font-semibold sm:inline-flex">{state.xp.toLocaleString()} XP</span>
        </CardContent>
      </Card>

      <div role="tablist" aria-label="Challenge schedule" className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
        {(["daily", "weekly"] as const).map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={period === item}
            type="button"
            onClick={() => { setPeriod(item); setPlaying(false) }}
            className={cn("flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold capitalize transition-colors", period === item ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            <Icon name={item === "daily" ? "CalendarCheck" : "CalendarDays"} className="size-4" />
            {item} challenge
            {(item === "daily" ? doneToday : doneThisWeek) && <Icon name="CircleCheckBig" className="size-4 text-[color:var(--success)]" />}
          </button>
        ))}
      </div>

      {playing && challenge ? (
        <QuizRunner
          questions={challenge.questions}
          shuffle
          deferGrading
          onReturn={() => setPlaying(false)}
          returnLabel="Challenges"
          onMistake={recordMistake}
          onFinish={(results) => {
            void (async () => {
              try {
                const response = await fetch("/api/learning/reward-submission", {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    submissionToken: challenge.submissionToken,
                    timeZone,
                    answers: results.map((result) => ({ questionId: result.questionId, selected: result.selected, responseText: result.responseText })),
                  }),
                })
                const payload = await response.json()
                if (!response.ok) throw new Error(payload.error || "Could not verify your challenge result.")
                const previousXp = state.xp
                applyServerRewards(payload.rewards)
                const verifiedById = new Map((payload.questionResults ?? []).map((item: { questionId: string; correct: boolean }) => [item.questionId, item.correct]))
                const verifiedResults = results.map((result) => ({ ...result, correct: verifiedById.get(result.questionId ?? "") === true }))
                if (period === "daily") submitDaily("general", verifiedResults)
                else submitWeekly(verifiedResults)
                const gained = Math.max(0, Number(payload.rewards?.xp ?? previousXp) - previousXp)
                toast.success(`${period === "daily" ? "Daily" : "Weekly"} challenge verified · ${payload.score}% · +${gained} XP`)
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Could not verify your challenge result.")
              }
            })()
          }}
          doneActions={() => <Button variant="outline" onClick={() => setPlaying(false)}>Done</Button>}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base">
              <Icon name={period === "daily" ? "CalendarCheck" : "CalendarDays"} className="size-4" />
              Your {period} review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading ? (
              <div role="status" className="py-8 text-center text-sm text-muted-foreground">Building a review from your passed lessons…</div>
            ) : error ? (
              <div className="space-y-3 py-5 text-center"><p role="alert" className="text-sm text-destructive">{error}</p><Button variant="outline" onClick={() => setReload((value) => value + 1)}>Try again</Button></div>
            ) : challenge && challenge.questions.length > 0 ? (
              <>
                <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl bg-primary/5 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Personalized for {challenge.plan}</p>
                    <p className="mt-1 font-heading text-lg font-bold">{challenge.questions.length} questions · about {challenge.targetMinutes} minutes</p>
                    <p className="mt-1 text-sm text-muted-foreground">Questions come only from {challenge.completedLessonCount} lesson{challenge.completedLessonCount === 1 ? "" : "s"} you have already passed.</p>
                  </div>
                  <div className="rounded-lg bg-background px-3 py-2 text-sm font-semibold text-primary">+{period === "daily" ? 30 : 100} XP + correct-answer XP</div>
                </div>
                {challenge.sourceLessons.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Included in this review</p>
                    <div className="flex flex-wrap gap-2">
                      {challenge.sourceLessons.map((lesson) => <Link key={`${lesson.href}:${lesson.id}`} href={`${lesson.href}?lesson=${encodeURIComponent(lesson.id)}`} className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">{lesson.title}</Link>)}
                    </div>
                  </div>
                )}
                <div className="flex flex-col items-center gap-3 border-t pt-5 text-center">
                  {done ? <>
                    <span className="grid size-12 place-items-center rounded-2xl bg-success/15 text-[color:var(--success)]"><Icon name="CircleCheckBig" className="size-6" /></span>
                    <p className="font-medium">You have earned this {period}&apos;s challenge XP.</p>
                    <p className="text-sm text-muted-foreground">Replay to practise; XP is awarded once per {period === "daily" ? "day" : "week"}.</p>
                  </> : <>
                    <p className="font-medium">Ready for your {period} review?</p>
                    <p className="text-sm text-muted-foreground">Finish the set to earn the completion reward and XP for correct answers.</p>
                  </>}
                  <Button className="mt-1" onClick={() => setPlaying(true)}>{done ? "Replay review" : "Start challenge"}<Icon name="ArrowRight" className="size-4" /></Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon name="BookOpen" className="size-7" /></span>
                <p className="font-medium">Pass a lesson to unlock your review.</p>
                <p className="max-w-md text-sm text-muted-foreground">Your challenge includes only questions from lessons you have passed in your personalized {challenge?.plan ?? "learning"} plan. Pass a lesson checkpoint and its questions can appear here.</p>
                <Button asChild className="mt-1"><Link href="/learn">Continue learning<Icon name="ArrowRight" className="size-4" /></Link></Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

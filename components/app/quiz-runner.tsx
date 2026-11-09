"use client"

import Link from "next/link"
import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Icon } from "@/components/app/icon"
import { reportQuestion as reportToQueue } from "@/lib/supabase/db"
import type { Question } from "@/lib/types"
import { cn } from "@/lib/utils"

export interface QuizResultItem {
  questionId?: string
  questionIndex?: number
  prompt?: string
  topic: string
  difficulty?: Question["difficulty"]
  correct: boolean
  selected?: number | null
  answer?: number
  timeSpentSec?: number
  timedOut?: boolean
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

export function QuizRunner({
  questions: rawQuestions,
  passThreshold,
  timeLimitSec,
  shuffle = false,
  onFinish,
  onMistake,
  onReturn,
  returnHref,
  returnLabel = "Return",
  doneActions,
  showExplanations = true,
  passThresholdLabel = "to continue",
}: {
  questions: Question[]
  passThreshold?: number
  passThresholdLabel?: string
  /** When set, shows a countdown and auto-submits when it reaches zero. */
  timeLimitSec?: number
  /** Randomise question order. Stable within a single attempt; reshuffles on retry. */
  shuffle?: boolean
  onFinish?: (results: QuizResultItem[], scorePct: number) => void
  /** Called with the question and the chosen index whenever the answer is wrong. */
  onMistake?: (q: Question, chosen: number) => void
  /** Optional escape hatch for quiz flows embedded inside a page state. */
  onReturn?: () => void
  /** Optional route for quiz flows that should return to another page. */
  returnHref?: string
  returnLabel?: string
  doneActions?: (scorePct: number, passed: boolean) => React.ReactNode
  showExplanations?: boolean
}) {
  // Memoize shuffled order so it stays stable during the attempt.
  // Re-shuffles when `retry()` bumps `shuffleKey`.
  const [shuffleKey, setShuffleKey] = React.useState(0)
  const questions = React.useMemo(
    () => (shuffle ? shuffleArray(rawQuestions) : rawQuestions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shuffle, shuffleKey, rawQuestions],
  )
  const [index, setIndex] = React.useState(0)
  const [selected, setSelected] = React.useState<number | null>(null)
  const [revealed, setRevealed] = React.useState(false)
  const [results, setResults] = React.useState<QuizResultItem[]>([])
  const [finished, setFinished] = React.useState(false)
  const [remaining, setRemaining] = React.useState<number | null>(timeLimitSec ?? null)
  const finishedRef = React.useRef(false)
  const questionStartRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    questionStartRef.current = Date.now()
  }, [])

  // Countdown: tick once per second; auto-submit at zero.
  React.useEffect(() => {
    if (timeLimitSec == null || finished) return
    const id = setTimeout(() => {
      setRemaining((r) => {
        if (r == null) return r
        if (r <= 1) {
          setFinished(true)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearTimeout(id)
  }, [timeLimitSec, finished, remaining])

  const total = questions.length
  const current = questions[index]
  const correctCount = results.filter((r) => r.correct).length
  const scorePct = total ? Math.round((correctCount / total) * 100) : 0
  const passed = passThreshold === undefined ? true : scorePct >= passThreshold

  function check() {
    if (selected === null || revealed) return
    const isCorrect = selected === current.answer
    const startedAt = questionStartRef.current ?? Date.now()
    const timeSpentSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000))
    setResults((r) => [
      ...r,
      {
        questionId: current.id,
        questionIndex: index,
        prompt: current.prompt,
        topic: current.topic,
        difficulty: current.difficulty,
        correct: isCorrect,
        selected,
        answer: current.answer,
        timeSpentSec,
      },
    ])
    if (!isCorrect) onMistake?.(current, selected) // auto-save to the Mistake Notebook
    setRevealed(true)
  }

  function next() {
    if (index + 1 >= total) {
      setFinished(true)
    } else {
      setIndex((i) => i + 1)
      setSelected(null)
      setRevealed(false)
      questionStartRef.current = Date.now()
    }
  }

  function retry() {
    finishedRef.current = false
    setIndex(0)
    setSelected(null)
    setRevealed(false)
    setResults([])
    setFinished(false)
    setRemaining(timeLimitSec ?? null)
    questionStartRef.current = Date.now()
    if (shuffle) setShuffleKey((k) => k + 1)
  }

  const completedResultsForFinish = React.useCallback((): QuizResultItem[] => {
    if (results.length >= total) return results
    const next = [...results]
    const answered = new Set(results.map((result) => result.questionIndex))
    for (let i = 0; i < questions.length; i++) {
      if (answered.has(i)) continue
      const q = questions[i]
      next.push({
        questionId: q.id,
        questionIndex: i,
        prompt: q.prompt,
        topic: q.topic,
        difficulty: q.difficulty,
        correct: false,
        selected: null,
        answer: q.answer,
        timeSpentSec: 0,
        timedOut: true,
      })
    }
    return next.sort((a, b) => (a.questionIndex ?? 0) - (b.questionIndex ?? 0))
  }, [questions, results, total])

  React.useEffect(() => {
    if (finished && !finishedRef.current) {
      finishedRef.current = true
      onFinish?.(completedResultsForFinish(), scorePct)
    }
  }, [completedResultsForFinish, finished, onFinish, scorePct])

  if (finished) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <span
            className={cn(
              "grid size-16 place-items-center rounded-2xl",
              passed ? "bg-success/15 text-[color:var(--success)]" : "bg-warning/15 text-warning-foreground",
            )}
          >
            <Icon name={passed ? "Trophy" : "Target"} className="size-8" />
          </span>
          <div>
            <p className="font-heading text-4xl font-bold tabular-nums">{scorePct}%</p>
            <p className="mt-1 text-muted-foreground">
              {correctCount} of {total} correct
            </p>
          </div>
          {passThreshold !== undefined ? (
            <p
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium",
                passed
                  ? "bg-success/15 text-[color:var(--success)]"
                  : "bg-warning/15 text-warning-foreground",
              )}
            >
              {passed
                ? `Passed - strong attempt`
                : `You need ${passThreshold}% ${passThresholdLabel}`}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <ReturnControl
              href={returnHref}
              onReturn={onReturn}
              label={returnLabel}
              variant="outline"
            />
            <Button variant="outline" onClick={retry}>
              <Icon name="TrendingUp" className="size-4" /> Try again
            </Button>
            {doneActions?.(scorePct, passed)}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex min-w-0 items-center gap-3">
          <ReturnControl href={returnHref} onReturn={onReturn} label={returnLabel} />
          <span>
            Question <span className="font-semibold text-foreground">{index + 1}</span> /{" "}
            {total}
          </span>
        </div>
        <span className="flex items-center gap-3 tabular-nums">
          {remaining != null ? (
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
                remaining <= 30
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-foreground",
              )}
              aria-label="Time remaining"
            >
              <Icon name="Clock" className="size-3.5" /> {formatTime(remaining)}
            </span>
          ) : null}
          <span>{correctCount} correct</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${((index + (revealed ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-lg font-semibold leading-snug">
              {current.prompt}
            </h3>
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                {current.difficulty}
              </span>
            </div>
          </div>
          <div className="grid gap-2">
            {current.options.map((opt, i) => {
              const isAnswer = i === current.answer
              const isPicked = i === selected
              // Flagship questions carry a rationale per option — surfaced on reveal.
              const note = current.optionNotes?.[i]
              return (
                <button
                  key={i}
                  type="button"
                  disabled={revealed}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                    !revealed && isPicked && "border-primary bg-primary/5",
                    !revealed && !isPicked && "border-border hover:bg-muted/60",
                    revealed && isAnswer && "border-success/50 bg-success/10",
                    revealed && isPicked && !isAnswer && "border-destructive/50 bg-destructive/10",
                    revealed && !isAnswer && !isPicked && "border-border opacity-70",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span>{opt}</span>
                    {revealed && note ? (
                      <span
                        className={cn(
                          "mt-1 block text-xs leading-snug",
                          isAnswer
                            ? "text-[color:var(--success)]"
                            : "text-muted-foreground",
                        )}
                      >
                        {note}
                      </span>
                    ) : null}
                  </span>
                  {revealed && isAnswer ? (
                    <Icon name="Check" className="mt-0.5 size-4 shrink-0 text-[color:var(--success)]" />
                  ) : null}
                </button>
              )
            })}
          </div>

          {revealed && showExplanations ? (
            <div className="rounded-xl bg-muted/60 p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <p
                  className={cn(
                    "font-medium",
                    selected === current.answer
                      ? "text-[color:var(--success)]"
                      : "text-destructive",
                  )}
                >
                  {selected === current.answer ? "Correct" : "Not quite."}
                </p>
                <ReportQuestionDialog question={current} />
              </div>

              {/* On a wrong answer, name the specific error and contrast it with the
                  right choice — the teaching moment, not just the model solution. */}
              {selected !== null && selected !== current.answer ? (
                <div className="mt-2 grid gap-1.5">
                  <p className="text-muted-foreground">
                    You chose{" "}
                    <span className="font-medium text-destructive">
                      {current.options[selected]}
                    </span>
                    , but the answer is{" "}
                    <span className="font-medium text-[color:var(--success)]">
                      {current.options[current.answer]}
                    </span>
                    .
                  </p>
                </div>
              ) : null}

              <p className="mt-2 text-muted-foreground">
                <span className="font-medium text-foreground">Why: </span>
                {current.explanation}
              </p>
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            {!revealed ? (
              <Button onClick={check} disabled={selected === null}>
                Check answer
              </Button>
            ) : (
              <Button onClick={next}>
                {index + 1 >= total ? "See result" : "Next question"}
                <Icon name="ChevronRight" className="size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ReturnControl({
  href,
  onReturn,
  label,
  variant = "ghost",
}: {
  href?: string
  onReturn?: () => void
  label: string
  variant?: "ghost" | "outline"
}) {
  if (!href && !onReturn) return null

  const className = cn(
    "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
    variant === "outline"
      ? "border border-border bg-background text-foreground hover:bg-muted/60"
      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
  )
  const content = (
    <>
      <Icon name="ArrowLeft" className="size-4" />
      <span className="hidden sm:inline">{label}</span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={className} aria-label={label} title={label}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onReturn} className={className} aria-label={label} title={label}>
      {content}
    </button>
  )
}

const REPORT_REASONS = [
  "Wrong answer",
  "Unclear explanation",
  "Typo",
  "Outdated pattern",
] as const

/** Collects a reason (+ optional note) before filing a question report. */
function ReportQuestionDialog({ question }: { question: Question }) {
  const [open, setOpen] = React.useState(false)
  const [reason, setReason] = React.useState<string | null>(null)
  const [note, setNote] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  function reset() {
    setReason(null)
    setNote("")
  }

  async function submit() {
    if (!reason || submitting) return
    setSubmitting(true)
    const detail = note.trim() ? `${reason} - ${note.trim().slice(0, 300)}` : reason
    await reportToQueue(question.id, question.prompt, detail)
    setSubmitting(false)
    setOpen(false)
    reset()
    toast.success("Thanks - we'll review this question.", {
      description: "Your report helps us keep the bank accurate.",
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) reset()
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          title="Report a problem with this question"
        >
          <Icon name="Flag" className="size-3.5" /> Report
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this question</DialogTitle>
          <DialogDescription>
            What&apos;s wrong with it? This goes to our content team for review.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          {REPORT_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                reason === r
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted/50",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={300}
          rows={3}
          aria-label="Additional details (optional)"
          placeholder="Add a note (optional)"
          className="w-full resize-none rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={submitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={submit} disabled={!reason || submitting}>
            {submitting ? "Sending..." : "Submit report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



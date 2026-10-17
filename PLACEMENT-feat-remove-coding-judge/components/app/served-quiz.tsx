"use client"

import * as React from "react"
import { toast } from "sonner"
import { Icon } from "@/components/app/icon"
import { QuizRunner } from "@/components/app/quiz-runner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useStoreActions } from "@/lib/store"
import type { Difficulty, Question } from "@/lib/types"

interface ServedRow {
  id: string
  topic: string
  difficulty: string
  prompt: string
  options: string[]
  answer: number
  explanation: string
  option_notes?: string[] | null
  curated?: boolean
  tier?: "free" | "premium"
}

function toQuestion(row: ServedRow): Question {
  return {
    id: row.id,
    topic: row.topic,
    difficulty: (row.difficulty as Difficulty) ?? "medium",
    prompt: row.prompt,
    options: row.options,
    answer: row.answer,
    explanation: row.explanation,
    curated: row.curated,
    optionNotes: row.option_notes ?? undefined,
  }
}

/**
 * A practice surface served entirely from the content datastore via
 * /api/questions. Premium questions are returned only to entitled viewers by the
 * server (never the bundle), so this content is genuinely behind the paywall.
 * Unlike the bundled PYQ bank, nothing here ships to a free client.
 */
export function ServedQuiz({ section, company }: { section?: string; company?: string }) {
  const { recordMistake } = useStoreActions()
  const [state, setState] = React.useState<
    | { status: "loading" }
    | { status: "error" }
    | { status: "ready"; questions: Question[]; premium: boolean }
  >({ status: "loading" })
  const [playing, setPlaying] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams()
    if (section && section !== "all") params.set("section", section)
    if (company) params.set("company", company)
    params.set("limit", "20")

    fetch(`/api/questions?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { questions: ServedRow[]; premium: boolean }) => {
        if (cancelled) return
        setState({
          status: "ready",
          questions: (data.questions ?? []).map(toQuestion),
          premium: Boolean(data.premium),
        })
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" })
      })

    return () => {
      cancelled = true
    }
  }, [section, company])

  if (playing && state.status === "ready") {
    return (
      <QuizRunner
        key={`served-${company ?? "all"}-${section ?? "all"}`}
        questions={state.questions}
        onReturn={() => setPlaying(false)}
        returnLabel="Back"
        onMistake={recordMistake}
        onFinish={(_results, scorePct) =>
          toast.success(`Bank practice complete - ${scorePct}%`, {
            description: "Wrong answers were saved to your Mistake Notebook.",
          })
        }
      />
    )
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 font-heading text-base">
          <Icon name="BadgeCheck" className="size-4 text-primary" /> StudyBench bank
        </CardTitle>
      </CardHeader>
      <CardContent>
        {state.status === "loading" ? (
          <div className="space-y-2">
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        ) : state.status === "error" ? (
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t reach the question bank. Check your connection and try again.
          </p>
        ) : state.questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This bank is being populated for this section. Check back soon.
          </p>
        ) : (
          <Button onClick={() => setPlaying(true)}>
            <Icon name="Play" className="size-4" /> Start {state.questions.length}-question set
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

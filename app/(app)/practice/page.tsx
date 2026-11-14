"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import * as React from "react"
import { Icon } from "@/components/app-icon"
import { PageHeader } from "@/app/page-header"
import { CompanyAvatar } from "@/app/ui-bits"
import { CompanyPicker } from "@/app/company-picker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { COMPANY_BY_ID, getCompany } from "@/lib/data/companies"
import { SECTION_META } from "@/lib/data/content-catalog"
import type { PYQ } from "@/lib/data/pyqs"
import { lockedCount } from "@/lib/access"
import { useStore } from "@/lib/store"
import type { CompanyId } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function PracticePage() {
  const { state, recordMistake } = useStore()
  const searchParams = useSearchParams()
  const queryCompany = companyFromParam(searchParams.get("company"))
  const [selectedCompany, setSelectedCompany] = React.useState<CompanyId | null>(null)
  const [section, setSection] = React.useState<string>("all")
  const [difficulty, setDifficulty] = React.useState<string>("all")
  const [kind, setKind] = React.useState<string>("all")
  const [questions, setQuestions] = React.useState<(PYQ & { company: CompanyId })[]>([])
  const [totalCount, setTotalCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const company = selectedCompany ?? queryCompany ?? state.primary ?? "general"
  const c = getCompany(company)

  // PYQ content is server-only. Fetch the filtered, entitlement-limited result
  // through the existing API instead of importing the content bank into the browser.
  React.useEffect(() => {
    const controller = new AbortController()
    async function loadQuestions() {
      setLoading(true)
      setLoadError(null)
      const params = new URLSearchParams({ company, section, difficulty, kind })
      try {
        const response = await fetch(`/api/content/pyqs?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || "Unable to load practice questions.")
        setQuestions(payload.questions ?? [])
        setTotalCount(payload.totalCount ?? 0)
      } catch (error) {
        if (controller.signal.aborted) return
        setLoadError(error instanceof Error ? error.message : "Unable to load practice questions.")
        setQuestions([])
        setTotalCount(0)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void loadQuestions()
    return () => controller.abort()
  }, [company, section, difficulty, kind])

  const visible = questions
  const hiddenCount = lockedCount(totalCount, visible.length)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Practice"
        title="Practice library"
        description="Build your skills with focused practice questions and topic revision. Previous-year questions are identified separately only when their paper and year are verified."
      />

      <CompanyPicker
        value={company}
        onChange={(id) => {
          setSelectedCompany(id)
          setSection("all")
          setDifficulty("all")
          setKind("all")
        }}
      />

      {c.eligibility ? (
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <CompanyAvatar id={company} size={40} />
            <div className="flex-1">
              <CardTitle className="font-heading text-base">{c.name} eligibility</CardTitle>
              <p className="text-xs text-muted-foreground">
                Criteria may vary by year, role and campus.
              </p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Fact label="Academics" value={c.eligibility.cgpa} />
            <Fact label="Backlogs" value={c.eligibility.backlogs} />
            <Fact label="10th / 12th" value={c.eligibility.tenthTwelfth} />
            <Fact label="Rounds" value={c.eligibility.rounds.join(" -> ")} />
            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Test pattern
              </p>
              <ul className="mt-1 space-y-1 text-sm">
                {c.eligibility.pattern.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <Icon name="ChevronRight" className="mt-0.5 size-4 text-primary" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Select value={section} onValueChange={setSection}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sections</SelectItem>
            {SECTION_META.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All difficulty</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All practice types</SelectItem>
            <SelectItem value="verified_previous_year">Verified previous-year questions</SelectItem>
            <SelectItem value="company_pattern_practice">Practice questions</SelectItem>
            <SelectItem value="topic_revision">Topic revision</SelectItem>
            <SelectItem value="mock_question">Mock questions</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {visible.length} question{visible.length === 1 ? "" : "s"}
        </span>
      </div>

      {loading ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Loading practice questions…</CardContent></Card>
      ) : loadError ? (
        <Card><CardContent className="py-10 text-center text-sm text-destructive">{loadError}</CardContent></Card>
      ) : visible.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Icon name="SearchX" className="size-9 text-muted-foreground" />
            <p className="font-medium">No practice questions match these filters</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try a broader section, content type or difficulty to continue practice.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((q) => (
            <PyqItem key={q.id} q={q} onMistake={recordMistake} />
          ))}
        </div>
      )}

      {!state.premium && hiddenCount > 0 ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <Icon name="Lock" className="size-7 text-primary" />
            <p className="font-medium">Unlock the complete PYQ bank</p>
            <p className="text-sm text-muted-foreground">
              Practise company-wise questions with clear explanations.
            </p>
            <Button asChild className="mt-1">
              <Link href="/pricing">View Premium plans</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function companyFromParam(value: string | null): CompanyId | null {
  if (!value || !(value in COMPANY_BY_ID)) return null
  return value as CompanyId
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  )
}

function PyqItem({
  q,
  onMistake,
}: {
  q: PYQ & { company: CompanyId }
  onMistake: (q: PYQ, chosen: number) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<number | null>(null)
  const meta = SECTION_META.find((s) => s.id === q.section)
  const answered = selected !== null
  const revealed = answered
  const selectedCorrect = selected === q.answer

  function markAnswer(index: number) {
    if (answered) return
    setSelected(index)
    setOpen(true)
    if (index !== q.answer) onMistake(q, index)
  }

  function resetAnswer() {
    setSelected(null)
    setOpen(false)
  }

  return (
    <Card>
      <CardContent className="space-y-3 pt-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
            {meta?.short}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 capitalize text-muted-foreground">
            {q.difficulty}
          </span>
          <span className="text-muted-foreground">{q.topic}</span>
          <span className="rounded-full bg-primary/5 px-2 py-0.5 font-medium text-primary">
            {q.contentKind === "verified_previous_year" ? `Verified ${q.year} PYQ` :
              q.contentKind === "company_pattern_practice" ? "Practice question" :
              q.contentKind === "mock_question" ? "Mock question" : "Topic revision"}
          </span>
        </div>
        <p className="font-medium">{q.prompt}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {q.options.map((opt, i) => {
            const isAnswer = i === q.answer
            const isPicked = i === selected
            return (
              <button
                key={i}
                type="button"
                disabled={answered}
                aria-pressed={isPicked}
                onClick={() => markAnswer(i)}
                className={cn(
                  "flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                  !revealed && "border-border hover:bg-muted/55",
                  !revealed && isPicked && "border-primary bg-primary/5",
                  revealed && isAnswer && "border-success/50 bg-success/10 text-foreground",
                  revealed && isPicked && !isAnswer && "border-destructive/50 bg-destructive/10 text-foreground",
                  revealed && !isPicked && !isAnswer && "border-border opacity-70",
                )}
              >
                <span>{opt}</span>
                {revealed && isAnswer ? (
                  <Icon name="Check" className="size-4 shrink-0 text-[color:var(--success)]" />
                ) : revealed && isPicked ? (
                  <Icon name="X" className="size-4 shrink-0 text-destructive" />
                ) : null}
              </button>
            )
          })}
        </div>
        {answered ? (
          <div
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-medium",
              selectedCorrect
                ? "bg-success/10 text-[color:var(--success)]"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {selectedCorrect
              ? "Correct answer marked."
              : "Wrong answer marked and saved to Mistake Notebook."}
          </div>
        ) : null}
        {answered ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
              {open ? "Hide solution" : "Show solution"}
            </Button>
            <Button variant="outline" size="sm" onClick={resetAnswer}>
              Try again
            </Button>
          </div>
        ) : null}
        {answered && open ? (
          <div className="rounded-xl bg-muted/60 p-3 text-sm">
            <p className="text-muted-foreground">{q.explanation}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}



"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import * as React from "react"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { CompanyAvatar } from "@/components/app/ui-bits"
import { CompanyPicker } from "@/components/app/company-picker"
import { ServedQuiz } from "@/components/app/served-quiz"
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
import { SECTION_META } from "@/lib/data/content"
import { pyqsForCompany, type PYQ } from "@/lib/data/pyqs"
import {
  FREE_PYQ_LIMIT,
  lockedCount,
  premiumPriceLabel,
  visibleForPlan,
} from "@/lib/access"
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
  const [year, setYear] = React.useState<string>("all")
  const [faOnly, setFaOnly] = React.useState(false)
  const company = selectedCompany ?? queryCompany ?? state.primary ?? "general"

  const c = getCompany(company)
  const all = React.useMemo(() => pyqsForCompany(company), [company])
  const years = React.useMemo(
    () => [...new Set(all.map((q) => q.year))].sort((a, b) => b - a),
    [all],
  )
  const list = React.useMemo(() => {
    let next = all
    if (section !== "all") next = next.filter((q) => q.section === section)
    if (difficulty !== "all") next = next.filter((q) => q.difficulty === difficulty)
    if (year !== "all") next = next.filter((q) => String(q.year) === year)
    if (faOnly) next = next.filter((q) => q.frequentlyAsked)
    return next
  }, [all, difficulty, faOnly, section, year])

  const visible = React.useMemo(
    () => visibleForPlan(list, state.premium, FREE_PYQ_LIMIT),
    [list, state.premium],
  )
  const hiddenCount = lockedCount(list.length, visible.length)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pattern practice"
        title="Practice PYQs"
        description="Previous-year style questions by company, rewritten for practice in each test pattern."
      />

      <CompanyPicker
        value={company}
        onChange={(id) => {
          setSelectedCompany(id)
          setSection("all")
          setDifficulty("all")
          setYear("all")
          setFaOnly(false)
        }}
      />

      <ServedQuiz section={section} company={company} />

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
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type="button"
          onClick={() => setFaOnly((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            faOnly ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted/50",
          )}
        >
          <Icon name="Star" className="size-3.5" /> Frequently asked
        </button>
        <span className="text-sm text-muted-foreground">
          {list.length} question{list.length === 1 ? "" : "s"}
        </span>
      </div>

      {visible.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Icon name="SearchX" className="size-9 text-muted-foreground" />
            <p className="font-medium">No PYQs match these filters</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try a broader section, year or difficulty to continue practice.
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
              Practise the full company-wise question bank with explanations.
            </p>
            <Button asChild className="mt-1">
              <Link href="/settings">Go Premium - {premiumPriceLabel()}</Link>
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
          {q.frequentlyAsked ? (
            <span className="flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 font-medium text-warning-foreground">
              <Icon name="Star" className="size-3" /> Frequently asked
            </span>
          ) : null}
          <span className="ml-auto text-muted-foreground">~{q.year} pattern</span>
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



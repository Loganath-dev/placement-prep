"use client"

import { useSearchParams } from "next/navigation"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { CompanyAvatar } from "@/components/app/ui-bits"
import { CompanyPicker } from "@/components/app/company-picker"
import { LockedFeatureCard } from "@/components/app/upgrade-prompt"
import { FREE_CODING_PROBLEM_LIMIT, visibleForPlan } from "@/lib/access"
import { COMPANY_BY_ID, getCompany } from "@/lib/data/companies"
import { codingProblemsForCompany } from "@/lib/data/coding-problems"
import { useStore } from "@/lib/store"
import type { CodingAttempt, CodingProblem, CompanyId } from "@/lib/types"

export default function CodingPage() {
  const { state, recordCodingAttempt } = useStore()
  const searchParams = useSearchParams()
  const queryCompany = companyFromParam(searchParams.get("company"))
  const [selectedCompany, setSelectedCompany] = React.useState<CompanyId | null>(null)
  const [openId, setOpenId] = React.useState<string | null>(null)
  const company = selectedCompany ?? queryCompany ?? state.primary ?? "general"

  const companyInfo = getCompany(company)
  const problems = React.useMemo(() => codingProblemsForCompany(company), [company])
  const attemptsByProblem = React.useMemo(() => {
    const map = new Map<string, CodingAttempt>()
    for (const attempt of state.codingAttempts) {
      const current = map.get(attempt.problemId)
      if (!current || attempt.ts > current.ts) {
        map.set(attempt.problemId, attempt)
      }
    }
    return map
  }, [state.codingAttempts])

  const visibleProblems = visibleForPlan(problems, state.premium, FREE_CODING_PROBLEM_LIMIT)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Problem solving"
        title="Coding Practice"
        description="Original coding questions explained like an experienced interviewer would: understand the ask first, then reveal the logic."
      />

      <CompanyPicker
        value={company}
        onChange={(id) => {
          setSelectedCompany(id)
          setOpenId(null)
        }}
      />

      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <CompanyAvatar id={company} size={40} />
          <div className="flex-1">
            <p className="font-heading font-semibold">{companyInfo.name} coding ladder</p>
            <p className="text-sm text-muted-foreground">Read the question, understand what it is testing, then study the logic.</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {visibleProblems.map((problem) => (
          <ProblemCard
            key={problem.id}
            problem={problem}
            open={openId === problem.id}
            companyId={company}
            lastAttempt={attemptsByProblem.get(problem.id)}
            onAttempt={(passed, total) =>
              recordCodingAttempt({
                problemId: problem.id,
                title: problem.title,
                companyId: company,
                passed,
                total,
                ts: Date.now(),
              })
            }
            onToggle={() => setOpenId((id) => (id === problem.id ? null : problem.id))}
          />
        ))}
      </div>
      {!state.premium && problems.length > visibleProblems.length ? (
        <LockedFeatureCard
          title="More coding practice is available"
          description="Try the starter questions first. Full access adds the remaining company-wise coding questions."
          cta="See full access"
        />
      ) : null}
    </div>
  )
}

function companyFromParam(value: string | null): CompanyId | null {
  if (!value || !(value in COMPANY_BY_ID)) return null
  return value as CompanyId
}

function ProblemCard({
  problem,
  open,
  companyId,
  lastAttempt,
  onAttempt,
  onToggle,
}: {
  problem: CodingProblem
  open: boolean
  companyId: CompanyId
  lastAttempt?: { passed: number; total: number }
  onAttempt: (passed: number, total: number) => void
  onToggle: () => void
}) {
  const [logicRevealed, setLogicRevealed] = React.useState(false)
  const explanation = React.useMemo(() => explainQuestion(problem), [problem])
  const logicSteps = React.useMemo(() => logicOptions(problem), [problem])

  function handleShowLogic() {
    setLogicRevealed(true)
    onAttempt(0, 1) // Count as an attempt
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{problem.level}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground capitalize">{problem.difficulty}</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Icon name="Clock" className="size-3.5" /> {problem.estimatedMinutes} min
          </span>
          {problem.topics.slice(0, 2).map((t) => (
            <span key={t} className="rounded-full bg-muted/80 px-2 py-0.5 text-muted-foreground">#{t}</span>
          ))}
          {problem.companyId && problem.companyId !== companyId ? (
            <span className="rounded-full bg-warning/10 px-2 py-0.5 font-medium text-warning-foreground">
              {getCompany(problem.companyId).short} pattern
            </span>
          ) : null}
          {lastAttempt ? (
            <span className="rounded-full bg-success/10 px-2 py-0.5 font-medium text-[color:var(--success)]">
              logic viewed
            </span>
          ) : null}
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="font-heading text-base">{problem.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{problem.prompt}</p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted/50"
          >
            {open ? "Hide" : "Open"}
          </button>
        </div>
      </CardHeader>
      {open ? (
        <CardContent className="space-y-4">
          <StudyBlock
            icon="FileText"
            title="Question"
            text={problem.prompt}
          />
          <StudyBlock
            icon="MessagesSquare"
            title="Question Explanation"
            text={explanation}
          />

          {!logicRevealed ? (
            <Button className="w-full" variant="outline" onClick={handleShowLogic}>
              <Icon name="Lightbulb" className="size-4" /> Show Logic
            </Button>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon name="Lightbulb" className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-primary">Detailed Logic</p>
                  <ol className="mt-3 space-y-2 text-muted-foreground">
                    {logicSteps.map((step, index) => (
                      <li key={step} className="flex gap-2">
                        <span className="font-medium text-foreground">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>

                </div>
              </div>
            </div>
          )}
        </CardContent>
      ) : null}
    </Card>
  )
}

function StudyBlock({
  icon,
  title,
  text,
}: {
  icon: React.ComponentProps<typeof Icon>["name"]
  title: string
  text: string
}) {
  return (
    <div className="rounded-xl border border-border p-4 text-sm">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-lg bg-muted p-2 text-muted-foreground">
          <Icon name={icon} className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="font-medium">{title}</p>
          <p className="mt-1 leading-6 text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  )
}

function explainQuestion(problem: CodingProblem): string {
  const topicText = humanList(problem.topics.slice(0, 3))
  return `This question is asking you to transform the given input into one exact output by applying ${topicText}. In an interview, first identify what must be counted, compared, accumulated, or rearranged. Then choose the simplest approach that satisfies the limits: ${problem.constraints.join("; ")}.`
}

function logicOptions(problem: CodingProblem): string[] {
  return [
    `Restate the task in your own words: ${problem.prompt}`,
    `Identify the input shape: ${problem.inputFormat} The required result is: ${problem.outputFormat}`,
    `Choose the core technique from the topic tags: ${humanList(problem.topics)}.`,
    problem.editorial,
    `Validate edge cases from the constraints: ${problem.constraints.join("; ")}.`,
    "Finish by returning or printing exactly the required output format. Avoid extra words, extra spaces, and partial answers.",
  ]
}

function humanList(items: string[]): string {
  if (items.length === 0) return "basic implementation"
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`
}

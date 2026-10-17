"use client"

import { javascript } from "@codemirror/lang-javascript"
import CodeMirror from "@uiw/react-codemirror"
import { useSearchParams } from "next/navigation"
import * as React from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { CompanyAvatar } from "@/components/app/ui-bits"
import { CompanyPicker } from "@/components/app/company-picker"
import { LockedFeatureCard } from "@/components/app/upgrade-prompt"
import { FREE_CODING_PROBLEM_LIMIT, visibleCodingTestsForPlan, visibleForPlan } from "@/lib/access"
import {
  CODING_TIMEOUT_MS,
  CODING_WORKER_SOURCE,
  normalizeCodingOutput,
} from "@/lib/coding-runner"
import { COMPANY_BY_ID, getCompany } from "@/lib/data/companies"
import { codingProblemsForCompany } from "@/lib/data/coding-problems"
import {
  codingFeedback,
  solveSignature,
  studentHint,
  type CodingRunResult,
} from "@/lib/domain/coding-practice"
import { useStore } from "@/lib/store"
import type {
  CodingAttempt,
  CodingProblem,
  CodingTestCase,
  CompanyId,
} from "@/lib/types"

let codingWorkerUrl: string | null = null

function getCodingWorkerUrl() {
  if (!codingWorkerUrl) {
    const blob = new Blob([CODING_WORKER_SOURCE], { type: "text/javascript" })
    codingWorkerUrl = URL.createObjectURL(blob)
  }
  return codingWorkerUrl
}

export default function CodingPage() {
  const { state, recordCodingAttempt } = useStore()
  const searchParams = useSearchParams()
  const queryCompany = companyFromParam(searchParams.get("company"))
  const [selectedCompany, setSelectedCompany] =
    React.useState<CompanyId | null>(null)
  const [openId, setOpenId] = React.useState<string | null>(null)
  const company = selectedCompany ?? queryCompany ?? state.primary ?? "general"

  const companyInfo = getCompany(company)
  const problems = React.useMemo(
    () => codingProblemsForCompany(company),
    [company]
  )
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
        description="Original problems with sample cases, constraints and step-by-step editorials to study and dry-run."
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
            <p className="font-heading font-semibold">
              {companyInfo.name} coding ladder
            </p>
            <p className="text-sm text-muted-foreground">
              Practise the problem types most useful for this track.
            </p>
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
            premium={state.premium}
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
            onToggle={() =>
              setOpenId((id) => (id === problem.id ? null : problem.id))
            }
          />
        ))}
      </div>
      {!state.premium && problems.length > visibleProblems.length ? (
        <LockedFeatureCard
          title="More coding practice is available"
          description="Try the starter problems first. Full access adds the remaining company-wise problems and hidden edge cases."
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
  premium,
  lastAttempt,
  onAttempt,
  onToggle,
}: {
  problem: CodingProblem
  open: boolean
  companyId: CompanyId
  premium: boolean
  lastAttempt?: { passed: number; total: number }
  onAttempt: (passed: number, total: number) => void
  onToggle: () => void
}) {
  const [attempted, setAttempted] = React.useState(Boolean(lastAttempt))
  const visibleTests = React.useMemo(
    () => problem.testCases.filter((tc) => !tc.hidden),
    [problem.testCases]
  )
  const availableTests = React.useMemo(
    () => visibleCodingTestsForPlan(problem.testCases, premium),
    [premium, problem.testCases]
  )
  const hiddenTestCount = problem.testCases.length - visibleTests.length
  const editorialUnlocked = attempted || Boolean(lastAttempt)

  async function copyStarterCode() {
    try {
      await navigator.clipboard.writeText(problem.starterCode)
      toast.success("Starter code copied")
    } catch {
      toast.error("Could not copy code")
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
            {problem.level}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground capitalize">
            {problem.difficulty}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Icon name="Clock" className="size-3.5" />{" "}
            {problem.estimatedMinutes} min
          </span>
          {problem.topics.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded-full bg-muted/80 px-2 py-0.5 text-muted-foreground"
            >
              #{t}
            </span>
          ))}
          {problem.companyId && problem.companyId !== companyId ? (
            <span className="rounded-full bg-warning/10 px-2 py-0.5 font-medium text-warning-foreground">
              {getCompany(problem.companyId).short} pattern
            </span>
          ) : null}
          {lastAttempt ? (
            <span className="rounded-full bg-success/10 px-2 py-0.5 font-medium text-[color:var(--success)]">
              last run {lastAttempt.passed}/{lastAttempt.total}
            </span>
          ) : null}
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="font-heading text-base">
              {problem.title}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {problem.prompt}
            </p>
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
          <div className="grid gap-3 md:grid-cols-2">
            <InfoBlock title="Input" text={problem.inputFormat} />
            <InfoBlock title="Output" text={problem.outputFormat} />
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
            <p className="font-medium">How to read this problem</p>
            <p className="mt-1 text-muted-foreground">{studentHint(problem)}</p>
            <p className="mt-2 font-mono text-xs text-primary">
              {solveSignature(problem)}
            </p>
          </div>
          <div className="grid gap-2 rounded-xl border border-border p-3 text-sm md:grid-cols-3">
            <StepHint
              icon="ScanLine"
              title="1. Read"
              text="Match the sample input to the function arguments."
            />
            <StepHint
              icon="Code2"
              title="2. Return"
              text="Return the answer from solve, or print it with console.log."
            />
            <StepHint
              icon="Play"
              title="3. Run"
              text="Pass visible samples, then check one edge case yourself."
            />
          </div>
          <div>
            <p className="text-sm font-medium">Constraints</p>
            <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
              {problem.constraints.map((constraint) => (
                <li key={constraint}>- {constraint}</li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2">
              <p className="text-sm font-medium">Starter code</p>
              <Button variant="ghost" size="sm" onClick={copyStarterCode}>
                <Icon name="Copy" className="size-3.5" /> Copy
              </Button>
            </div>
            <pre className="overflow-x-auto bg-muted p-3 text-sm">
              <code>{problem.starterCode}</code>
            </pre>
          </div>
          <BrowserJsRunner
            problem={problem}
            tests={availableTests}
            companyId={companyId}
            onAttempt={(passed, total) => {
              setAttempted(true)
              onAttempt(passed, total)
            }}
          />
          <div className="grid gap-3 md:grid-cols-2">
            {availableTests.map((tc, i) => (
              <div
                key={i}
                className="rounded-xl border border-border p-3 text-sm"
              >
                <p className="font-medium">
                  {tc.hidden ? "Premium edge case" : "Sample"} {i + 1}
                </p>
                <p className="mt-2 text-muted-foreground">Input</p>
                <pre className="rounded-lg bg-muted p-2 whitespace-pre-wrap">
                  {tc.input}
                </pre>
                <p className="mt-2 text-muted-foreground">Output</p>
                <pre className="rounded-lg bg-muted p-2 whitespace-pre-wrap">
                  {tc.output}
                </pre>
              </div>
            ))}
          </div>
          {!premium && hiddenTestCount > 0 ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
              <p className="flex items-center gap-1.5 font-medium">
                <Icon name="Lock" className="size-4 text-primary" />
                {hiddenTestCount} premium edge case
                {hiddenTestCount === 1 ? "" : "s"} locked
              </p>
              <p className="mt-1 text-muted-foreground">
                Upgrade to run the extra edge cases used to check
                interview-level correctness.
              </p>
            </div>
          ) : null}
          <div className="rounded-xl border border-border p-3 text-sm">
            <p className="flex items-center gap-1.5 font-medium">
              <Icon name="Terminal" className="size-4 text-primary" /> After
              samples pass
            </p>
            <ol className="mt-2 space-y-1 text-muted-foreground">
              <li>
                1. Add edge cases for empty input, single item, duplicates and
                large values.
              </li>
              <li>2. Check time complexity against the constraint size.</li>
              <li>
                3. Compare your approach with the editorial after solving.
              </li>
            </ol>
          </div>
          {editorialUnlocked ? (
            <div className="rounded-xl bg-muted/60 p-3 text-sm">
              <p className="font-medium">Student explanation</p>
              <p className="mt-1 text-muted-foreground">{problem.editorial}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
              <p className="flex items-center gap-1.5 font-medium">
                <Icon name="Lock" className="size-4 text-primary" /> Editorial
                locked
              </p>
              <p className="mt-1 text-muted-foreground">
                Run the available cases once to unlock the explanation.
              </p>
            </div>
          )}
        </CardContent>
      ) : null}
    </Card>
  )
}

type RunResult = CodingRunResult

function BrowserJsRunner({
  problem,
  tests,
  companyId,
  onAttempt,
}: {
  problem: CodingProblem
  tests: CodingTestCase[]
  companyId: CompanyId
  onAttempt: (passed: number, total: number) => void
}) {
  const [code, setCode] = React.useState(problem.starterCode)
  const [running, setRunning] = React.useState(false)
  const [results, setResults] = React.useState<RunResult[]>([])
  const mountedRef = React.useRef(true)
  const runSeq = React.useRef(0)
  const { resolvedTheme } = useTheme()

  React.useEffect(() => {
    return () => {
      mountedRef.current = false
      runSeq.current += 1
    }
  }, [])

  async function runSamples() {
    const runId = runSeq.current + 1
    runSeq.current = runId
    setRunning(true)
    setResults([])
    const next: RunResult[] = []
    for (let i = 0; i < tests.length; i++) {
      const result = await runOneTest(code, tests[i], i)
      if (!mountedRef.current || runSeq.current !== runId) return
      next.push(result)
    }
    if (!mountedRef.current || runSeq.current !== runId) return
    setResults(next)
    setRunning(false)
    const passed = next.filter((result) => result.status === "passed").length
    onAttempt(passed, next.length)
    if (passed === next.length) toast.success("All visible samples passed")
    else toast.error(`${passed}/${next.length} samples passed`)
  }

  function resetCode() {
    setCode(problem.starterCode)
    setResults([])
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/50 px-3 py-2">
        <div>
          <p className="text-sm font-medium">Code practice runner</p>
          <p className="text-xs text-muted-foreground">
            JavaScript only. Available cases run in your browser.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetCode}
            disabled={running}
          >
            <Icon name="RotateCcw" className="size-3.5" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={runSamples}
            disabled={running || tests.length === 0}
          >
            <Icon name="Play" className="size-3.5" />
            {running ? "Running..." : "Run cases"}
          </Button>
        </div>
      </div>
      <div
        className="min-h-56 [&_.cm-editor]:min-h-56 [&_.cm-editor]:outline-none [&_.cm-scroller]:font-mono [&_.cm-scroller]:text-sm"
        role="group"
        aria-label={`Code editor for ${problem.title}`}
      >
        <CodeMirror
          value={code}
          onChange={(value) => setCode(value)}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          extensions={[javascript()]}
          basicSetup={{ closeBrackets: true, autocompletion: true }}
        />
      </div>
      {results.length > 0 ? (
        <div className="grid gap-2 border-t border-border bg-muted/25 p-3">
          <div className="rounded-lg bg-background p-2 text-xs text-muted-foreground ring-1 ring-border">
            {codingFeedback(results, companyId)}
          </div>
          {results.map((result) => (
            <div
              key={result.index}
              className="rounded-lg border border-border bg-background p-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">Case {result.index + 1}</span>
                <span
                  className={
                    result.status === "passed"
                      ? "font-semibold text-[color:var(--success)]"
                      : "font-semibold text-destructive"
                  }
                >
                  {result.status === "passed" ? "passed" : "needs fix"}
                </span>
              </div>
              <div className="mt-2 grid gap-2">
                <pre className="overflow-x-auto rounded-md bg-muted p-2 whitespace-pre-wrap">
                  Input: {result.input}
                </pre>
                <pre className="overflow-x-auto rounded-md bg-muted p-2 whitespace-pre-wrap">
                  Expected: {result.expected}
                </pre>
                <pre className="overflow-x-auto rounded-md bg-muted p-2 whitespace-pre-wrap">
                  {result.error
                    ? `Error: ${result.error}`
                    : `Your output: ${result.actual ?? ""}`}
                </pre>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function runOneTest(
  code: string,
  test: CodingTestCase,
  index: number
): Promise<RunResult> {
  return new Promise((resolve) => {
    const workerUrl = getCodingWorkerUrl()
    let settled = false
    let worker: Worker
    function finish(result: RunResult) {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      worker?.terminate()
      resolve(result)
    }
    const timer = window.setTimeout(() => {
      finish({
        index,
        status: "timeout",
        input: test.input,
        expected: normalizeCodingOutput(test.output),
        error: `Execution took more than ${CODING_TIMEOUT_MS / 1000} seconds (possible infinite loop).`,
      })
    }, CODING_TIMEOUT_MS)

    try {
      worker = new Worker(workerUrl)
    } catch (error) {
      finish({
        index,
        status: "error",
        input: test.input,
        expected: normalizeCodingOutput(test.output),
        error: String(error && error instanceof Error ? error.message : error),
      })
      return
    }

    worker.onmessage = (
      event: MessageEvent<{ ok: boolean; output?: string; error?: string }>
    ) => {
      const expected = normalizeCodingOutput(test.output)
      if (!event.data.ok) {
        finish({
          index,
          status: "error",
          input: test.input,
          expected,
          error: event.data.error ?? "Unknown runtime error",
        })
        return
      }
      const actual = normalizeCodingOutput(event.data.output ?? "")
      finish({
        index,
        status: actual === expected ? "passed" : "failed",
        input: test.input,
        expected,
        actual,
      })
    }
    worker.onerror = (event) => {
      finish({
        index,
        status: "error",
        input: test.input,
        expected: normalizeCodingOutput(test.output),
        error: event.message || "Worker crashed while running the sample.",
      })
    }
    worker.postMessage({ code, input: test.input })
  })
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

function StepHint({
  icon,
  title,
  text,
}: {
  icon: string
  title: string
  text: string
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-primary">
        <Icon name={icon} className="size-3.5" />
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

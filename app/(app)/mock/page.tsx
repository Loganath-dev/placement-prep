"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/app-icon"
import { PageHeader } from "@/app/page-header"
import { QuizRunner } from "@/app/quiz-runner"
import { CompanyAvatar } from "@/app/ui-bits"
import { CompanyPicker } from "@/app/company-picker"
import {
  FREE_MOCK_COMPANY,
  FREE_MOCK_LIMIT,
} from "@/lib/access"
import { COMPANY_BY_ID, COMPANIES, getCompany } from "@/lib/data/companies"
import { buildMockAnalysis, mockPressureLabel, type MockAnalysis } from "@/lib/domain/mock-analysis"
import { EMPTY_PROGRESS, mockMastery } from "@/lib/scoring"
import { useStore } from "@/lib/store"
import type { CompanyId, MockTest, Question } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function MockPage() {
  const { state, submitMock, recordMistake, applyServerRewards } = useStore()
  const searchParams = useSearchParams()
  const queryCompany = companyFromParam(searchParams.get("company"))
  const journey = searchParams.get("journey")
  const [selectedCompany, setSelectedCompany] = React.useState<CompanyId | null>(null)
  const [mockIndex, setMockIndex] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)
  const [retakingWrong, setRetakingWrong] = React.useState(false)
  const [lastAnalysis, setLastAnalysis] = React.useState<MockAnalysis | null>(null)
  const [wrongQuestions, setWrongQuestions] = React.useState<Question[]>([])
  const [mock, setMock] = React.useState<Pick<MockTest, "id" | "companyId" | "title" | "description" | "sections" | "cutoffPercent"> | null>(null)
  const [questions, setQuestions] = React.useState<Question[]>([])
  const [submissionToken, setSubmissionToken] = React.useState("")
  const [locked, setLocked] = React.useState(false)
  const [mockCount, setMockCount] = React.useState(0)
  const [mockLoading, setMockLoading] = React.useState(true)
  const [mockError, setMockError] = React.useState<string | null>(null)
  const [mockUnavailable, setMockUnavailable] = React.useState(false)
  const [loadAttempt, setLoadAttempt] = React.useState(0)
  const company =
    selectedCompany ??
    queryCompany ??
    (state.premium ? (state.primary ?? FREE_MOCK_COMPANY) : FREE_MOCK_COMPANY)
  const isTcsJourney = journey === "tcs-nqt" && company === "tcs"
  const c = getCompany(company)
  const progress = state.progress[company] ?? EMPTY_PROGRESS

  React.useEffect(() => {
    const controller = new AbortController()
    async function loadMock() {
      setMockLoading(true)
      setMockError(null)
      setMockUnavailable(false)
      setLocked(false)
      setMock(null)
      setQuestions([])
      setSubmissionToken("")
      setMockCount(0)
      try {
        const params = new URLSearchParams({ company, index: String(mockIndex) })
        if (isTcsJourney) params.set("journey", "tcs-nqt")
        const response = await fetch(`/api/content/mock?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        })
        const payload = await response.json()
        setMockCount(Number(payload.mockCount ?? 0))
        if (payload.unavailable) {
          setMockUnavailable(true)
          setMock(null)
          setQuestions([])
          return
        }
        if (response.status === 402 && payload.locked) {
          setLocked(true)
          setMock(payload.mock ?? null)
          setQuestions([])
          return
        }
        if (!response.ok) throw new Error(payload.error || "Unable to load this mock test.")
        if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
          setMockUnavailable(true)
          setMock(null)
          setQuestions([])
          return
        }
        setLocked(false)
        setMock(payload.mock ?? null)
        setQuestions(payload.questions)
        setSubmissionToken(typeof payload.submissionToken === "string" ? payload.submissionToken : "")
      } catch (error) {
        if (controller.signal.aborted) return
        setMockError(error instanceof Error ? error.message : "Unable to load this mock test.")
        setMock(null)
        setQuestions([])
      } finally {
        if (!controller.signal.aborted) setMockLoading(false)
      }
    }
    void loadMock()
    return () => controller.abort()
  }, [company, mockIndex, isTcsJourney, loadAttempt])

  const journeyMocks = React.useMemo(
    () => Array.from({ length: mockCount }, (_, index) => ({ id: `${company}-${index}` })),
    [company, mockCount],
  )
  const hiddenMockCount = Math.max(0, mockCount - (state.premium ? mockCount : 1))
  const best = progress.mockScores.length ? Math.max(...progress.mockScores) : 0
  const timeLimitSec = mock
    ? mock.sections.reduce((sum, section) => sum + section.durationMinutes, 0) * 60
    : 0
  const totalQuestions = locked && mock
    ? mock.sections.reduce((sum, section) => sum + section.questionCount, 0)
    : questions.length
  const fullLength = totalQuestions >= 45

  function selectMock(index: number) {
    setMockIndex(index)
    setPlaying(false)
    setRetakingWrong(false)
    setLastAnalysis(null)
    setWrongQuestions([])
  }

  function selectCompany(id: CompanyId) {
    setSelectedCompany(id)
    selectMock(0)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isTcsJourney ? "Guided TCS route" : "Timed simulation"}
        title={isTcsJourney ? "TCS NQT Mock Journey" : "Mock Tests"}
        description={
          isTcsJourney
            ? state.premium
              ? "Begin with the first TCS simulation, review your results, then continue with the next mock."
              : "Your first TCS paper is free. Premium unlocks the other nine timed simulations."
            : "TCS, Infosys, Wipro, Accenture, Zoho and Cognizant each have 10 original timed papers. Free users get the first paper in each employer series and one general readiness mock; Premium unlocks all 10."
        }
      />

      <CompanyPicker
        value={company}
        companies={COMPANIES}
        onChange={selectCompany}
      />

      {isTcsJourney ? (
        <JourneyBanner premium={state.premium} />
      ) : null}

      {progress.mockScores.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Mocks taken" value={progress.mockScores.length} />
          <Stat label="Best score" value={`${best}%`} />
          <Stat label="Average" value={`${mockMastery(progress)}%`} />
        </div>
      ) : null}

      {mockLoading ? (
        <Card><CardContent role="status" className="py-10 text-center text-sm text-muted-foreground">Loading mock test…</CardContent></Card>
      ) : mockError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p role="alert" className="text-sm text-destructive">{mockError}</p>
            <Button type="button" variant="outline" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
              <Icon name="RefreshCw" className="size-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      ) : mockUnavailable ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Icon name="ClipboardCheck" className="size-7" />
            </span>
            <p className="font-medium">Mock test unavailable</p>
            <p className="max-w-md text-sm text-muted-foreground">
              This mock does not have any available questions right now. You can continue with topic practice while we prepare this set.
            </p>
            {!state.premium && company !== FREE_MOCK_COMPANY ? (
              <Button type="button" onClick={() => selectCompany(FREE_MOCK_COMPANY)}>
                Try the free readiness mock
              </Button>
            ) : null}
            <Button asChild variant="outline"><Link href="/practice">Continue to practice</Link></Button>
          </CardContent>
        </Card>
      ) : retakingWrong ? (
        <QuizRunner
          key={`wrong-${mock?.id}-${wrongQuestions.map((q) => q.id).join("-")}`}
          questions={wrongQuestions}
          timeLimitSec={Math.max(60, wrongQuestions.length * 60)}
          onReturn={() => setRetakingWrong(false)}
          returnLabel="Mock analysis"
          onMistake={recordMistake}
          onFinish={(_results, scorePct) => {
            toast.success(`Wrong-question retake complete - ${scorePct}%`)
          }}
          doneActions={() => (
            <Button variant="outline" onClick={() => setRetakingWrong(false)}>
              Back to analysis
            </Button>
          )}
        />
      ) : playing ? (
        <QuizRunner
          key={mock?.id}
          questions={questions}
          timeLimitSec={timeLimitSec}
          passThreshold={mock?.cutoffPercent}
          deferGrading
          passThresholdLabel="to meet this practice target"
          onReturn={() => setPlaying(false)}
          returnLabel="Mock setup"
          onMistake={recordMistake}
          onFinish={(results, scorePct) => {
            void (async () => {
              try {
                const response = await fetch("/api/learning/reward-submission", {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    submissionToken,
                    answers: results.map((result) => ({ questionId: result.questionId, selected: result.selected, responseText: result.responseText })),
                  }),
                })
                const payload = await response.json()
                if (!response.ok) throw new Error(payload.error || "Could not verify this mock result.")
                const previousXp = state.xp
                applyServerRewards(payload.rewards)
                submitMock(company, Number(payload.score))
                const xpGained = Math.max(0, Number(payload.rewards?.xp ?? previousXp) - previousXp)
                const verifiedById = new Map((payload.questionResults ?? []).map((item: { questionId: string; correct: boolean }) => [item.questionId, item.correct]))
                const verifiedResults = results.map((result) => ({ ...result, correct: verifiedById.get(result.questionId ?? "") === true }))
                const reviewById = new Map<string, { id: string; answer: number; acceptedAnswers?: string[] }>(
                  (payload.reviewQuestions ?? []).map((item: { id: string; answer: number; acceptedAnswers?: string[] }) => [item.id, item]),
                )
                const wrong: Question[] = verifiedResults.flatMap((result) => {
                  if (result.correct || !result.questionId) return []
                  const question = questions.find((item) => item.id === result.questionId)
                  const review = reviewById.get(result.questionId)
                  return question && review
                    ? [{ ...question, answer: review.answer, acceptedAnswers: review.acceptedAnswers ?? [] }]
                    : []
                })
                setWrongQuestions(wrong)
                setLastAnalysis(
              buildMockAnalysis(verifiedResults, Number(payload.score), mock?.cutoffPercent ?? 70, {
                sections: mock?.sections,
                timeLimitSec,
              }),
                )
                toast.success(`Mock verified - ${payload.score}%! +${xpGained} XP`)
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Could not verify this mock result.")
              }
            })()
          }}
          doneActions={() => (
            <Button variant="outline" onClick={() => setPlaying(false)}>
              Done
            </Button>
          )}
        />
      ) : (
        <>
        {lastAnalysis ? (
          <MockAnalysisCard
            analysis={lastAnalysis}
            wrongCount={wrongQuestions.length}
            onRetakeWrong={() => setRetakingWrong(true)}
            onNextMock={
              mockIndex + 1 < mockCount
                ? () => selectMock(mockIndex + 1)
                : null
            }
            nextMockLabel={
              !state.premium && mockIndex + 1 >= FREE_MOCK_LIMIT
                ? "Preview the next mock - Premium"
                : isTcsJourney
                  ? "Take the next TCS mock"
                  : "Take the next mock"
            }
          />
        ) : null}
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <CompanyAvatar id={company} size={40} />
            <div className="flex-1">
              <CardTitle className="font-heading text-base">
                {mock?.title ?? `${c.name} Mock Test`}
              </CardTitle>
              {mock?.description ? (
                <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {mock.description}
                </p>
              ) : null}
              {mock && company !== FREE_MOCK_COMPANY ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Original StudyBench practice simulation based on publicly described patterns; not an official company paper.
                </p>
              ) : null}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{totalQuestions} questions</span>
                <span>-</span>
                <span>{Math.round(timeLimitSec / 60)} min</span>
                <span>-</span>
                <span title="StudyBench practice benchmark; not an official employer cutoff">
                  practice target {mock?.cutoffPercent ?? 70}%
                </span>
                <span>-</span>
                <span>{mockPressureLabel(totalQuestions, timeLimitSec)} pressure</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    fullLength
                      ? "bg-warning/15 text-warning-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {fullLength ? "Full-length simulation" : "Focused practice simulation"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {journeyMocks.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {journeyMocks.map((m, i) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => selectMock(i)}
                    aria-pressed={mockIndex === i}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      mockIndex === i
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    {!state.premium && i >= FREE_MOCK_LIMIT
                      ? `Mock ${i + 1} - Premium`
                      : `Mock ${i + 1}`}
                  </button>
                ))}
              </div>
            ) : null}

            {mock ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {mock.sections.map((section) => (
                  <div key={section.label} className="rounded-xl border border-border p-3">
                    <p className="font-medium">{section.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {section.questionCount} questions - {section.durationMinutes} min
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex flex-col items-center gap-3 py-5 text-center">
              {locked ? (
                <>
                  <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon name="Lock" className="size-7" />
                  </span>
                  <p className="font-medium">
                    Join Premium to unlock {mock?.title ?? "this mock"}
                  </p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Premium unlocks this mock and the full {c.short} mock series.
                  </p>
                  <Button asChild className="mt-1">
                    <Link href="/pricing">
                      View Premium plans
                    </Link>
                  </Button>
                  {isTcsJourney ? (
                    <Button variant="ghost" asChild>
                      <Link href="/dashboard">
                        Back to dashboard <Icon name="ChevronRight" className="size-4" />
                      </Link>
                    </Button>
                  ) : null}
                </>
              ) : (
                <>
                  <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon name="Target" className="size-7" />
                  </span>
                  <p className="font-medium">
                    {`Ready to simulate the ${c.short} test?`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {fullLength
                      ? "Full-length timed practice with section-wise review."
                      : "Focused timed practice with section-wise review."}
                  </p>
                  <div className="grid w-full max-w-xl gap-2 text-left sm:grid-cols-3">
                    <PressureTip label="Before" value="No pause. Treat it like drive time." />
                    <PressureTip label="During" value="Skip stuck questions after 45 seconds." />
                    <PressureTip label="After" value="Review every wrong topic immediately." />
                  </div>
                  <Button className="mt-1" onClick={() => setPlaying(true)}>
                    {isTcsJourney && mockIndex === 0 ? "Start TCS Mock Test 1" : "Start mock"}{" "}
                    <Icon name="ArrowRight" className="size-4" />
                  </Button>
                  {!state.premium && hiddenMockCount > 0 ? (
                    <p className="max-w-sm text-xs text-muted-foreground">
                      {isTcsJourney
                        ? "Finish this paper, then continue to the next mock with Premium."
                        : "Upgrade for the complete mock series."}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </CardContent>
        </Card>
        </>
      )}
    </div>
  )
}

function companyFromParam(value: string | null): CompanyId | null {
  if (!value || !Object.prototype.hasOwnProperty.call(COMPANY_BY_ID, value)) return null
  return value as CompanyId
}

function MockAnalysisCard({
  analysis,
  wrongCount,
  onRetakeWrong,
  onNextMock,
  nextMockLabel,
}: {
  analysis: MockAnalysis
  wrongCount: number
  onRetakeWrong: () => void
  onNextMock?: (() => void) | null
  nextMockLabel?: string
}) {
  return (
    <Card className="border-primary/25 bg-primary/4">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="font-heading text-base">Advanced mock analysis</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Section accuracy, topic patterns, timing and progress toward this mock&apos;s practice target.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetakeWrong}
          disabled={wrongCount === 0}
        >
          <Icon name="RotateCcw" className="size-4" /> Retake wrong
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {onNextMock ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-background p-4">
            <div>
              <p className="font-heading text-base font-semibold">Want to take another mock test?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Move straight into the next paper while this attempt is still fresh.
              </p>
            </div>
            <Button onClick={onNextMock}>
              {nextMockLabel ?? "Take another mock"} <Icon name="ArrowRight" className="size-4" />
            </Button>
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-4">
          <AnalysisMetric label="Score" value={`${analysis.scorePct}%`} />
          <AnalysisMetric label="Practice target" value={`${analysis.cutoff}%`} />
          <AnalysisMetric label="Avg time/question" value={formatSeconds(analysis.avgTimeSec)} />
          <AnalysisMetric label="If pace errors were fixed" value={`${analysis.cutoffPrediction.projectedScore}%`} />
        </div>
        <p className="text-xs text-muted-foreground">
          The practice target and pace-adjusted estimate are study guides based on this mock, not official employer cutoffs or hiring predictions.
        </p>

        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-heading font-semibold">{analysis.cutoffPrediction.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{analysis.cutoffPrediction.detail}</p>
            </div>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                analysis.cutoffPrediction.status === "clear"
                  ? "bg-success/15 text-success"
                  : analysis.cutoffPrediction.status === "near"
                    ? "bg-warning/15 text-warning-foreground"
                    : "bg-destructive/10 text-destructive",
              )}
            >
              {analysis.cutoffPrediction.status}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-heading text-sm font-semibold">Section accuracy</p>
          <div className="grid gap-2 md:grid-cols-2">
            {analysis.sectionStats.length ? (
              analysis.sectionStats.map((section) => (
                <div key={section.sectionIndex} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{section.label}</p>
                    <span className="text-sm font-semibold tabular-nums text-primary">
                      {section.accuracy}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${section.accuracy}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {section.correct}/{section.total} correct - {formatSeconds(section.avgTimeSec)} avg
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Section data is unavailable for this attempt.</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-sm font-medium">Accuracy by topic</p>
            <div className="mt-2 space-y-2">
              {analysis.topicAccuracy.slice(0, 6).map((topic) => (
                <div key={topic.topic} className="rounded-lg bg-background p-2 text-xs ring-1 ring-border">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{topic.topic}</span>
                    <span className="tabular-nums">{topic.accuracy}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${topic.accuracy}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Lost marks: speed vs concept</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <LossBox label="Speed" value={analysis.lossBreakdown.speed} />
              <LossBox label="Concept" value={analysis.lossBreakdown.concept} />
              <LossBox label="Careless" value={analysis.lossBreakdown.careless} />
              <LossBox label="Unanswered" value={analysis.lossBreakdown.unanswered} />
            </div>
            <p className="mt-2 rounded-lg bg-background p-2 text-xs text-muted-foreground ring-1 ring-border">
              {analysis.lossBreakdown.summary}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-sm font-medium">Difficulty heatmap</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {analysis.difficultyStats.map((item) => (
                <div
                  key={item.difficulty}
                  className={cn(
                    "rounded-xl border p-3 text-center",
                    item.accuracy >= 75
                      ? "border-success/30 bg-success/10"
                      : item.accuracy >= 50
                        ? "border-warning/30 bg-warning/10"
                        : "border-destructive/25 bg-destructive/10",
                  )}
                >
                  <p className="text-xs font-semibold capitalize">{item.difficulty}</p>
                  <p className="mt-1 font-heading text-xl font-bold tabular-nums">{item.accuracy}%</p>
                  <p className="text-xs text-muted-foreground">{item.correct}/{item.total}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Time per question</p>
            <div className="mt-2 space-y-2">
              {analysis.slowQuestions.length ? (
                analysis.slowQuestions.map((item) => (
                  <div key={`${item.questionNo}-${item.topic}`} className="flex items-center gap-2 rounded-lg bg-background p-2 text-xs ring-1 ring-border">
                    <span className="grid size-7 place-items-center rounded-md bg-muted font-semibold tabular-nums">
                      Q{item.questionNo}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{item.topic}</span>
                    <span className={item.correct ? "text-success" : "text-destructive"}>
                      {formatSeconds(item.timeSpentSec)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Timing appears after answered questions.</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-sm font-medium">Weak topics</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {analysis.weakTopics.length ? (
                analysis.weakTopics.map((topic) => (
                  <span key={topic.topic} className="rounded-full bg-background px-2 py-1 text-xs ring-1 ring-border">
                    {topic.topic}: {topic.wrong}/{topic.total} wrong
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No weak topic from this attempt.</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Next actions</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {analysis.nextTasks.map((task) => (
                <li key={task}>- {task}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function JourneyBanner({ premium }: { premium: boolean }) {
  return (
    <Card className="overflow-hidden border-primary/20 bg-[linear-gradient(135deg,oklch(0.98_0.02_95),oklch(0.95_0.03_80))]">
      <CardContent className="grid gap-4 p-5 md:grid-cols-[1.1fr_.9fr] md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-primary uppercase ring-1 ring-primary/15">
            <Icon name="Briefcase" className="size-3.5" /> TCS guided flow
          </div>
          <h2 className="mt-3 font-heading text-xl font-bold tracking-tight">
            {premium
              ? "Start with the first TCS mock; review your results before continuing."
              : "Your first TCS practice paper is free; the other nine are included with Premium."}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {premium
              ? "Complete Mock Test 1 and review your performance before choosing the next paper. Premium is active, so you can continue whenever you are ready."
              : "The first TCS practice paper is free. Premium unlocks all 10 original TCS simulations and the full company series."}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <JourneyStatus
            title="Paper 1"
            detail="Free practice paper"
            icon="PlayCircle"
            tone="ready"
          />
          <JourneyStatus
            title="Papers 2–10"
            detail={premium ? "Included with Premium" : "Unlock with Premium"}
            icon={premium ? "BadgeCheck" : "Lock"}
            tone={premium ? "ready" : "locked"}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function JourneyStatus({
  title,
  detail,
  icon,
  tone,
}: {
  title: string
  detail: string
  icon: React.ComponentProps<typeof Icon>["name"]
  tone: "ready" | "locked"
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-3",
        tone === "ready" ? "border-primary/20 bg-background" : "border-amber-200 bg-amber-50/75",
      )}
    >
      <span
        className={cn(
          "grid size-9 place-items-center rounded-xl",
          tone === "ready" ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-800",
        )}
      >
        <Icon name={icon} className="size-4" />
      </span>
      <p className="mt-3 font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}

function formatSeconds(seconds: number): string {
  if (!seconds) return "0s"
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

function LossBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-background p-2 text-center ring-1 ring-border">
      <p className="font-heading text-lg font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function PressureTip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-2 text-xs">
      <p className="font-medium text-foreground">{label}</p>
      <p className="mt-1 text-muted-foreground">{value}</p>
    </div>
  )
}

function AnalysisMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-center">
      <p className="font-heading text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="font-heading text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

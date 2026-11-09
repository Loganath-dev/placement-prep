"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { QuizRunner } from "@/components/app/quiz-runner"
import { CompanyAvatar } from "@/components/app/ui-bits"
import { CompanyPicker } from "@/components/app/company-picker"
import {
  canAccessMockCompany,
  FREE_MOCK_COMPANY,
  premiumPriceLabel,
  visibleMocksForPlan,
} from "@/lib/access"
import { COMPANY_BY_ID, getCompany } from "@/lib/data/companies"
import { buildMockQuestions, mocksForCompany } from "@/lib/data/mocks"
import { buildMockAnalysis, mockPressureLabel, type MockAnalysis } from "@/lib/domain/mock-analysis"
import { EMPTY_PROGRESS, mockMastery } from "@/lib/scoring"
import { useStore } from "@/lib/store"
import type { CompanyId, Question } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function MockPage() {
  const { state, submitMock, recordMistake } = useStore()
  const searchParams = useSearchParams()
  const queryCompany = companyFromParam(searchParams.get("company"))
  const journey = searchParams.get("journey")
  const isTcsJourney = journey === "tcs-nqt"
  const [selectedCompany, setSelectedCompany] = React.useState<CompanyId | null>(null)
  const [mockIndex, setMockIndex] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)
  const [retakingWrong, setRetakingWrong] = React.useState(false)
  const [lastAnalysis, setLastAnalysis] = React.useState<MockAnalysis | null>(null)
  const [wrongQuestions, setWrongQuestions] = React.useState<Question[]>([])
  const company = selectedCompany ?? queryCompany ?? state.primary ?? FREE_MOCK_COMPANY

  const c = getCompany(company)
  const mocks = React.useMemo(() => mocksForCompany(company), [company])
  const journeyMocks = React.useMemo(
    () => (isTcsJourney && company === "tcs" ? mocks.slice(0, 2) : mocks),
    [company, isTcsJourney, mocks],
  )
  const selectedMock = journeyMocks[mockIndex] ?? journeyMocks[0]
  const locked =
    isTcsJourney && company === "tcs"
      ? !state.premium && mockIndex > 0
      : !canAccessMockCompany(company, state.premium)
  const visibleMocks = React.useMemo(() => {
    if (isTcsJourney && company === "tcs") {
      return state.premium ? journeyMocks : journeyMocks.slice(0, 1)
    }
    return visibleMocksForPlan(mocks, company, state.premium)
  }, [company, isTcsJourney, journeyMocks, mocks, state.premium])
  const mock = locked ? selectedMock : visibleMocks[mockIndex] ?? visibleMocks[0] ?? selectedMock
  const progress = state.progress[company] ?? EMPTY_PROGRESS
  const questions = React.useMemo(
    () => (!locked && mock ? buildMockQuestions(mock) : []),
    [locked, mock],
  )
  const hiddenMockCount = locked
    ? Math.max(0, journeyMocks.length - visibleMocks.length)
    : Math.max(0, journeyMocks.length - visibleMocks.length)
  const best = progress.mockScores.length ? Math.max(...progress.mockScores) : 0
  const timeLimitSec = mock
    ? mock.sections.reduce((sum, section) => sum + section.durationMinutes, 0) * 60
    : 0
  const totalQuestions = questions.length
  const fullLength = totalQuestions >= 45

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isTcsJourney ? "Guided TCS route" : "Timed simulation"}
        title={isTcsJourney ? "TCS NQT Mock Journey" : "Mock Tests"}
        description={
          isTcsJourney
            ? "Start the first TCS simulation now, then continue into the next premium mock after you finish."
            : "Timed company-pattern mocks with section-wise scoring and pass targets."
        }
      />

      <CompanyPicker
        value={company}
        onChange={(id) => {
          setSelectedCompany(id)
          setMockIndex(0)
          setPlaying(false)
          setRetakingWrong(false)
          setLastAnalysis(null)
          setWrongQuestions([])
        }}
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

      {retakingWrong ? (
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
          onReturn={() => setPlaying(false)}
          returnLabel="Mock setup"
          onMistake={recordMistake}
          onFinish={(results, scorePct) => {
            const { xpGained } = submitMock(company, scorePct)
            const wrong = results
              .filter((result) => !result.correct && result.questionIndex != null)
              .map((result) => questions[result.questionIndex ?? -1])
              .filter(Boolean)
            setWrongQuestions(wrong)
            setLastAnalysis(
              buildMockAnalysis(results, scorePct, mock?.cutoffPercent ?? 70, {
                sections: mock?.sections,
                timeLimitSec,
              }),
            )
            toast.success(`Mock complete - ${scorePct}%! +${xpGained} XP`)
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
              isTcsJourney && company === "tcs"
                ? () => {
                    setMockIndex(1)
                    setLastAnalysis(null)
                    setWrongQuestions([])
                  }
                : null
            }
            nextMockLabel={state.premium ? "Take another TCS mock" : "Take another mock test"}
          />
        ) : null}
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <CompanyAvatar id={company} size={40} />
            <div className="flex-1">
              <CardTitle className="font-heading text-base">
                {mock?.title ?? `${c.name} Mock Test`}
              </CardTitle>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{totalQuestions} questions</span>
                <span>-</span>
                <span>{Math.round(timeLimitSec / 60)} min</span>
                <span>-</span>
                <span>cutoff {mock?.cutoffPercent ?? 70}%</span>
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
                  {fullLength ? "Full-length simulation" : "Practice simulation"}
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
                    onClick={() => setMockIndex(i)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      mock?.id === m.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    {i === 1 && isTcsJourney && !state.premium ? "Mock 2 - Premium" : `Mock ${i + 1}`}
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
                    {isTcsJourney ? "Join Premium to unlock TCS Mock Test 2" : "Premium mock"}
                  </p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    {isTcsJourney
                      ? "You finished the first guided TCS test. Upgrade now to continue into the next mock and unlock the full company mock series."
                      : "Upgrade to practise every company mock with full analytics."}
                  </p>
                  <Button asChild className="mt-1">
                    <Link href="/settings">
                      {isTcsJourney ? "Join Premium and unlock it" : `Go Premium - ${premiumPriceLabel()}`}
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
                  <p className="font-medium">Ready to simulate the {c.short} test?</p>
                  <p className="text-sm text-muted-foreground">
                    {fullLength
                      ? "Full-length pressure practice with section-wise review."
                      : "Full-length practice with section-wise review."}
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
  if (!value || !(value in COMPANY_BY_ID)) return null
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
    <Card className="border-primary/25 bg-primary/[0.04]">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="font-heading text-base">Advanced mock analysis</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Section percentile, topic accuracy, speed loss and cutoff prediction.
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
          <AnalysisMetric label="Cutoff" value={`${analysis.cutoff}%`} />
          <AnalysisMetric label="Avg time/question" value={formatSeconds(analysis.avgTimeSec)} />
          <AnalysisMetric label="Projected score" value={`${analysis.cutoffPrediction.projectedScore}%`} />
        </div>

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
                  ? "bg-success/15 text-[color:var(--success)]"
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
          <p className="font-heading text-sm font-semibold">Section-wise percentile</p>
          <div className="grid gap-2 md:grid-cols-2">
            {analysis.sectionStats.length ? (
              analysis.sectionStats.map((section) => (
                <div key={section.id} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{section.label}</p>
                    <span className="text-sm font-semibold tabular-nums text-primary">
                      P{section.estimatedPercentile}
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
              <p className="text-sm text-muted-foreground">Section analytics unlock after a mock attempt.</p>
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
                    <span className={item.correct ? "text-[color:var(--success)]" : "text-destructive"}>
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
            First test now. Second test unlocks right after this one.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Complete Mock Test 1, review your performance, then continue to Mock Test 2.
            {premium
              ? " Premium is active, so the next paper is already open."
              : " Premium unlocks the next paper and the complete TCS mock series."}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <JourneyStatus
            title="Mock test 1"
            detail="Available now"
            icon="PlayCircle"
            tone="ready"
          />
          <JourneyStatus
            title="Mock test 2"
            detail={premium ? "Unlocked" : "Join Premium"}
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



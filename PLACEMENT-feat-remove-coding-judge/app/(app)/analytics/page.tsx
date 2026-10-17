"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BrandedBar, BrandedColumns } from "@/components/app/charts"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { CompanyAvatar } from "@/components/app/ui-bits"
import { getCompany } from "@/lib/data/companies"
import { getSections, totalChapters } from "@/lib/data/content"
import {
  computePRI,
  EMPTY_PROGRESS,
  mockMastery,
  sectionMastery,
  strongestTopics,
  topicAccuracies,
  weakestTopics,
} from "@/lib/scoring"
import { useStore } from "@/lib/store"
import type { CompanyId } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function AnalyticsPage() {
  const { state } = useStore()
  const weak = weakestTopics(state, 5)
  const strong = strongestTopics(state, 5)
  const allTopics = topicAccuracies(state)
  const totalAnswered = allTopics.reduce((n, t) => n + t.total, 0)
  const totalCorrect = allTopics.reduce((n, t) => n + t.correct, 0)
  const accuracy = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  const companies = state.interested.length
    ? state.interested
    : ([state.primary] as CompanyId[])

  let passed = 0
  let skipped = 0
  let mocks = 0
  for (const p of Object.values(state.progress)) {
    for (const c of Object.values(p.chapters)) {
      if (c.passed) passed++
      else if (c.skipped) skipped++
    }
    mocks += p.mockScores.length
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Study analytics"
        title="Analytics"
        description="Where you're strong, where you're weak, and progress per company."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Questions answered" value={totalAnswered} icon="CircleHelp" />
        <Stat label="Overall accuracy" value={`${accuracy}%`} icon="Target" />
        <Stat label="Chapters passed" value={passed} icon="CircleCheckBig" />
        <Stat label="Mocks taken" value={mocks} icon="Trophy" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <NextTasksCard />
        <MockTrendCard companyId={state.primary} />
      </div>

      {!state.premium ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <Icon name="Lock" className="size-7 text-primary" />
            <p className="font-medium">Unlock detailed analytics</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Premium adds weakest topics, strongest topics and company-wise progress analysis.
            </p>
            <Button asChild className="mt-1">
              <Link href="/settings">Go Premium</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {state.premium && totalAnswered === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Icon name="ChartColumn" className="size-10 text-muted-foreground" />
            <p className="font-medium">No data yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Answer a few chapter quizzes or a daily challenge and your weakest and strongest
              topics will appear here.
            </p>
            <Link
              href="/learn"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Start a quiz <Icon name="ArrowRight" className="size-3.5" />
            </Link>
          </CardContent>
        </Card>
      ) : state.premium ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <TopicCard
            title="Weakest topics"
            subtitle="Lowest accuracy - focus here"
            tone="danger"
            icon="TrendingUp"
            topics={weak}
          />
          <TopicCard
            title="Strongest topics"
            subtitle="You've got these down"
            tone="success"
            icon="Star"
            topics={strong}
          />
        </div>
      ) : null}

      {state.premium ? (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Progress per company</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {companies.map((id) => {
            const progress = state.progress[id] ?? EMPTY_PROGRESS
            const pri = computePRI(id, progress)
            const total = totalChapters(id)
            const done = getSections(id).reduce(
              (n, s) => n + s.chapters.filter((c) => progress.chapters[c.id]?.passed).length,
              0,
            )
            const mock = mockMastery(progress)
            return (
              <div key={id} className="flex items-center gap-3">
                <CompanyAvatar id={id} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{getCompany(id).short}</span>
                    <span className="tabular-nums text-muted-foreground">
                      PRI {pri} - {done}/{total} chapters{mock ? ` - mock ${mock}%` : ""}
                    </span>
                  </div>
                  <BrandedBar value={pri} tone="info" height={10} className="mt-1.5" />
                </div>
              </div>
            )
          })}
          {skipped > 0 ? (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Icon name="Lock" className="size-3.5" /> {skipped} chapter
              {skipped > 1 ? "s" : ""} skipped - these don&apos;t count toward your PRI.
            </p>
          ) : null}
        </CardContent>
      </Card>
      ) : null}

      {state.premium ? <SectionHistoryCard companyId={state.primary} /> : null}
    </div>
  )
}

function NextTasksCard() {
  const { state } = useStore()
  const companyId = state.primary
  const progress = state.progress[companyId] ?? EMPTY_PROGRESS
  const weak = weakestTopics(state, 1)[0]
  const mockAvg = mockMastery(progress)
  const sections = getSections(companyId)
  const weakestSection = sections
    .map((section) => ({
      section,
      mastery: sectionMastery(companyId, section.id, progress),
    }))
    .sort((a, b) => a.mastery - b.mastery)[0]
  const tasks = [
    weak
      ? {
          label: `Revise ${weak.topic}`,
          detail: `${weak.accuracy}% accuracy so far`,
          href: "/mistakes",
          icon: "Wrench",
        }
      : {
          label: "Attempt adaptive quiz",
          detail: "Create weak-topic data",
          href: "/challenges",
          icon: "Target",
        },
    weakestSection
      ? {
          label: `Build ${weakestSection.section.short}`,
          detail: `${weakestSection.mastery}% section mastery`,
          href: `/learn/${companyId}/${weakestSection.section.id}`,
          icon: weakestSection.section.icon,
        }
      : {
          label: "Open company track",
          detail: "Start the first chapter",
          href: `/learn/${companyId}`,
          icon: "BookOpen",
        },
    mockAvg >= 70
      ? {
          label: "Take full-length mock",
          detail: `Mock average ${mockAvg}%`,
          href: "/mock",
          icon: "Trophy",
        }
      : {
          label: "Fix one mock weakness",
          detail: mockAvg ? `Mock average ${mockAvg}%` : "No mock attempt yet",
          href: "/mock",
          icon: "ClipboardCheck",
        },
  ].slice(0, 3)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-base">
          <Icon name="ListChecks" className="size-4 text-primary" /> Next 3 tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.map((task, index) => (
          <Link
            key={`${task.label}-${index}`}
            href={task.href}
            className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/50"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon name={task.icon} className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{task.label}</span>
              <span className="block truncate text-xs text-muted-foreground">{task.detail}</span>
            </span>
            <Icon name="ArrowRight" className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}

function MockTrendCard({ companyId }: { companyId: CompanyId }) {
  const { state } = useStore()
  const progress = state.progress[companyId] ?? EMPTY_PROGRESS
  const scores = progress.mockScores.slice(-6)
  const best = scores.length ? Math.max(...scores) : 0
  const latest = scores.at(-1)
  const first = scores[0]
  const delta = latest != null && first != null ? latest - first : 0
  const cutoff = getCompany(companyId).cutoffPRI
  // This is an estimated band from score vs cutoff — NOT a real cohort percentile.
  const scoreBand = best >= cutoff + 10 ? "Above cutoff" : best >= cutoff ? "At cutoff" : "Below cutoff"
  const scoreBandColor = best >= cutoff + 10 ? "text-[color:var(--success)]" : best >= cutoff ? "text-warning-foreground" : "text-destructive"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-base">
          <Icon name="TrendingUp" className="size-4 text-primary" /> Mock trend
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scores.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Take one mock to unlock trend, benchmark percentile and score movement.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              <MiniMetric label="Latest" value={`${latest}%`} />
              <MiniMetric label="Trend" value={`${delta >= 0 ? "+" : ""}${delta}`} />
              <div className="rounded-xl border border-border p-3">
                <p className={`font-heading text-base font-bold ${scoreBandColor}`}>{scoreBand}</p>
                <p className="text-xs text-muted-foreground">vs cutoff</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Cutoff comparison is estimated from your scores vs {getCompany(companyId).short}&apos;s typical threshold. Not real cohort data.
            </p>
            <BrandedColumns
              className="h-28 rounded-xl bg-muted/40"
              tone={best >= cutoff ? "success" : "warning"}
              cutoff={cutoff}
              data={scores.map((score, index) => ({
                value: score,
                label: String(score),
                title: `Mock ${index + 1}: ${score}%`,
              }))}
            />
            <p className="text-xs text-muted-foreground">
              Percentile is an estimate from your mock score versus the target, not a public candidate ranking.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function SectionHistoryCard({ companyId }: { companyId: CompanyId }) {
  const { state } = useStore()
  const progress = state.progress[companyId] ?? EMPTY_PROGRESS
  const sections = getSections(companyId).map((section) => ({
    section,
    mastery: sectionMastery(companyId, section.id, progress),
    passed: section.chapters.filter((chapter) => progress.chapters[chapter.id]?.passed).length,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base">Per-section history snapshot</CardTitle>
        <p className="text-sm text-muted-foreground">
          Current section mastery from chapter history. Dated section attempts can be added when attempt events are stored.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ section, mastery, passed }) => (
          <div key={section.id} className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2 font-medium">
                <Icon name={section.icon} className="size-4 shrink-0 text-primary" />
                <span className="truncate">{section.short}</span>
              </span>
              <span className="tabular-nums text-muted-foreground">{mastery}%</span>
            </div>
            <BrandedBar
              value={mastery}
              tone={mastery >= 70 ? "success" : mastery >= 40 ? "info" : "warning"}
              height={8}
              className="mt-2"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {passed}/{section.chapters.length} chapters passed
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="font-heading text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon name={icon} className="size-4" />
        </span>
        <p className="mt-2 font-heading text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

function TopicCard({
  title,
  subtitle,
  tone,
  icon,
  topics,
}: {
  title: string
  subtitle: string
  tone: "danger" | "success"
  icon: string
  topics: { topic: string; accuracy: number; correct: number; total: number }[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-base">
          <span
            className={cn(
              "grid size-7 place-items-center rounded-lg",
              tone === "danger"
                ? "bg-destructive/10 text-destructive"
                : "bg-success/15 text-[color:var(--success)]",
            )}
          >
            <Icon name={icon} className="size-4" />
          </span>
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {topics.length === 0 ? (
          <p className="text-sm text-muted-foreground">Not enough data yet.</p>
        ) : (
          topics.map((t) => (
            <div key={t.topic} className="flex items-center gap-3">
              <span className="w-24 shrink-0 truncate text-sm font-medium sm:w-40">{t.topic}</span>
              <BrandedBar value={t.accuracy} tone={tone} height={8} className="flex-1" />
              <span className="w-14 text-right text-sm tabular-nums text-muted-foreground">
                {t.accuracy}%
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}



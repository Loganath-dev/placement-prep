"use client"

import Link from "next/link"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { PriRing } from "@/components/app/pri-ring"
import {
  CompanyAvatar,
  ProbabilityInputs,
  ProbabilityStat,
  SectionProgressBar,
  ToneBadge,
} from "@/components/app/ui-bits"
import { SharePriCard } from "@/components/app/share-pri-card"
import { UpgradeBanner } from "@/components/app/upgrade-prompt"
import {
  PREMIUM_FOOD_COMPARISON_LABEL,
  PREMIUM_MONTHLY_EQUIVALENT_INR,
  premiumPriceLabel,
} from "@/lib/access"
import { getCompany, SELECTABLE_COMPANIES } from "@/lib/data/companies"
import { getSections } from "@/lib/data/content"
import {
  computePRI,
  EMPTY_PROGRESS,
  expectedPriGain,
  priBand,
  sectionMastery,
  weakestTopics,
} from "@/lib/scoring"
import { useStoreActions, useStoreState } from "@/lib/store"
import type { CompanyId } from "@/lib/types"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

// Derived from the canonical company list so every track (Core + all companies)
// appears here automatically when companies are added.
const ALL_TRACK_IDS: CompanyId[] = SELECTABLE_COMPANIES.map((c) => c.id)

function nextChapter(companyId: CompanyId, progress = EMPTY_PROGRESS) {
  for (const section of getSections(companyId)) {
    for (const ch of section.chapters) {
      if (!progress.chapters[ch.id]?.passed) {
        return { section, chapter: ch }
      }
    }
  }
  return null
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

export default function DashboardPage() {
  const { state, userId } = useStoreState()
  const { setPrimary } = useStoreActions()
  const primary = state.primary
  const company = getCompany(primary)
  const progress = state.progress[primary] ?? EMPTY_PROGRESS

  const pri = React.useMemo(
    () => computePRI(primary, progress),
    [primary, progress]
  )
  const next = React.useMemo(
    () => nextChapter(primary, progress),
    [primary, progress]
  )
  const weakest = React.useMemo(() => weakestTopics(state, 1)[0], [state])
  const nextMinutes = React.useMemo(
    () =>
      next
        ? next.chapter.lessons.reduce((m, l) => m + l.minutes, 0) +
          next.chapter.quiz.length
        : 0,
    [next]
  )
  const nextGain = React.useMemo(
    () => (next ? expectedPriGain(primary, next.chapter.id, progress) : 0),
    [primary, next, progress]
  )

  const others = React.useMemo(
    () => state.interested.filter((id) => id !== primary),
    [state.interested, primary]
  )

  const otherPRIs = React.useMemo(
    () =>
      Object.fromEntries(
        others.map((id) => [
          id,
          computePRI(id, state.progress[id] ?? EMPTY_PROGRESS),
        ])
      ),
    [others, state.progress]
  )

  return (
    <div className="space-y-8">
      {/* Hero — greeting, readiness snapshot and the single highest-impact action */}
      <Card className="animate-in overflow-hidden border-primary/15 shadow-[0_28px_80px_-52px_oklch(0.25_0.12_260_/_55%)] duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
        <CardContent className="grid gap-6 p-5 sm:p-6 md:grid-cols-[minmax(0,15rem)_1fr] md:gap-8">
          {/* Readiness column */}
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-[linear-gradient(160deg,var(--accent),transparent)] p-5 text-center">
            <div className="flex items-center gap-2">
              <CompanyAvatar id={primary} size={26} />
              <span className="font-heading font-semibold">{company.short}</span>
              <span className="rounded-full bg-background/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border">
                Primary
              </span>
            </div>
            <PriRing value={pri} tone={priBand(pri).tone} />
            <ProbabilityStat pri={pri} />
            <ToneBadge band={priBand(pri)} />
            <ProbabilityInputs companyId={primary} progress={progress} compact />
          </div>

          {/* Action column */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  {greeting()}, {state.profile.name?.split(" ")[0] || "there"}
                </p>
                <h1 className="mt-0.5 font-heading text-2xl font-bold tracking-tight md:text-[1.75rem]">
                  Today&apos;s next move
                </h1>
              </div>
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link href="/readiness">
                  <Icon name="TrendingUp" className="size-4" /> Full readiness
                </Link>
              </Button>
            </div>

            {next ? (
              <div className="rounded-2xl border border-primary/20 bg-[linear-gradient(135deg,var(--accent),transparent)] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                    <Icon name={next.section.icon} className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold tracking-wider text-primary uppercase">
                      Do this now - {next.section.short}
                    </p>
                    <p className="mt-0.5 line-clamp-2 font-heading text-lg leading-snug font-semibold">
                      {next.chapter.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-full bg-background px-2 py-1 font-medium text-muted-foreground ring-1 ring-border">
                        <Icon name="Clock" className="size-3.5" /> ~
                        {Math.max(5, nextMinutes)} min
                      </span>
                      {nextGain > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 font-medium text-[color:var(--success)]">
                          <Icon name="TrendingUp" className="size-3.5" /> +
                          {nextGain} PRI when you pass
                        </span>
                      ) : null}
                    </div>
                    {weakest ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Targets your weakest area so far:{" "}
                        <span className="font-medium text-foreground">
                          {weakest.topic}
                        </span>{" "}
                        ({weakest.accuracy}%)
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      One good session here moves the score more than another hour of
                      unfocused scrolling.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <StartNowButton
                    href={`/learn/${primary}/${next.section.id}/${next.chapter.id}`}
                    label="Start now"
                  />
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/learn/${primary}`}>
                      View full track{" "}
                      <Icon name="ChevronRight" className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3 rounded-2xl border border-success/30 bg-success/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Icon
                    name="Trophy"
                    className="size-6 text-[color:var(--success)]"
                  />
                  <p className="font-medium">
                    You&apos;ve cleared every chapter for {company.short}. Put it
                    to the test.
                  </p>
                </div>
                <StartNowButton href="/mock" label="Take a mock" />
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {getSections(primary).map((s) => (
                <SectionProgressBar
                  key={s.id}
                  label={s.short}
                  icon={s.icon}
                  value={sectionMastery(primary, s.id, progress)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {!state.premium && (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_.8fr]">
          <UpgradeBanner />
          <PaymentValueCard />
        </div>
      )}

      {/* Zone 2 — Keep momentum: daily reps, other targets, the drive path */}
      <section className="space-y-4">
        <ZoneHeading
          title="Keep momentum"
          hint="Daily reps, your other target companies and the path to a drive."
        />

        {/* Daily challenge + Other companies */}
        <div className="grid gap-6 lg:grid-cols-2">
          <DailyCard />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-base">
                <Icon name="Building2" className="size-4 text-primary" /> Other target tracks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(others.length ? others : ALL_TRACK_IDS.filter((id) => id !== primary).slice(0, 4)).map((id) => {
                const target = getCompany(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPrimary(id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <CompanyAvatar id={id} size={32} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{target.short}</span>
                      <span className="block text-xs text-muted-foreground">
                        PRI {otherPRIs[id] ?? computePRI(id, state.progress[id] ?? EMPTY_PROGRESS)}
                      </span>
                    </span>
                    <Icon name="ArrowRight" className="size-4 text-muted-foreground" />
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </section>

      <PlacementRoadmap />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base">
              <Icon name="BarChart3" className="size-4 text-primary" /> Readiness analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Review strongest and weakest areas before you spend another hour practising.
            </p>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/analytics">
                Open analytics <Icon name="ArrowRight" className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <SharePriCard pri={pri} companyShort={company.short} userId={userId} />
      </section>
    </div>
  )
}

function ZoneHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h2 className="font-heading text-base font-semibold tracking-tight">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  )
}

function DailyCard() {
  const { state } = useStoreState()
  const t = new Date().toISOString().slice(0, 10)
  const daily =
    state.daily.date === t
      ? state.daily
      : { general: false, aptitude: false, coding: false }
  const cats = [
    { key: "general", label: "Mixed", icon: "BookOpen" },
    { key: "aptitude", label: "Aptitude", icon: "Calculator" },
    { key: "coding", label: "Coding", icon: "Code2" },
  ] as const

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 font-heading text-base">
          <Icon name="CalendarCheck" className="size-4 text-primary" /> Daily
          Challenge
        </CardTitle>
        <span className="text-sm text-muted-foreground">
          {state.streak.count}-day streak
        </span>
      </CardHeader>
      <CardContent className="space-y-2">
        {cats.map((c) => {
          const done = daily[c.key]
          return (
            <Link
              key={c.key}
              href={`/challenges?cat=${c.key}`}
              className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/50"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-muted">
                <Icon name={c.icon} className="size-4" />
              </span>
              <span className="flex-1 font-medium">{c.label}</span>
              {done ? (
                <span className="flex items-center gap-1 text-sm text-[color:var(--success)]">
                  <Icon name="CircleCheckBig" className="size-4" /> Done
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-primary">
                  Start <Icon name="ArrowRight" className="size-3.5" />
                </span>
              )}
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}

function PaymentValueCard() {
  return (
    <Card className="border-primary/20 bg-[linear-gradient(145deg,var(--primary),oklch(0.48_0.14_250))] text-primary-foreground shadow-[0_24px_70px_-48px_oklch(0.25_0.12_260_/_60%)]">
      <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/85">
            <Icon name="CreditCard" className="size-4" /> Premium value
          </p>
          <div className="mt-3 flex items-end gap-2">
            <p className="font-heading text-3xl font-bold">{premiumPriceLabel()}</p>
            <p className="pb-1 text-sm text-primary-foreground/75">
              ~Rs {PREMIUM_MONTHLY_EQUIVALENT_INR}/month
            </p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-primary-foreground/82">
            {PREMIUM_FOOD_COMPARISON_LABEL}, but it unlocks the full company prep
            depth for the entire year.
          </p>
        </div>
        <Button asChild variant="secondary" className="w-full justify-between">
          <Link href="/settings">
            Pay and unlock Premium
            <Icon name="ArrowRight" className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function PlacementRoadmap() {
  const { state } = useStoreState()
  const progress = state.progress[state.primary] ?? EMPTY_PROGRESS
  const sections = React.useMemo(
    () => getSections(state.primary),
    [state.primary]
  )
  const passed = React.useMemo(
    () =>
      Object.values(progress.chapters).filter((chapter) => chapter.passed)
        .length,
    [progress.chapters]
  )
  const total = React.useMemo(
    () => sections.reduce((sum, section) => sum + section.chapters.length, 0),
    [sections]
  )
  const weak = React.useMemo(() => weakestTopics(state, 1)[0], [state])

  const steps = [
    {
      label: "Diagnose",
      detail: progress.mockScores.length
        ? `${progress.mockScores.length} mock${progress.mockScores.length > 1 ? "s" : ""} taken`
        : "Take one full-length mock",
      href: "/mock",
      done: progress.mockScores.length > 0,
      icon: "ClipboardCheck",
    },
    {
      label: "Build basics",
      detail: `${passed}/${total} chapters passed`,
      href: `/learn/${state.primary}`,
      done: total > 0 && passed / total >= 0.6,
      icon: "GraduationCap",
    },
    {
      label: "Fix weak area",
      detail: weak
        ? `${weak.topic} at ${weak.accuracy}%`
        : "Answer quizzes to unlock",
      href: weak ? "/analytics" : "/challenges",
      done: Boolean(weak && weak.accuracy >= 70),
      icon: "Wrench",
    },
    {
      label: "Simulate drive",
      detail: progress.mockScores.some((score) => score >= 70)
        ? "Cutoff-level mock cleared"
        : "Attempt a full-length mock",
      href: "/mock",
      done: progress.mockScores.some((score) => score >= 70),
      icon: "Target",
    },
    {
      label: "Interview ready",
      detail: "Practise HR, technical and communication",
      href: "/interview",
      done: false,
      icon: "Mic",
    },
  ]

  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold">
              Placement roadmap
            </h2>
            <p className="text-sm text-muted-foreground">
              A simple path from diagnosis to final-drive simulation.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/readiness">
              Check readiness <Icon name="ArrowRight" className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
          {steps.map((step, index) => (
            <Link
              key={step.label}
              href={step.href}
              className="group rounded-lg border border-border bg-background/55 p-3 transition-all hover:border-primary/30 hover:bg-muted/55"
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-lg",
                    step.done
                      ? "bg-success/15 text-[color:var(--success)]"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  <Icon
                    name={step.done ? "CircleCheckBig" : step.icon}
                    className="size-4"
                  />
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  Step {index + 1}
                </span>
              </div>
              <p className="mt-3 font-medium">{step.label}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {step.detail}
              </p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function StartNowButton({ href, label }: { href: string; label: string }) {
  return (
    <Button
      asChild
      size="lg"
      className="group/cta rounded-lg pr-2 pl-5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
    >
      <Link href={href}>
        {label}
        <span className="ml-2 grid size-8 place-items-center rounded-full bg-primary-foreground/15 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/cta:translate-x-0.5">
          <Icon name="ArrowRight" className="size-4" />
        </span>
      </Link>
    </Button>
  )
}




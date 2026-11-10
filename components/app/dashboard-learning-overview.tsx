"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { FREE_LESSONS_PER_TOPIC } from "@/lib/access"
import { getSections } from "@/lib/data/content"
import { EMPTY_PROGRESS, levelFromXP } from "@/lib/scoring"
import { useStoreState } from "@/lib/store"

export function DashboardLearningOverview() {
  const { state } = useStoreState()
  const sections = useMemo(() => getSections(state.primary), [state.primary])
  const progress = state.progress[state.primary] ?? EMPTY_PROGRESS
  const level = levelFromXP(state.xp)
  const passed = sections.reduce((sum, section) => sum + section.chapters.filter((chapter) => progress.chapters[chapter.id]?.passed).length, 0)
  const total = sections.reduce((sum, section) => sum + section.chapters.length, 0)
  const completion = total ? Math.round((passed / total) * 100) : 0

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Your classroom</p>
          <h2 className="mt-1 font-heading text-xl font-bold tracking-tight">Pick up where you left off</h2>
          <p className="text-sm text-muted-foreground">Build skills in small lessons. Your progress is saved as you go.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/learn">All learning tracks <Icon name="ArrowRight" className="size-4" /></Link>
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => {
            const sectionPassed = section.chapters.filter((chapter) => progress.chapters[chapter.id]?.passed).length
            const sectionTotal = section.chapters.length
            const nextIndex = section.chapters.findIndex((chapter) => !progress.chapters[chapter.id]?.passed)
            const nextChapter = nextIndex >= 0 ? section.chapters[nextIndex] : null
            const href = nextChapter
              ? "/learn/" + state.primary + "/" + section.id + "/" + nextChapter.id
              : "/learn/" + state.primary
            const percent = sectionTotal ? Math.round((sectionPassed / sectionTotal) * 100) : 0
            return (
              <Link key={section.id} href={href} className="group rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon name={section.icon} className="size-5" />
                  </span>
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">{sectionPassed}/{sectionTotal}</span>
                </div>
                <h3 className="mt-4 font-heading text-base font-semibold">{section.name}</h3>
                <p className="mt-1 min-h-10 text-xs leading-relaxed text-muted-foreground">{section.blurb}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: percent + "%" }} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">{state.premium ? "Full access" : FREE_LESSONS_PER_TOPIC + " starter lessons free per topic"}</span>
                  <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-primary">
                    {nextChapter ? "Continue" : "Review"} <Icon name="ArrowRight" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        <Card className="border-primary/15">
          <CardContent className="flex h-full flex-col justify-between gap-5 p-5">
            <div>
              <div className="flex items-center justify-between">
                <p className="font-heading font-semibold">Your momentum</p>
                <Icon name="Flame" className="size-5 text-warning" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/55 p-3">
                  <p className="text-2xl font-bold tabular-nums">{state.streak.count}</p>
                  <p className="text-xs text-muted-foreground">Day streak</p>
                </div>
                <div className="rounded-xl bg-muted/55 p-3">
                  <p className="text-2xl font-bold tabular-nums">{state.xp.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-semibold">Level {level.level}</span>
                <span className="text-muted-foreground">{level.span - level.intoLevel} XP to next level</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: level.pct + "%" }} />
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Badges earned</span>
                <span className="font-semibold tabular-nums">{state.badges.length}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-success" style={{ width: completion + "%" }} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{passed} of {total} chapters passed · {completion}% complete</p>
            </div>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/profile">View achievements <Icon name="ArrowRight" className="size-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink href="/coding" icon="Code2" title="Coding practice" detail="Solve problems and review attempts" />
        <QuickLink href="/mock" icon="ClipboardCheck" title="Mock tests" detail="Check your placement readiness" />
        <QuickLink href="/practice" icon="BookOpenCheck" title="Practice questions" detail="Strengthen concepts with questions" />
        <QuickLink href="/analytics" icon="ChartNoAxesCombined" title="Your analytics" detail="Find strengths and weak areas" />
      </div>
    </section>
  )
}

function QuickLink({ href, icon, title, detail }: { href: string; icon: string; title: string; detail: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-accent/30">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground">
        <Icon name={icon} className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{detail}</span>
      </span>
      <Icon name="ArrowRight" className="ml-auto size-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}

"use client"

import Link from "next/link"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanyAvatar, SectionProgressBar, ToneBadge } from "@/components/app/ui-bits"
import { Icon } from "@/components/app/icon"
import { PriRing } from "@/components/app/pri-ring"
import { GamificationBadges } from "@/components/app/gamification-badges"
import { getCompany } from "@/lib/data/companies"
import { getSections } from "@/lib/data/content"
import {
  computePRI,
  EMPTY_PROGRESS,
  priBand,
  sectionMastery,
  weakestTopics,
} from "@/lib/scoring"
import { useStoreState } from "@/lib/store"
import type { CompanyId } from "@/lib/types"

function nextChapter(companyId: CompanyId, progress = EMPTY_PROGRESS) {
  for (const section of getSections(companyId)) {
    for (const chapter of section.chapters) {
      if (!progress.chapters[chapter.id]?.passed) return { section, chapter }
    }
  }
  return null
}

export default function DashboardPage() {
  const { state } = useStoreState()
  const primary = state.primary
  const company = getCompany(primary)
  const progress = state.progress[primary] ?? EMPTY_PROGRESS
  const pri = React.useMemo(() => computePRI(primary, progress), [primary, progress])
  const next = React.useMemo(() => nextChapter(primary, progress), [primary, progress])
  const weakest = React.useMemo(() => weakestTopics(state, 1)[0], [state])
  const nextMinutes = React.useMemo(
    () =>
      next
        ? next.chapter.lessons.reduce((total, lesson) => total + lesson.minutes, 0) +
          next.chapter.quiz.length
        : 0,
    [next],
  )

  return (
    <div className="space-y-7">
      <header className="border-b border-border pb-5">
        <p className="text-sm text-muted-foreground">{company.name} preparation</p>
        <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight">Today&apos;s study plan</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Finish one useful task, then check your weak area. That is enough for a good session.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <Card className="border-primary/20 bg-card">
          <CardContent className="p-5 sm:p-6">
            {next ? (
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <Icon name={next.section.icon} className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-primary">Start here: {next.section.short}</p>
                    <h2 className="mt-1 font-heading text-xl font-semibold">{next.chapter.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      About {Math.max(5, nextMinutes)} minutes, including the chapter quiz.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href={`/learn/${primary}/${next.section.id}/${next.chapter.id}`}>
                      Continue chapter <Icon name="ArrowRight" className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href={`/learn/${primary}`}>View company track</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <Icon name="CircleCheckBig" className="mt-0.5 size-6 text-[color:var(--success)]" />
                  <div>
                    <h2 className="font-heading text-xl font-semibold">Track complete</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You have finished the chapters in this track. Use a mock to practise under time pressure.
                    </p>
                  </div>
                </div>
                <Button asChild><Link href="/mock">Take a mock</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex h-full flex-col items-center justify-center p-5 text-center">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CompanyAvatar id={primary} size={24} /> {company.short}
            </div>
            <div className="mt-3"><PriRing value={pri} tone={priBand(pri).tone} label="Readiness" /></div>
            <div className="mt-2"><ToneBadge band={priBand(pri)} /></div>
            <Link href="/readiness" className="mt-3 text-sm font-medium text-primary hover:underline">See progress details</Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <GamificationBadges />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon name="Wrench" className="size-4 text-primary" /> Weakest topic
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weakest ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{weakest.topic}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Recent accuracy: {weakest.accuracy}%</p>
                </div>
                <Button asChild variant="outline"><Link href="/analytics">Review weak topics</Link></Button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-sm text-sm text-muted-foreground">Answer a quiz or practice set and your weak topics will appear here.</p>
                <Button asChild variant="outline"><Link href="/practice">Start practice</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon name="ClipboardCheck" className="size-4 text-primary" /> Next mock
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{progress.mockScores.length ? `${progress.mockScores.length} mock${progress.mockScores.length === 1 ? "" : "s"} completed` : "Take your first mock"}</p>
              <p className="mt-1 text-sm text-muted-foreground">Use a mock after a study block to check speed and accuracy.</p>
            </div>
            <Button asChild variant="outline"><Link href="/mock">Open mocks</Link></Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold">Track progress</h2>
          <Link href={`/learn/${primary}`} className="text-sm font-medium text-primary hover:underline">Open all chapters</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {getSections(primary).map((section) => (
            <SectionProgressBar key={section.id} label={section.short} icon={section.icon} value={sectionMastery(primary, section.id, progress)} />
          ))}
        </div>
      </section>
    </div>
  )
}

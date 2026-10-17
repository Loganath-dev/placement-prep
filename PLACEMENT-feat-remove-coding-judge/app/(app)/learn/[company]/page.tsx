"use client"

import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { PriRing } from "@/components/app/pri-ring"
import {
  CompanyAvatar,
  ProbabilityInputs,
  ProbabilityStat,
} from "@/components/app/ui-bits"
import { COMPANY_BY_ID, getCompany } from "@/lib/data/companies"
import { getSections } from "@/lib/data/content"
import {
  canAccessMockCompany,
  canAccessLearningSection,
  premiumPriceLabel,
} from "@/lib/access"
import { codingProblemsForCompany } from "@/lib/data/coding-problems"
import { interviewForCompany } from "@/lib/data/interview"
import { mocksForCompany } from "@/lib/data/mocks"
import { pyqsForCompany } from "@/lib/data/pyqs"
import {
  computePRI,
  EMPTY_PROGRESS,
  priBand,
  sectionMastery,
} from "@/lib/scoring"
import { useStore } from "@/lib/store"
import type { Chapter, CompanyId, Section } from "@/lib/types"

type NextLearningStep = { section: Section; chapter: Chapter } | null

function findNextChapter(sections: Section[], progress = EMPTY_PROGRESS): NextLearningStep {
  for (const section of sections) {
    for (const chapter of section.chapters) {
      if (!progress.chapters[chapter.id]?.passed) {
        return { section, chapter }
      }
    }
  }
  return null
}

export default function CompanyTrackPage() {
  const params = useParams<{ company: string }>()
  const { state, setPrimary } = useStore()
  const companyId = params.company as CompanyId
  if (!COMPANY_BY_ID[companyId]) notFound()

  const company = getCompany(companyId)
  const progress = state.progress[companyId] ?? EMPTY_PROGRESS
  const pri = computePRI(companyId, progress)
  const sections = getSections(companyId)
  const isPrimary = state.primary === companyId
  const next = findNextChapter(sections, progress)
  const totalChapters = sections.reduce((sum, section) => sum + section.chapters.length, 0)
  const totalLessons = sections.reduce(
    (sum, section) => sum + section.chapters.reduce((n, chapter) => n + chapter.lessons.length, 0),
    0,
  )
  const quizQuestionCount = sections.reduce(
    (sum, section) => sum + section.chapters.reduce((n, chapter) => n + chapter.quiz.length, 0),
    0,
  )
  const pyqCount = pyqsForCompany(companyId).length
  const mockCount = mocksForCompany(companyId).length
  const interviewCount = interviewForCompany(companyId).length
  const codingCount = codingProblemsForCompany(companyId).length
  const mockLocked = !canAccessMockCompany(companyId, state.premium)

  return (
    <div className="space-y-6">
      <Link
        href="/learn"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <Icon name="ChevronRight" className="size-4 rotate-180" /> All tracks
      </Link>

      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-5 p-6 sm:flex-row sm:items-center">
          <PriRing value={pri} tone={priBand(pri).tone} size={120} />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <CompanyAvatar id={companyId} size={36} />
              <h1 className="font-heading text-2xl font-bold">{company.name}</h1>
            </div>
            <p className="mt-1 text-muted-foreground">{company.blurb}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <ProbabilityStat pri={pri} compact />
              {company.eligibility ? (
                <Link
                  href={`/practice?company=${companyId}`}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  PYQs & eligibility <Icon name="ArrowRight" className="size-3.5" />
                </Link>
              ) : null}
            </div>
            <div className="mt-3">
              <ProbabilityInputs companyId={companyId} progress={progress} compact />
            </div>
          </div>
          {!isPrimary && !company.isGeneral ? (
            <Button variant="outline" onClick={() => setPrimary(companyId)}>
              <Icon name="Target" className="size-4" /> Make primary
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <TrackActionPanel
        companyId={companyId}
        next={next}
        premium={state.premium}
        mockLocked={mockLocked}
      />

      <TrackDepthPanel
        lessons={totalLessons}
        chapters={totalChapters}
        quizQuestions={quizQuestionCount}
        pyqs={pyqCount}
        mocks={mockCount}
        interviews={interviewCount}
        coding={codingCount}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {sections.map((s, sectionIndex) => {
          const mastery = sectionMastery(companyId, s.id, progress)
          const passed = s.chapters.filter((c) => progress.chapters[c.id]?.passed).length
          const locked = !canAccessLearningSection(sectionIndex, state.premium)
          const sectionCard = (
            <Card className="h-full transition-all group-hover:border-primary/40">
              <CardContent className="flex items-center gap-4 p-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon name={s.icon} className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-heading font-semibold">{s.name}</p>
                    {locked ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Premium
                      </span>
                    ) : null}
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{s.blurb}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${mastery}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {passed}/{s.chapters.length}
                    </span>
                  </div>
                  {locked ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Upgrade to unlock this section.
                    </p>
                  ) : null}
                </div>
                {locked ? (
                  <Icon name="Lock" className="size-5 shrink-0 text-primary" />
                ) : (
                  <Icon
                    name="ChevronRight"
                    className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  />
                )}
              </CardContent>
            </Card>
          )

          return (
            locked ? (
              <div key={s.id} aria-disabled className="group cursor-not-allowed opacity-80">
                {sectionCard}
              </div>
            ) : (
              <Link key={s.id} href={`/learn/${companyId}/${s.id}`} className="group">
                {sectionCard}
              </Link>
            )
          )
        })}
      </div>
    </div>
  )
}

function TrackActionPanel({
  companyId,
  next,
  premium,
  mockLocked,
}: {
  companyId: CompanyId
  next: NextLearningStep
  premium: boolean
  mockLocked: boolean
}) {
  const actions = [
    {
      title: "Continue lessons",
      description: next
        ? `${next.section.short}: ${next.chapter.title}`
        : "All chapters cleared. Move to mocks and interviews.",
      href: next ? `/learn/${companyId}/${next.section.id}/${next.chapter.id}` : `/mock?company=${companyId}`,
      icon: next ? next.section.icon : "Trophy",
      locked: false,
      meta: next ? "Next learning step" : "Revision mode",
    },
    {
      title: "PYQ practice",
      description: "Company-pattern questions with answer explanations.",
      href: `/practice?company=${companyId}`,
      icon: "BookOpen",
      locked: false,
      meta: "Pattern recognition",
    },
    {
      title: "Mock tests",
      description: mockLocked
        ? `Company mocks unlock with Premium (${premiumPriceLabel()}).`
        : "Timed simulation with section pressure.",
      href: mockLocked ? "/settings" : `/mock?company=${companyId}`,
      icon: mockLocked ? "Lock" : "Target",
      locked: mockLocked,
      meta: premium || !mockLocked ? "Drive simulation" : "Premium",
    },
    {
      title: "Coding ladder",
      description: "Solve original problems with samples and editorials.",
      href: `/coding?company=${companyId}`,
      icon: "Code2",
      locked: false,
      meta: "Implementation",
    },
    {
      title: "Interview bank",
      description: "Technical, HR, domain and capstone prompts.",
      href: `/interview?company=${companyId}`,
      icon: "Mic",
      locked: false,
      meta: "Offer conversion",
    },
  ]

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-heading text-lg font-semibold">Track action plan</h2>
        <p className="text-sm text-muted-foreground">
          Use this path after choosing a target: learn, practise the pattern, simulate, then convert the interview.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className={`rounded-xl border p-3 transition-all hover:border-primary/40 hover:bg-muted/40 ${
              action.locked ? "border-primary/30 bg-primary/5" : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon name={action.icon} className="size-4" />
              </span>
              <span className="text-xs font-medium text-muted-foreground">{action.meta}</span>
            </div>
            <p className="mt-3 font-semibold">{action.title}</p>
            <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{action.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function TrackDepthPanel({
  lessons,
  chapters,
  quizQuestions,
  pyqs,
  mocks,
  interviews,
  coding,
}: {
  lessons: number
  chapters: number
  quizQuestions: number
  pyqs: number
  mocks: number
  interviews: number
  coding: number
}) {
  const stats = [
    { label: "Chapters", value: chapters },
    { label: "Lessons", value: lessons },
    { label: "Chapter questions", value: quizQuestions },
    { label: "PYQs", value: pyqs },
    { label: "Mocks", value: mocks },
    { label: "Interview prompts", value: interviews },
    { label: "Coding problems", value: coding },
  ]

  return (
    <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-border bg-muted/30 p-3">
          <p className="font-heading text-xl font-bold tabular-nums">{stat.value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </section>
  )
}

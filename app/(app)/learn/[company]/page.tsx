"use client"

import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/app-icon"
import { CompanyAvatar } from "@/app/ui-bits"
import { COMPANY_BY_ID, getCompany } from "@/lib/data/companies"
import { getSections } from "@/lib/data/content-catalog"
import {
  canAccessLearningSection,
} from "@/lib/access"
import { EMPTY_PROGRESS, sectionMastery } from "@/lib/scoring"
import { getPassedLessonIds } from "@/lib/learning-progress"
import { useStore } from "@/lib/store"
import type { CompanyId } from "@/lib/types"
import type { ChapterCatalogItem, SectionCatalogItem } from "@/lib/data/content-catalog"

type NextLearningStep = { section: SectionCatalogItem; chapter: ChapterCatalogItem } | null

function findNextChapter(sections: SectionCatalogItem[], progress = EMPTY_PROGRESS): NextLearningStep {
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
  if (companyId === "general") notFound()
  if (!COMPANY_BY_ID[companyId]) notFound()

  const company = getCompany(companyId)
  const progress = state.progress[companyId] ?? EMPTY_PROGRESS
  const allSections = getSections(companyId)
  const sections = allSections.filter((section) => section.id !== "coding")
  const isPrimary = state.primary === companyId
  const next = findNextChapter(sections, progress)

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
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <CompanyAvatar id={companyId} size={36} />
              <h1 className="font-heading text-2xl font-bold">{company.name}</h1>
            </div>
            <p className="mt-1 text-muted-foreground">{company.blurb}</p>
            <div className="mt-3">
              <Link
                href={`/practice?company=${companyId}`}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Practice questions <Icon name="ArrowRight" className="size-3.5" />
              </Link>
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
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {sections.map((s) => {
          const sectionIndex = allSections.findIndex((item) => item.id === s.id)
          const mastery = sectionMastery(companyId, s.id, progress)
          const passed = s.chapters.filter((c) => progress.chapters[c.id]?.passed).length
          const totalLessons = s.chapters.reduce((sum, chapter) => sum + (chapter.lessons?.length ?? 0), 0)
          const passedLessons = s.chapters.reduce((sum, chapter) => sum + getPassedLessonIds(progress.chapters[chapter.id]?.learning).size, 0)
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
                      {passedLessons}/{totalLessons} lessons
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{passed}/{s.chapters.length} chapters passed</p>
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
}: {
  companyId: CompanyId
  next: NextLearningStep
  premium: boolean
}) {
  const actions = [
    {
      title: "Continue lessons",
      description: next ? `${next.section.short}: ${next.chapter.title}` : "All chapters cleared. Revisit a topic or take a mock.",
      href: next ? `/learn/${companyId}/${next.section.id}/${next.chapter.id}` : `/learn/${companyId}`,
      icon: "GraduationCap",
      locked: false,
      meta: next ? "Next learning step" : "Revision mode",
    },
    {
      title: "PYQ practice",
      description: "Company-pattern questions with answer explanations.",
      href: `/practice?company=${companyId}`,
      icon: "BookOpen",
      locked: false,
      meta: "Pattern practice",
    },
    {
      title: "Mock tests",
      description: "Your first company mock is free. Premium unlocks the complete 10-paper series.",
      href: `/mock?company=${companyId}`,
      icon: "Target",
      locked: false,
      meta: premium ? "10 mock papers" : "1 free · 9 Premium",
    },
  ]

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-heading text-lg font-semibold">Track action plan</h2>
        <p className="text-sm text-muted-foreground">
          Learn the concepts, practise company-pattern questions and check your understanding with mock assessments.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
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

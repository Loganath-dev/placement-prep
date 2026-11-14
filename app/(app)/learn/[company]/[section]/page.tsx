"use client"

import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/app-icon"
import { COMPANY_BY_ID, getCompany } from "@/lib/data/companies"
import { getSection, getSections } from "@/lib/data/content-catalog"
import { canAccessLearningChapter } from "@/lib/access"
import { EMPTY_PROGRESS } from "@/lib/scoring"
import { getPassedLessonIds } from "@/lib/learning-progress"
import { useStore } from "@/lib/store"
import type { CompanyId, SectionId } from "@/lib/types"
import type { ChapterCatalogItem } from "@/lib/data/content-catalog"

type LearningGroup = { id: string; name: string; chapters: ChapterCatalogItem[] }

export default function SectionPage() {
  const params = useParams<{ company: string; section: string }>()
  const { state } = useStore()
  const companyId = params.company as CompanyId
  const sectionId = params.section as SectionId
  if (!COMPANY_BY_ID[companyId]) notFound()
  if (sectionId === "comm-interview" || (sectionId === "coding" && companyId !== "general")) notFound()
  const section = getSection(companyId, sectionId)
  if (!section) notFound()
  const sectionIndex = getSections(companyId).findIndex((item) => item.id === sectionId)
  const company = getCompany(companyId)
  const sectionTitle = companyId === "general" && sectionId === "coding" ? "Programming Languages, DSA & SQL" : section.name
  const progress = state.progress[companyId] ?? EMPTY_PROGRESS

  const groups = section.chapters.reduce<LearningGroup[]>((items, chapter) => {
    const id = chapter.pathId ?? section.id
    const name = chapter.pathName ?? section.name
    const existing = items.find((item) => item.id === id)
    if (existing) existing.chapters.push(chapter)
    else items.push({ id, name, chapters: [chapter] })
    return items
  }, [])

  return (
    <div className="space-y-7">
      <Link
        href={companyId === "general" ? "/learn" : `/learn/${companyId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <Icon name="ChevronRight" className="size-4 rotate-180" /> {companyId === "general" ? "All learning paths" : `${company.short} track`}
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon name={section.icon} className="size-7" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Learning roadmap</p>
          <h1 className="font-heading text-2xl font-bold">{sectionTitle}</h1>
          <p className="text-muted-foreground">{companyId === "general" && sectionId === "coding" ? "Choose a language, DSA or SQL/DBMS path and progress from fundamentals to advanced concepts." : section.blurb}</p>
        </div>
      </div>

      {groups.map((group) => {
        const passed = group.chapters.filter((chapter) => progress.chapters[chapter.id]?.passed).length
        const pathPercent = group.chapters.length
          ? Math.round((passed / group.chapters.length) * 100)
          : 0

        return (
          <section key={group.id} id={`path-${group.id}`} className="scroll-mt-6 space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-semibold">{group.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {group.chapters.length} chapters · {group.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0)} lessons
                </p>
              </div>
              <div className="min-w-28">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{passed}/{group.chapters.length} passed</span>
                  <span>{pathPercent}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pathPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="sb-chapter-journey">
              <svg className="sb-chapter-journey-line" viewBox="0 0 700 500" preserveAspectRatio="none" aria-hidden="true">
                <path d="M170 35 C170 105 530 90 530 165 S170 240 170 315 S530 390 530 465" fill="none" stroke="#d7e8df" strokeWidth="5" strokeLinecap="round" strokeDasharray="3 13" />
              </svg>
              {group.chapters.map((chapter, pathIndex) => {
                const globalIndex = section.chapters.findIndex((item) => item.id === chapter.id)
                const cp = progress.chapters[chapter.id]
                const learning = cp?.learning
                const previous = pathIndex === 0 ? null : group.chapters[pathIndex - 1]
                const previousPassed = previous ? !!progress.chapters[previous.id]?.passed : true
                const paywalled = !canAccessLearningChapter(sectionIndex, globalIndex, state.premium, pathIndex)
                const gateLocked = !previousPassed
                const clickable = !gateLocked && !paywalled
                const href = `/learn/${companyId}/${sectionId}/${chapter.id}`
                const passedLessonIds = getPassedLessonIds(learning)
                const lessonsComplete = chapter.lessons.length > 0 && chapter.lessons.every((lesson) => passedLessonIds.has(lesson.id))
                const recallComplete = Boolean(learning?.recallCompletedAt)
                const chapterComplete = Boolean(cp?.passed)
                const nodeState = chapterComplete ? "complete" : clickable ? "current" : "locked"
                const recallUnlocked = lessonsComplete && clickable
                const practiceUnlocked = recallComplete && clickable
                const stages = [
                  {
                    key: "lessons",
                    title: "Learning lessons",
                    description: `${chapter.lessons.length} flashcard lessons · Learn concepts with worked examples`,
                    href,
                    complete: lessonsComplete,
                    unlocked: clickable,
                    icon: "BookOpen" as const,
                    status: lessonsComplete ? "Completed" : clickable ? "Start learning" : paywalled ? "Premium chapter" : "Locked",
                  },
                  {
                    key: "recall",
                    title: "Chapter Recall",
                    description: "Retrieve formulas, rules and key ideas from memory",
                    href: `${href}#chapter-recall`,
                    complete: recallComplete,
                    unlocked: recallUnlocked || recallComplete,
                    icon: "Brain" as const,
                    status: recallComplete ? "Completed" : recallUnlocked ? "Unlocks after lessons" : "Complete all lessons first",
                  },
                  {
                    key: "practice",
                    title: "Chapter Practice",
                    description: "Chapter assessment · Score at least 70% to pass this chapter",
                    href: `${href}#chapter-assessment`,
                    complete: chapterComplete,
                    unlocked: practiceUnlocked || chapterComplete,
                    icon: "ClipboardCheck" as const,
                    status: chapterComplete ? `Passed · ${cp?.bestScore ?? 0}%` : practiceUnlocked ? "Ready to practice" : "Complete Recall first",
                  },
                ]
                return (
                  <div key={chapter.id} className={`sb-chapter-journey-row ${pathIndex % 2 === 0 ? "is-left" : "is-right"}`}>
                    <span className="sb-chapter-journey-node" data-state={nodeState} aria-hidden="true">
                      {chapterComplete ? <Icon name="Check" className="size-5" /> : paywalled || gateLocked ? <Icon name="Lock" className="size-4" /> : pathIndex + 1}
                    </span>
                    <Card className={`sb-chapter-journey-card ${chapterComplete ? "is-complete" : ""} ${!clickable ? "is-locked" : ""}`}>
                      <CardContent className="p-4 sm:p-5">
                        <Link href={href} aria-disabled={!clickable} tabIndex={clickable ? undefined : -1} onClick={(event) => { if (!clickable) event.preventDefault() }} className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Chapter {pathIndex + 1}</p>
                              <h3 className="mt-1 font-semibold leading-snug">{chapter.title}</h3>
                              <p className="mt-1 text-sm text-muted-foreground">{chapter.summary}</p>
                            </div>
                            <span className="mt-1 shrink-0 text-muted-foreground">{paywalled || gateLocked ? <Icon name="Lock" className="size-4" /> : <Icon name="ArrowRight" className="size-5" />}</span>
                          </div>
                        </Link>
                        <div className="sb-chapter-stage-path" aria-label={`Chapter ${pathIndex + 1} learning stages`}>
                          {stages.map((stage, stageIndex) => {
                            const state = stage.complete ? "complete" : stage.unlocked ? "current" : "locked"
                            return (
                              <div className={`sb-chapter-stage-row ${stageIndex % 2 === 0 ? "is-left" : "is-right"}`} key={stage.key}>
                                <span className="sb-chapter-stage-node" data-state={state} aria-hidden="true">
                                  {stage.complete ? <Icon name="Check" className="size-4" /> : stage.unlocked ? <Icon name={stage.icon} className="size-4" /> : <Icon name="Lock" className="size-3.5" />}
                                </span>
                                <Link
                                  href={stage.href}
                                  aria-disabled={!stage.unlocked}
                                  tabIndex={stage.unlocked ? undefined : -1}
                                  onClick={(event) => { if (!stage.unlocked) event.preventDefault() }}
                                  className={`sb-chapter-stage-card ${state === "complete" ? "is-complete" : ""} ${state === "locked" ? "is-locked" : ""}`}
                                >
                                  <span className="min-w-0">
                                    <span className="block text-sm font-semibold">{stage.title}</span>
                                    <span className="mt-0.5 block text-xs text-muted-foreground">{stage.description}</span>
                                    <span className="mt-1.5 block text-[11px] font-medium" data-stage-status={state}>{stage.status}</span>
                                  </span>
                                  <Icon name={stage.complete ? "CheckCircle" : stage.unlocked ? "ArrowRight" : "Lock"} className="mt-1 size-4 shrink-0" />
                                </Link>
                              </div>
                            )
                          })}
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">{chapterComplete ? `Chapter passed · ${cp?.bestScore ?? 0}%` : paywalled ? "Premium chapter" : gateLocked ? "Complete the previous chapter first" : "Complete each node in order to unlock the next stage"}</p>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      <p className="rounded-xl bg-muted/50 p-4 text-center text-sm text-muted-foreground">
        The first two lessons in each learning path are free. Premium unlocks every chapter, including advanced practice.
        {!state.premium ? <> <Link href="/pricing" className="font-medium text-primary hover:underline">Explore Premium</Link></> : <> Premium is active — all paths are unlocked.</>}
      </p>
    </div>
  )
}

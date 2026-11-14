 "use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, Code2, Flame, GraduationCap, Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/app/page-header"
import { Icon } from "@/components/app-icon"
import { useStore } from "@/lib/store"
import { getSections } from "@/lib/data/content-catalog"
import { PROGRAMMING_PATHS } from "@/lib/data/programming-paths"
import { SELECTABLE_COMPANIES } from "@/lib/data/companies"
import { EMPTY_PROGRESS } from "@/lib/scoring"
import { getPassedLessonIds } from "@/lib/learning-progress"
import type { CompanyId, SectionId } from "@/lib/types"
import type { ChapterCatalogItem } from "@/lib/data/content-catalog"

type Subject = "aptitude" | "logical-verbal" | "cs-core" | "programming-languages" | "dsa" | "tracks"

const SUBJECTS: Record<Exclude<Subject, "tracks">, { title: string; eyebrow: string; description: string }> = {
  aptitude: {
    title: "Aptitude",
    eyebrow: "Learn · Quantitative aptitude",
    description: "Build numerical reasoning step by step, from arithmetic foundations to placement-level problem solving.",
  },
  "logical-verbal": {
    title: "Logical & Verbal",
    eyebrow: "Learn · Reasoning and communication",
    description: "Develop clear thinking, pattern recognition, grammar and reading comprehension.",
  },
  "cs-core": {
    title: "CS Core",
    eyebrow: "Learn · Computer science fundamentals",
    description: "Understand the core systems and concepts behind software: databases, operating systems, networks and OOP.",
  },
  "programming-languages": {
    title: "Programming Languages",
    eyebrow: "Learn · Language roadmaps",
    description: "Follow only the programming languages you selected. Each path moves from fundamentals to practical problem solving.",
  },
  dsa: {
    title: "Data Structures & Algorithms",
    eyebrow: "Learn · Problem solving",
    description: "Build a strong foundation in complexity, data structures, algorithms and common problem-solving patterns.",
  },
}

export function LearningSubjectPage({ subject }: { subject: Subject }) {
  const { state } = useStore()
  const generalSections = getSections("general")
  // General learning roadmaps must stay company-neutral. Company-specific
  // preparation is available only inside the dedicated Tracks area.
  const primarySections = generalSections
  const progress = state.progress.general ?? EMPTY_PROGRESS

  if (subject === "tracks") {
    const tracks = SELECTABLE_COMPANIES.filter((company) => !company.isGeneral)
    return (
      <div className="space-y-7">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Dashboard</Link>
        <PageHeader eyebrow="Learn · Company preparation" title="Company tracks" description="Explore company-specific preparation after building your foundations. Each track has its own topic coverage and practice." />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tracks.map((company) => (
            <Link key={company.id} href={`/learn/${company.id}`} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/40">
                <CardContent className="flex h-full items-center gap-4 p-5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><GraduationCap className="size-6" /></span>
                  <span className="min-w-0 flex-1"><span className="block font-semibold">{company.name}</span><span className="mt-1 block text-sm text-muted-foreground">{company.blurb}</span></span>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  type SectionGroup = {
    section: (typeof primarySections)[number] | undefined
    chaptersFrom: "general"
    pathId?: string
  }
  type SubjectCard = {
    id: string
    title: string
    description: string
    icon: string
    chapters: ChapterCatalogItem[]
    done: number
    companyId: CompanyId
    sectionId: SectionId
  }

  const sections: SectionGroup[] = subject === "aptitude"
    ? [{ section: primarySections.find((item) => item.id === "quant"), chaptersFrom: "general" as const }]
    : subject === "logical-verbal"
      ? [
          { section: primarySections.find((item) => item.id === "reasoning"), chaptersFrom: "general" as const },
          { section: primarySections.find((item) => item.id === "verbal"), chaptersFrom: "general" as const },
        ]
      : subject === "cs-core"
        ? [{ section: generalSections.find((item) => item.id === "cs-core"), chaptersFrom: "general" as const }]
        : subject === "dsa"
          ? [{ section: generalSections.find((item) => item.id === "coding"), chaptersFrom: "general" as const, pathId: "dsa" }]
          : [{ section: generalSections.find((item) => item.id === "coding"), chaptersFrom: "general" as const, pathId: "languages" }]

  const selectedLanguageIds = state.learningPreferences?.selectedLanguages?.length
    ? state.learningPreferences.selectedLanguages
    : ["lang-python"]

  const cards: SubjectCard[] = sections.flatMap(({ section, chaptersFrom, pathId }) => {
    if (!section) return []
    let chapters = section.chapters
    if (pathId === "dsa") chapters = chapters.filter((chapter) => chapter.pathId === "dsa")
    if (pathId === "languages") chapters = chapters.filter((chapter) => selectedLanguageIds.includes(chapter.pathId ?? ""))
    if (subject === "cs-core") chapters = chapters.filter((chapter) => chapter.pathId !== "sql-dbms")
    const stats = progress
    const done = chapters.filter((chapter) => stats.chapters[chapter.id]?.passed).length
    return [{
      id: section.id,
      title: pathId === "dsa" ? "Data Structures & Algorithms" : section.name,
      description: pathId === "dsa"
        ? PROGRAMMING_PATHS.find((path) => path.id === "dsa")?.description ?? section.name
        : section.short,
      icon: pathId === "dsa" ? "Layers" : section.icon,
      chapters,
      done,
      companyId: "general",
      sectionId: section.id,
    }]
  })

  if (subject === "cs-core") {
    const sqlPath = PROGRAMMING_PATHS.find((path) => path.id === "sql-dbms")
    const coding = generalSections.find((section) => section.id === "coding")
    const sqlChapters = coding?.chapters.filter((chapter) => chapter.pathId === "sql-dbms") ?? []
    if (sqlPath && sqlChapters.length) {
      cards.push({
        id: "sql-dbms",
        title: sqlPath.name,
        description: sqlPath.description,
        icon: sqlPath.icon,
        chapters: sqlChapters,
        done: sqlChapters.filter((chapter) => progress.chapters[chapter.id]?.passed).length,
        companyId: "general",
        sectionId: "coding",
      })
    }
  }

  const languageCards = subject === "programming-languages"
    ? selectedLanguageIds.flatMap((id) => {
        const path = PROGRAMMING_PATHS.find((item) => item.id === id && item.kind === "language")
        const section = generalSections.find((item) => item.id === "coding")
        if (!path || !section) return []
        const chapters = section.chapters.filter((chapter) => chapter.pathId === id)
        return [{
          id,
          title: path.name,
          description: path.description,
          icon: path.icon,
          chapters,
          done: chapters.filter((chapter) => progress.chapters[chapter.id]?.passed).length,
          companyId: "general",
          sectionId: "coding",
        }]
      })
    : []

  const allCards = subject === "programming-languages" ? languageCards : cards
  const meta = SUBJECTS[subject]
  const totalChapters = allCards.reduce((sum, card) => sum + card.chapters.length, 0)
  const completedChapters = allCards.reduce((sum, card) => sum + card.done, 0)
  const totalLessons = allCards.reduce((sum, card) => sum + card.chapters.reduce((count, chapter) => count + (chapter.lessons?.length ?? 0), 0), 0)
  const passedLessons = allCards.reduce((sum, card) => sum + card.chapters.reduce((count, chapter) => {
    return count + getPassedLessonIds(state.progress[card.companyId]?.chapters[chapter.id]?.learning).size
  }, 0), 0)
  const continueTarget = allCards.flatMap((card) => {
    const chapter = card.chapters.find((item) => !state.progress[card.companyId]?.chapters[item.id]?.passed) ?? card.chapters.at(-1)
    return chapter ? [{ href: `/learn/${card.companyId}/${card.sectionId}/${chapter.id}`, title: chapter.title }] : []
  })[0]

  return (
    <div className="space-y-7">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Dashboard</Link>
      <PageHeader eyebrow={meta.eyebrow} title={meta.title} description={meta.description} />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <div><p className="text-sm font-semibold">Your progress in this subject</p><p className="mt-0.5 text-xs text-muted-foreground">{passedLessons} of {totalLessons} lesson checkpoints passed · {completedChapters} of {totalChapters} chapters completed</p></div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tabular-nums text-primary">{totalChapters ? Math.round(completedChapters / totalChapters * 100) : 0}%</span>
          {continueTarget ? <Link href={continueTarget.href} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">{passedLessons ? "Continue learning" : "Start first lesson"}<ArrowRight className="size-4" /></Link> : null}
        </div>
      </div>
      {allCards.length ? (
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {allCards.map((card) => {
            const nextIndex = card.chapters.findIndex((chapter) => !progress.chapters[chapter.id]?.passed)
            const activeIndex = nextIndex < 0 ? Math.max(0, card.chapters.length - 1) : nextIndex
            const percent = card.chapters.length ? Math.round(card.done / card.chapters.length * 100) : 0
            const lessonCount = card.chapters.reduce((n, chapter) => n + (Array.isArray(chapter.lessons) ? chapter.lessons.length : 0), 0)
            return (
              <Card key={card.id} className="overflow-hidden border-border/80 shadow-sm">
                <CardContent className="p-5 sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon name={card.icon} className="size-5" /></span>
                      <div className="min-w-0"><h2 className="font-semibold tracking-tight">{card.title}</h2><p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">{card.description}</p></div>
                    </div>
                    <div className="text-right"><p className="text-sm font-semibold tabular-nums text-foreground">{percent}%</p><p className="text-xs text-muted-foreground">{card.done}/{card.chapters.length} chapters</p></div>
                  </div>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${percent}%` }} /></div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground"><span>{lessonCount} lessons in this path</span><span>{card.chapters.length} learning stops</span></div>
                  <div className="relative mx-auto mt-7 max-w-[620px] py-2">
                    <svg aria-hidden="true" viewBox={`0 0 620 ${Math.max(1, card.chapters.length) * 100}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 hidden w-full text-primary sm:block" style={{ height: `${Math.max(1, card.chapters.length) * 100}px` }}>
                      <path d={`M 222 50 ${card.chapters.slice(1).map((_, i) => { const fromX = i % 2 === 0 ? 222 : 398; const toX = i % 2 === 0 ? 398 : 222; const y = (i + 1) * 100 + 50; return `C ${fromX} ${y - 30}, ${toX} ${y - 30}, ${toX} ${y}` }).join(" ")}`} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="3" strokeDasharray="4 8" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                      {card.chapters.slice(1).map((chapter, i) => {
                        if (!progress.chapters[card.chapters[i].id]?.passed) return null
                        const fromX = i % 2 === 0 ? 222 : 398
                        const toX = i % 2 === 0 ? 398 : 222
                        const y = (i + 1) * 100 + 50
                        return <path key={chapter.id} d={`M ${fromX} ${i * 100 + 50} C ${fromX} ${y - 30}, ${toX} ${y - 30}, ${toX} ${y}`} fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="4 8" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                      })}
                    </svg>
                  <div className="relative flex flex-col gap-5 before:absolute before:bottom-7 before:left-[48px] before:top-7 before:border-l-2 before:border-dashed before:border-border sm:before:hidden">
                    {card.chapters.map((chapter, index) => {
                      const chapterProgress = progress.chapters[chapter.id]
                      const passed = Boolean(chapterProgress?.passed)
                      const current = !passed && index === activeIndex
                      const side = index % 2 === 0 ? "justify-start pl-2 sm:pl-4" : "justify-start pl-2 sm:justify-end sm:pr-4"
                      const href = `/learn/${card.companyId}/${card.sectionId}/${chapter.id}`
                      return (
                        <div key={chapter.id} className={`flex flex-col gap-2 ${side}`}>
                          <Link href={href} aria-current={current ? "step" : undefined} className={`group relative z-10 flex w-[min(100%,420px)] items-center gap-3.5 rounded-2xl border p-3.5 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${current ? "border-primary/45 bg-primary/[0.07] shadow-[0_8px_24px_hsl(var(--primary)/.10)]" : passed ? "border-emerald-200 bg-emerald-50/70 hover:border-emerald-300" : "border-border bg-card hover:border-primary/35 hover:bg-primary/[0.025]"}`}>
                            <span className={`grid size-[52px] shrink-0 place-items-center rounded-full border-2 ${passed ? "border-emerald-600 bg-emerald-600 text-white" : current ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_5px_hsl(var(--primary)/.10)]" : "border-muted-foreground/20 bg-background text-muted-foreground"}`}>
                              {passed ? <Check className="size-5" /> : current ? <Play className="ml-0.5 size-5 fill-current" /> : <span className="text-sm font-semibold tabular-nums">{index + 1}</span>}
                            </span>
                            <span className="min-w-0 flex-1"><span className="line-clamp-2 text-sm font-semibold leading-5 text-foreground sm:text-[15px]">{chapter.title}</span><span className="mt-1 block text-xs text-muted-foreground">{chapter.lessons?.length ?? 0} lessons · {passed ? "Completed" : current ? "Continue learning" : "Up next"}</span></span>
                            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                  </div>
                  {card.chapters.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Lessons will appear here when this path is published.</p> : null}
                  <div className="mt-6 flex justify-center"><span className="inline-flex items-center gap-2 rounded-full bg-muted/70 px-3 py-1.5 text-xs text-muted-foreground"><Flame className="size-3.5 text-orange-500" /> Keep your momentum going</span></div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <Code2 className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-3 font-semibold">No language selected yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Choose a programming language in your onboarding preferences to add its roadmap here.</p>
          <Link href="/settings" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">Update preferences <ArrowRight className="size-4" /></Link>
        </div>
      )}
    </div>
  )
}

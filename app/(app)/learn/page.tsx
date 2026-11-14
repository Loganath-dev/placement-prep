"use client"

import Link from "next/link"
import {
  ArrowRight,
  Brain,
  Calculator,
  Check,
  Code2,
  Cpu,
  GraduationCap,
  Layers3,
  LockKeyhole,
  Play,
  Sparkles,
  Target,
} from "lucide-react"
import { PageHeader } from "@/app/page-header"
import { useStore } from "@/lib/store"
import { getSections } from "@/lib/data/content-catalog"
import { PROGRAMMING_PATHS } from "@/lib/data/programming-paths"
import { SELECTABLE_COMPANIES } from "@/lib/data/companies"

const SUBJECTS = [
  { id: "aptitude", title: "Quantitative aptitude", short: "Aptitude", description: "Build accuracy with arithmetic, percentages, algebra and data interpretation.", href: "/learn/aptitude", icon: Calculator, time: "Start with the fundamentals" },
  { id: "logical-verbal", title: "Logical & verbal ability", short: "Reasoning and verbal", description: "Recognise patterns, reason through constraints and strengthen grammar and comprehension.", href: "/learn/logical-verbal", icon: Brain, time: "Think with clarity" },
  { id: "cs-core", title: "Computer science core", short: "CS core", description: "Understand databases, operating systems, networks and software principles.", href: "/learn/cs-core", icon: Cpu, time: "Build technical foundations" },
  { id: "programming-languages", title: "Programming languages", short: "Programming", description: "Learn syntax, logic, debugging and practical programming step by step.", href: "/learn/programming-languages", icon: Code2, time: "Turn ideas into code" },
  { id: "dsa", title: "Data structures & algorithms", short: "DSA", description: "Move from core structures to algorithmic patterns and problem solving.", href: "/learn/dsa", icon: Layers3, time: "Learn how to solve" },
  { id: "tracks", title: "Company preparation", short: "Company tracks", description: "Apply your foundations through focused company-pattern preparation.", href: "/learn/tracks", icon: GraduationCap, time: "Prepare with purpose" },
] as const

export default function LearnPage() {
  const { state } = useStore()
  const sections = getSections(state.primary)
  const general = getSections("general")
  const progress = state.progress.general?.chapters ?? {}
  const selectedLanguages = state.learningPreferences?.selectedLanguages?.length
    ? state.learningPreferences.selectedLanguages
    : ["lang-python"]

  function chaptersFor(id: string) {
    if (id === "aptitude") return sections.find((item) => item.id === "quant")?.chapters ?? []
    if (id === "logical-verbal") return sections.filter((item) => item.id === "reasoning" || item.id === "verbal").flatMap((item) => item.chapters)
    if (id === "cs-core") return [
      ...(general.find((item) => item.id === "cs-core")?.chapters ?? []),
      ...(general.find((item) => item.id === "coding")?.chapters.filter((chapter) => chapter.pathId === "sql-dbms") ?? []),
    ]
    if (id === "programming-languages") return general.find((item) => item.id === "coding")?.chapters.filter((chapter) => selectedLanguages.includes(chapter.pathId ?? "")) ?? []
    if (id === "dsa") return general.find((item) => item.id === "coding")?.chapters.filter((chapter) => chapter.pathId === "dsa") ?? []
    return []
  }

  function countFor(id: string) {
    if (id === "tracks") return SELECTABLE_COMPANIES.filter((company) => !company.isGeneral).length
    return chaptersFor(id).length
  }

  function statsFor(id: string) {
    const chapters = chaptersFor(id)
    const done = chapters.filter((chapter) => progress[chapter.id]?.passed).length
    return { done, total: chapters.length, percent: chapters.length ? Math.round((done / chapters.length) * 100) : 0 }
  }

  const completed = SUBJECTS.filter((subject) => subject.id !== "tracks" && statsFor(subject.id).total > 0 && statsFor(subject.id).percent === 100).length
  const currentIndex = SUBJECTS.findIndex((subject) => subject.id !== "tracks" && statsFor(subject.id).percent < 100 && statsFor(subject.id).total > 0)
  const focusLabels: Record<string, string> = { aptitude: "Aptitude", reasoning: "Logical & verbal", "cs-core": "CS core", programming: "Programming", dsa: "DSA" }
  const focusTitle = focusLabels[state.learningPreferences?.focusArea ?? "programming"]

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Your learning journey"
        title="A clear path from basics to confident practice."
        description="Choose a learning area and follow its roadmap. Each step builds on the one before it, so you always know what to do next."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Target className="size-4 text-primary" /> Learning areas</div>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{SUBJECTS.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Structured preparation paths</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="size-4 text-primary" /> Areas completed</div>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{completed}</p>
          <p className="mt-1 text-xs text-muted-foreground">Based on passed chapters</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Sparkles className="size-4 text-primary" /> Your focus</div>
          <p className="mt-2 text-lg font-semibold tracking-tight">{focusTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">A steady routine beats a rushed one</p>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-white px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">The roadmap</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Your next step is already here.</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Move through each area at your own pace. Completed steps stay visible, your current focus is highlighted, and the next path is always within reach.</p>
        </div>

        <div className="sb-journey mt-8">
          <svg className="sb-journey-line" viewBox="0 0 700 900" preserveAspectRatio="none" aria-hidden="true">
            <path d="M170 55 C170 145 530 125 530 235 S170 330 170 415 S530 500 530 595 S170 680 170 770" fill="none" stroke="#d7e8df" strokeWidth="5" strokeLinecap="round" strokeDasharray="3 13" />
          </svg>
          {SUBJECTS.map((subject, index) => {
            const Icon = subject.icon
            const stats = statsFor(subject.id)
            const isCurrent = subject.id !== "tracks" && index === currentIndex
            const isComplete = subject.id !== "tracks" && stats.total > 0 && stats.percent === 100
            const isLocked = false
            const stateName = isComplete ? "complete" : isCurrent ? "current" : isLocked ? "locked" : "upcoming"
            const count = countFor(subject.id)
            const detail = subject.id === "programming-languages"
              ? `${selectedLanguages.length} selected language${selectedLanguages.length === 1 ? "" : "s"}`
              : subject.id === "tracks" ? `${count} company tracks` : `${count} chapters`
            return (
              <div className="sb-journey-row" key={subject.id}>
                <Link href={subject.href} className="sb-journey-card group">
                  <span className="sb-journey-node" data-state={stateName}>
                    {isComplete ? <Check className="size-5" /> : isCurrent ? <Play className="size-4 fill-current" /> : isLocked ? <LockKeyhole className="size-4" /> : <Icon className="size-5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">{subject.title}</span>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{subject.description}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 sb-journey-meta">
                      <span>{detail}</span>
                      {subject.id !== "tracks" ? <><span aria-hidden="true">·</span><span>{stats.done} completed</span></> : null}
                    </span>
                    {subject.id !== "tracks" && stats.total > 0 ? (
                      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`${subject.short} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={stats.percent}>
                        <span className="block h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${stats.percent}%` }} />
                      </span>
                    ) : null}
                  </span>
                </Link>
              </div>
            )
          })}
        </div>

        <div className="mx-auto mt-2 flex max-w-xl items-center justify-center gap-2 rounded-xl bg-[#e9f4ef] px-4 py-3 text-center text-sm text-[#176b59]">
          <Sparkles className="size-4 shrink-0" />
          <span>Small, consistent sessions build stronger foundations.</span>
        </div>
      </section>
    </div>
  )
}

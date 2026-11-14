 "use client"

import Link from "next/link"
import { ArrowRight, BookOpen, Brain, Calculator, CheckCircle2, Clock3, Code2, Cpu, Flame, GraduationCap, Layers3, Sparkles, Target, Trophy } from "lucide-react"
import { useStore } from "@/lib/store"
import { getSections } from "@/lib/data/content-catalog"
import { PROGRAMMING_PATHS } from "@/lib/data/programming-paths"
import { levelFromXP } from "@/lib/scoring"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { BADGES, earnedBadges } from "@/lib/data/badges"
import { Icon } from "@/components/app-icon"

type Focus = "aptitude" | "reasoning" | "cs-core" | "programming" | "dsa"

const FOCUS_LABELS: Record<Focus, string> = {
  aptitude: "Aptitude",
  reasoning: "Logical & verbal",
  "cs-core": "CS core",
  programming: "Programming",
  dsa: "DSA",
}

function progressFor(chapters: { id: string }[], progress: Record<string, { passed?: boolean }>) {
  const done = chapters.filter((chapter) => progress[chapter.id]?.passed).length
  return { done, total: chapters.length, percent: chapters.length ? Math.round((done / chapters.length) * 100) : 0 }
}

export function DashboardExperience() {
  const { state } = useStore()
  const sections = getSections("general")
  const codingSection = sections.find((section) => section.id === "coding")
  const progress = state.progress.general?.chapters ?? {}
  const preferences = state.learningPreferences
  const focus: Focus = preferences?.focusArea && preferences.focusArea in FOCUS_LABELS
    ? preferences.focusArea
    : "programming"
  const focusLabel = FOCUS_LABELS[focus]
  const confidenceGuidance = preferences?.confidence === "independent"
    ? "You can move through the roadmap at a quicker pace and revisit any concept that feels uncertain."
    : preferences?.confidence === "some-basics"
      ? "We’ll connect the basics to practical questions, one concept at a time."
      : "We’ll begin with clear explanations and worked examples, then build up to independent practice."
  const level = levelFromXP(state.xp)
  const badges = earnedBadges(state)

  const sectionChapters = (id: string) => sections.find((section) => section.id === id)?.chapters ?? []
  const pathChapters = (pathId: string) => codingSection?.chapters.filter((chapter) => chapter.pathId === pathId) ?? []

  function firstUnfinished<T extends { id: string }>(chapters: T[]): T | undefined {
    return chapters.find((chapter) => !progress[chapter.id]?.passed) ?? chapters[0]
  }

  const aptitude = sectionChapters("quant")
  const logical = [...sectionChapters("reasoning"), ...sectionChapters("verbal")]
  const csCore = [
    ...sectionChapters("cs-core"),
    ...pathChapters("sql-dbms"),
  ]
  const selectedLanguageIds = preferences?.selectedLanguages ?? []
  const languagePaths = PROGRAMMING_PATHS.filter((path) => path.kind === "language" && selectedLanguageIds.includes(path.id))
  const dsa = pathChapters("dsa")

  const preferredLanguageId = selectedLanguageIds[0] ?? "lang-python"
  const focusChapters = focus === "aptitude"
    ? aptitude
    : focus === "reasoning"
      ? logical
      : focus === "cs-core"
        ? csCore
        : focus === "dsa"
          ? dsa
          : pathChapters(preferredLanguageId)

  const nextChapter = firstUnfinished(focusChapters)
  const nextSectionId = focus === "aptitude" ? "quant" : focus === "reasoning" ? (sectionChapters("reasoning").some((chapter) => chapter.id === nextChapter?.id) ? "reasoning" : "verbal") : focus === "cs-core" ? (sectionChapters("cs-core").some((chapter) => chapter.id === nextChapter?.id) ? "cs-core" : "coding") : "coding"
  const nextHref = nextChapter ? `/learn/general/${nextSectionId}/${nextChapter.id}` : "/learn/aptitude"
  const nextTitle = nextChapter?.title ?? "Explore your learning paths"

  const allLearningChapters = [
    ...aptitude,
    ...logical,
    ...csCore,
    ...languagePaths.flatMap((path) => pathChapters(path.id)),
    ...dsa,
  ]
  const totalDone = allLearningChapters.filter((chapter) => progress[chapter.id]?.passed).length
  const totalLessons = allLearningChapters.length
  const overall = totalLessons ? Math.round((totalDone / totalLessons) * 100) : 0

  const cards = [
    {
      id: "aptitude",
      title: "Aptitude",
      detail: "Build speed and accuracy with numbers, arithmetic and data interpretation.",
      icon: Calculator,
      chapters: aptitude,
      href: "/learn/aptitude",
      count: `${aptitude.length} chapters`,
    },
    {
      id: "reasoning",
      title: "Logical & verbal",
      detail: "Strengthen patterns, critical thinking, grammar and comprehension.",
      icon: Brain,
      chapters: logical,
      href: "/learn/logical-verbal",
      count: `${logical.length} chapters`,
    },
    {
      id: "cs-core",
      title: "CS core",
      detail: "Understand the foundations behind databases, operating systems and networks.",
      icon: Cpu,
      chapters: csCore,
      href: "/learn/cs-core",
      count: `${csCore.length} chapters`,
    },
    {
      id: "dsa",
      title: "Data structures & algorithms",
      detail: "Learn to choose the right approach and solve unfamiliar problems.",
      icon: Layers3,
      chapters: dsa,
      href: "/learn/dsa",
      count: `${dsa.length} chapters`,
    },
  ]
  if (languagePaths.length > 0) {
    const selectedLanguageChapters = languagePaths.flatMap((path) => pathChapters(path.id))
    const firstLanguageChapter = firstUnfinished(selectedLanguageChapters)
    cards.push({
      id: "programming",
      title: "Programming languages",
      detail: "Build practical coding skills through structured language lessons and practice.",
      icon: Code2,
      chapters: selectedLanguageChapters,
      href: firstLanguageChapter
        ? `/learn/general/coding/${firstLanguageChapter.id}`
        : "/learn/programming-languages",
      count: `${selectedLanguageChapters.length} chapters`,
    })
  }

  const orderedCards = [...cards].sort((a, b) => {
    const priority = (id: string) => id === focus ? 0 : 1
    return priority(a.id) - priority(b.id)
  })

  return (
    <div className="space-y-9">
      <section className="sb-dashboard-enter">
        <p className="text-sm font-medium text-[#315fca]">YOUR LEARNING SPACE</p>
        <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-4xl">Welcome back{state.profile.name ? `, ${state.profile.name.split(" ")[0]}` : ""}.</h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">You don’t need to figure out everything today. Just take the next clear step.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-[0_5px_20px_-16px_rgba(20,40,80,0.3)]">
            <Target className="size-4 text-[#315fca]" />
            <span>Daily goal</span>
            <strong className="font-semibold text-slate-900">{preferences?.dailyMinutes ?? 20} min</strong>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(250px,.8fr)]">
        <Card className="sb-dashboard-enter overflow-hidden rounded-3xl border-[#dce4f0] bg-white shadow-[0_18px_50px_-40px_rgba(27,53,100,0.36)]" style={{ animationDelay: "70ms" }}>
          <CardContent className="relative flex h-full min-h-[285px] flex-col justify-between overflow-hidden p-6 sm:p-8">
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full border border-[#e4ebf7]" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-5 -top-10 size-48 rounded-full border border-[#e4ebf7]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#edf3ff] px-3 py-1.5 text-xs font-semibold text-[#315fca]">
                <Sparkles className="size-3.5" /> YOUR NEXT STEP
              </div>
              <h2 className="mt-5 max-w-lg text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-3xl">Keep building your {focusLabel.toLowerCase()} foundation.</h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">{confidenceGuidance}</p>
            </div>
            <div className="relative mt-7 flex flex-wrap items-center gap-4">
              <Button asChild className="h-11 rounded-xl bg-[#315fca] px-5 text-white shadow-[0_8px_20px_-12px_rgba(49,95,202,.7)] hover:bg-[#244fae]">
                <Link href={nextHref}>Continue learning <ArrowRight className="ml-2 size-4" /></Link>
              </Button>
              <span className="text-sm text-slate-500">{nextTitle}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="sb-dashboard-enter rounded-3xl border-[#dce4f0] bg-[#f0f5fd] shadow-none" style={{ animationDelay: "130ms" }}>
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Your progress</p>
                <GraduationCap className="size-5 text-[#315fca]" />
              </div>
              <div className="mt-6 flex items-end gap-2">
                <span className="text-5xl font-semibold tracking-[-0.06em] text-slate-950 tabular-nums">{overall}%</span>
                <span className="pb-1 text-sm text-slate-500">completed</span>
              </div>
              <div role="progressbar" aria-label="Overall learning progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overall} className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-[#315fca] transition-[width] duration-700 ease-out" style={{ width: `${overall}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{totalDone} chapters completed across your learning paths</p>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/80 p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500"><Flame className="size-3.5 text-orange-500" /> Streak</div>
                <p className="mt-1 text-xl font-semibold text-slate-900 tabular-nums">{state.streak.count} <span className="text-xs font-medium text-slate-500">days</span></p>
              </div>
              <div className="rounded-2xl bg-white/80 p-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500"><Trophy className="size-3.5 text-amber-500" /> Level</div>
                <p className="mt-1 text-xl font-semibold text-slate-900 tabular-nums">{level.level} <span className="text-xs font-medium text-slate-500">· {state.xp} XP</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="sb-dashboard-enter" style={{ animationDelay: "190ms" }}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">THE ROADMAP</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-slate-950">Your learning paths</h2>
            <p className="mt-2 text-sm text-slate-600">Move at your own pace. Every path starts with the fundamentals.</p>
          </div>
          <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#315fca] hover:text-[#244fae]">Explore all paths <ArrowRight className="size-4" /></Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {orderedCards.map((card, index) => {
            const Icon = card.icon
            const stats = progressFor(card.chapters, progress)
            return (
              <Link key={card.id} href={card.href} className="sb-path-card group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_28px_-24px_rgba(20,40,80,.3)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-[#b9cbed] hover:shadow-[0_16px_36px_-26px_rgba(20,40,80,.32)]" style={{ animationDelay: `${220 + index * 55}ms` }}>
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#edf3ff] text-[#315fca]"><Icon className="size-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-900">{card.title}</span>
                      <ArrowRight className="size-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#315fca]" />
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-slate-500">{card.detail}</span>
                  </span>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500">{card.count} · {stats.done} completed</span>
                  <span className="font-semibold text-[#315fca]">{stats.percent}%</span>
                </div>
                <div role="progressbar" aria-label={`${card.title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={stats.percent} className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#315fca] transition-[width] duration-500" style={{ width: `${stats.percent}%` }} /></div>
              </Link>
            )
          })}
        </div>
      </section>

      {languagePaths.length > 0 ? (
      <section className="sb-dashboard-enter rounded-3xl border border-slate-200 bg-white p-5 sm:p-6" style={{ animationDelay: "270ms" }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">YOUR SELECTED PATHS</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Programming languages</h2>
            <p className="mt-1 text-sm text-slate-500">Your selected language paths are here when you’re ready. You can add or change them in your preferences.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><Code2 className="size-4" /> {languagePaths.length} learning paths</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {languagePaths.map((path) => {
            const chapters = pathChapters(path.id)
            const stats = progressFor(chapters, progress)
            const next = firstUnfinished(chapters)
            return <Link key={path.id} href={next ? `/learn/general/coding/${next.id}` : "/learn/programming-languages"} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-[#b9cbed] hover:bg-[#edf3ff] hover:text-[#315fca]"><span>{path.short}</span><span className="text-[11px] text-slate-400">{stats.percent}%</span></Link>
          })}

        </div>
      </section>
      ) : null}

      <section className="sb-dashboard-enter grid gap-3 sm:grid-cols-3" style={{ animationDelay: "330ms" }}>
        {[
          { href: "/practice", icon: BookOpen, title: "Practice questions", detail: "Test what you have learned." },
          { href: "/mistakes", icon: CheckCircle2, title: "Review mistakes", detail: "Turn wrong answers into progress." },
          { href: "/analytics", icon: Clock3, title: "Learning insights", detail: "See where to focus next." },
        ].map((item) => {
          const Icon = item.icon
          return <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[#b9cbed]"><span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-600"><Icon className="size-5" /></span><span><span className="block text-sm font-semibold text-slate-900">{item.title}</span><span className="mt-1 block text-xs text-slate-500">{item.detail}</span></span></Link>
        })}
      </section>

      <section id="achievements" className="sb-dashboard-enter rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" style={{ animationDelay: "365ms" }}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">YOUR ACHIEVEMENTS</p><h2 className="mt-1 text-xl font-semibold text-slate-950">Your badge collection</h2><p className="mt-1 text-sm text-slate-500">Build skills, stay consistent and unlock all 15 milestones.</p></div>
          <div className="text-right"><p className="text-2xl font-bold tabular-nums text-slate-900">{badges.length}<span className="text-base font-medium text-slate-400"> / {BADGES.length}</span></p><p className="text-xs text-slate-500">badges earned</p></div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Badge collection progress" aria-valuemin={0} aria-valuemax={BADGES.length} aria-valuenow={badges.length}><div className="h-full rounded-full bg-amber-400 transition-[width] duration-500" style={{ width: `${(badges.length / BADGES.length) * 100}%` }} /></div>
        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
          {BADGES.map((badge) => {
            const unlocked = badge.earned(state)
            return <div key={badge.id} title={`${badge.label}: ${badge.description}`} className={`flex min-h-28 flex-col items-center justify-center rounded-xl border px-2 py-3 text-center transition-colors ${unlocked ? "border-amber-200 bg-amber-50/70" : "border-slate-200 bg-slate-50/70"}`}>
              <span className={`grid size-10 place-items-center rounded-full ${unlocked ? "bg-amber-100 text-amber-700" : "bg-slate-200/70 text-slate-400"}`}><Icon name={unlocked ? badge.icon : "Lock"} className="size-5" /></span>
              <span className={`mt-2 text-xs font-semibold leading-tight ${unlocked ? "text-slate-800" : "text-slate-500"}`}>{badge.label}</span>
              <span className="mt-1 text-[10px] leading-tight text-slate-400">{unlocked ? "Unlocked" : "Locked"}</span>
            </div>
          })}
        </div>
      </section>
      <section className="sb-dashboard-enter grid gap-3 sm:grid-cols-2" style={{ animationDelay: "390ms" }}>
        <Link href="/referrals" className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-[transform,border-color] hover:-translate-y-0.5 hover:border-[#b9cbed]">
          <span><span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">STUDYBENCH AFFILIATE</span><span className="mt-1 block text-lg font-semibold text-slate-950">Join the affiliate programme</span><span className="mt-1 block text-sm text-slate-500">Share your link and earn ₹25 or ₹50 for eligible Premium referrals.</span></span>
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#edf3ff] text-[#315fca]"><ArrowRight className="size-5 transition-transform group-hover:translate-x-1" /></span>
        </Link>
      </section>
    </div>
  )
}

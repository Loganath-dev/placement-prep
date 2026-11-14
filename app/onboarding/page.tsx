 "use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, Clock3, Code2, Cpu, Brain, Calculator, BookOpen, GraduationCap } from "lucide-react"
import { StudyBenchWordmark } from "@/app/brand"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"
import type { LearningPreferences, Profile } from "@/lib/types"
import { cn } from "@/lib/utils"
import { PROGRAMMING_PATHS } from "@/lib/data/programming-paths"

const GRAD_YEARS = Array.from({ length: 13 }, (_, index) => String(2024 + index))

const FOCUS_OPTIONS: {
  id: LearningPreferences["focusArea"]
  title: string
  detail: string
  icon: React.ElementType
}[] = [
  { id: "aptitude", title: "Aptitude", detail: "Numbers, speed and problem solving", icon: Calculator },
  { id: "reasoning", title: "Logical & verbal", detail: "Patterns, language and comprehension", icon: Brain },
  { id: "cs-core", title: "CS core", detail: "DBMS, OS, networks and OOP", icon: Cpu },
  { id: "programming", title: "Programming", detail: "Learn a language from the ground up", icon: Code2 },
  { id: "dsa", title: "Data structures & algorithms", detail: "Build strong problem-solving skills", icon: BookOpen },
]

const CONFIDENCE_OPTIONS: { id: LearningPreferences["confidence"]; title: string; detail: string }[] = [
  { id: "starting", title: "I’m starting from scratch", detail: "Teach me slowly, with clear examples." },
  { id: "some-basics", title: "I know a few basics", detail: "I need structure and more practice." },
  { id: "independent", title: "I can solve some problems", detail: "Help me strengthen gaps and go deeper." },
]

const TIME_OPTIONS: { id: LearningPreferences["dailyMinutes"]; title: string; detail: string }[] = [
  { id: 10, title: "10 minutes", detail: "A small daily step" },
  { id: 20, title: "20 minutes", detail: "A steady routine" },
  { id: 30, title: "30 minutes", detail: "Focused daily learning" },
  { id: 45, title: "45 minutes", detail: "A deeper study session" },
]

const DEFAULT_PREFERENCES: LearningPreferences = {
  focusArea: "programming",
  selectedLanguages: [],
  confidence: "starting",
  dailyMinutes: 20,
}

export default function OnboardingPage() {
  const router = useRouter()
  const { completeOnboarding } = useStore()
  const [step, setStep] = React.useState(0)
  const [profile, setProfile] = React.useState<Profile>({
    name: "",
    college: "",
    branch: "",
    gradYear: "",
    cgpa: "",
    backlogs: "",
  })
  const [preferences, setPreferences] = React.useState<LearningPreferences>(DEFAULT_PREFERENCES)
  const [saving, setSaving] = React.useState(false)

  const requiresProgrammingLanguage = preferences.focusArea === "programming"
  const focusTitle = FOCUS_OPTIONS.find((option) => option.id === preferences.focusArea)?.title ?? "your chosen subject"
  const canContinue =
    step === 0
      ? profile.name.trim().length > 0 && profile.gradYear.length > 0
      : step === 2
        ? !requiresProgrammingLanguage || preferences.selectedLanguages.length > 0
        : true

  async function finish() {
    if (saving || !canContinue) return
    setSaving(true)
    try {
      await completeOnboarding(profile, [], "general", preferences)
      void fetch("/api/email/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, companies: [] }),
      }).catch(() => undefined)
      router.replace("/dashboard")
    } catch {
      setSaving(false)
    }
  }

  function next() {
    if (step < 4) setStep((value) => value + 1)
    else void finish()
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f7f9fc] text-[#17243a]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(54,105,215,0.09),_transparent_68%)]" />
      <div className="relative mx-auto flex min-h-svh w-full max-w-3xl flex-col px-5 py-6 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between">
          <StudyBenchWordmark href="/" />
          <span className="text-xs font-medium text-slate-500">A better way to prepare</span>
        </header>

        <div className="mx-auto my-auto w-full max-w-xl py-12">
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>YOUR STUDY PLAN</span>
              <span>{step + 1} OF 5</span>
            </div>
            <div role="progressbar" aria-label="Onboarding progress" aria-valuemin={0} aria-valuemax={5} aria-valuenow={step + 1} className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-[#315fca] transition-[width] duration-500 ease-out" style={{ width: `${((step + 1) / 5) * 100}%` }} />
            </div>
          </div>

          <section key={step} className="sb-onboard-enter">
            {step === 0 ? (
              <>
                <p className="mb-3 text-sm font-semibold text-[#315fca]">First, the basics</p>
                <h1 className="max-w-lg text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">Let’s make this feel like your space.</h1>
                <p className="mt-3 max-w-lg text-base leading-7 text-slate-600">A little context helps us put the right lessons in front of you. You can change these details later.</p>
                <div className="mt-8 space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_48px_-34px_rgba(20,40,80,0.24)] sm:p-7">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-800">What should we call you?</span>
                    <Input autoComplete="given-name" value={profile.name} onChange={(event) => setProfile((value) => ({ ...value, name: event.target.value }))} placeholder="Your name" className="h-12 rounded-xl border-slate-200 bg-slate-50/70 text-base focus-visible:ring-[#315fca]" />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-800">Your branch <span className="font-normal text-slate-400">· optional</span></span>
                      <Input value={profile.branch} onChange={(event) => setProfile((value) => ({ ...value, branch: event.target.value }))} placeholder="e.g. ECE" className="h-12 rounded-xl border-slate-200 bg-slate-50/70 text-base" />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-800">Graduation year</span>
                      <select value={profile.gradYear} onChange={(event) => setProfile((value) => ({ ...value, gradYear: event.target.value }))} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-[#315fca]">
                        <option value="">Choose year</option>
                        {GRAD_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
                      </select>
                    </label>
                  </div>
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <p className="mb-3 text-sm font-semibold text-[#315fca]">Your first priority</p>
                <h1 className="max-w-lg text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">What would you like to get better at first?</h1>
                <p className="mt-3 text-base leading-7 text-slate-600">Pick one. You’ll still be able to explore every learning path.</p>
                <div className="mt-8 grid gap-3">
                  {FOCUS_OPTIONS.map((option) => {
                    const Icon = option.icon
                    const selected = preferences.focusArea === option.id
                    return (
                      <button key={option.id} type="button" aria-pressed={selected} onClick={() => setPreferences((value) => ({ ...value, focusArea: option.id }))} className={cn("group flex min-h-[76px] items-center gap-4 rounded-2xl border bg-white px-4 py-4 text-left transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315fca] focus-visible:ring-offset-2", selected ? "border-[#315fca] bg-[#eef3ff] shadow-[0_0_0_2px_rgba(49,95,202,0.10)]" : "border-slate-200")}>
                        <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", selected ? "bg-[#315fca] text-white" : "bg-slate-100 text-slate-600")}><Icon className="size-5" /></span>
                        <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{option.title}</span><span className="mt-1 block text-sm text-slate-500">{option.detail}</span></span>
                        <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border", selected ? "border-[#315fca] bg-[#315fca] text-white" : "border-slate-300 text-transparent")}><Check className="size-3" /></span>
                      </button>
                    )
                  })}
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <p className="mb-3 text-sm font-semibold text-[#315fca]">Personalize your roadmap</p>
                <h1 className="max-w-lg text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
                  {requiresProgrammingLanguage ? "Which programming language do you want to learn?" : "Would you also like to learn a programming language?"}
                </h1>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  {requiresProgrammingLanguage
                    ? "Choose at least one language for your programming-first study plan. You can add more later."
                    : "Your first priority is " + focusTitle.toLowerCase() + ". You can skip this and add a language whenever you’re ready."}
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {PROGRAMMING_PATHS.filter((path) => path.kind === "language").map((path) => {
                    const selected = preferences.selectedLanguages.includes(path.id)
                    return (
                      <button key={path.id} type="button" aria-pressed={selected} onClick={() => setPreferences((value) => ({
                        ...value,
                        selectedLanguages: selected
                          ? value.selectedLanguages.filter((id) => id !== path.id)
                          : [...value.selectedLanguages, path.id],
                      }))} className={cn("flex min-h-[68px] items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-left transition-[border-color,background-color,box-shadow] duration-200 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315fca]", selected ? "border-[#315fca] bg-[#eef3ff] shadow-[0_0_0_2px_rgba(49,95,202,0.10)]" : "border-slate-200")}>
                        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold", selected ? "bg-[#315fca] text-white" : "bg-slate-100 text-slate-600")}>{path.short}</span>
                        <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{path.name}</span><span className="mt-0.5 block text-xs text-slate-500">{path.description}</span></span>
                        <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border", selected ? "border-[#315fca] bg-[#315fca] text-white" : "border-slate-300 text-transparent")}>{selected ? <Check className="size-3.5" /> : null}</span>
                      </button>
                    )
                  })}
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {preferences.selectedLanguages.length} selected · {requiresProgrammingLanguage ? "Choose at least one to continue." : "Optional for your selected focus; you can change this later."}
                </p>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <p className="mb-3 text-sm font-semibold text-[#315fca]">Your starting point</p>
                <h1 className="max-w-lg text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">How comfortable do you feel with {focusTitle.toLowerCase()}?</h1>
                <p className="mt-3 text-base leading-7 text-slate-600">There’s no test here. This just helps us set a sensible starting pace.</p>
                <div className="mt-8 grid gap-3">
                  {CONFIDENCE_OPTIONS.map((option, index) => {
                    const selected = preferences.confidence === option.id
                    return (
                      <button key={option.id} type="button" aria-pressed={selected} onClick={() => setPreferences((value) => ({ ...value, confidence: option.id }))} className={cn("flex min-h-[88px] items-center gap-4 rounded-2xl border bg-white px-5 py-4 text-left transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315fca] focus-visible:ring-offset-2", selected ? "border-[#315fca] bg-[#eef3ff] shadow-[0_0_0_2px_rgba(49,95,202,0.10)]" : "border-slate-200")}>
                        <span className={cn("grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold", selected ? "bg-[#315fca] text-white" : "bg-slate-100 text-slate-500")}>{index + 1}</span>
                        <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-900">{option.title}</span><span className="mt-1 block text-sm text-slate-500">{option.detail}</span></span>
                        {selected ? <Check className="size-5 text-[#315fca]" /> : null}
                      </button>
                    )
                  })}
                </div>
              </>
            ) : null}

            {step === 4 ? (
              <>
                <p className="mb-3 text-sm font-semibold text-[#315fca]">Make it realistic</p>
                <h1 className="max-w-lg text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">How much time can you give most days?</h1>
                <p className="mt-3 text-base leading-7 text-slate-600">A small routine you can keep is better than an ambitious plan you can’t.</p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {TIME_OPTIONS.map((option) => {
                    const selected = preferences.dailyMinutes === option.id
                    return (
                      <button key={option.id} type="button" aria-pressed={selected} onClick={() => setPreferences((value) => ({ ...value, dailyMinutes: option.id }))} className={cn("flex min-h-32 flex-col justify-between rounded-2xl border bg-white p-5 text-left transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315fca] focus-visible:ring-offset-2", selected ? "border-[#315fca] bg-[#eef3ff] shadow-[0_0_0_2px_rgba(49,95,202,0.10)]" : "border-slate-200")}>
                        <Clock3 className={cn("size-5", selected ? "text-[#315fca]" : "text-slate-400")} />
                        <span><span className="block text-xl font-semibold tracking-tight text-slate-900">{option.title}</span><span className="mt-1 block text-xs text-slate-500">{option.detail}</span></span>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-5 rounded-2xl bg-[#edf2fb] p-4 text-sm leading-6 text-slate-600">
                  <span className="font-semibold text-slate-800">Your plan:</span> {preferences.dailyMinutes} minutes a day, starting with {focusTitle.toLowerCase()}.
                  {preferences.selectedLanguages.length > 0
                    ? ` ${preferences.selectedLanguages.length} programming language${preferences.selectedLanguages.length === 1 ? "" : "s"} selected.`
                    : " No programming language selected; you can add one later."}
                </div>
              </>
            ) : null}
          </section>

          <div className="mt-9 flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0 || saving} className="text-slate-500 hover:text-slate-900"><ArrowLeft className="mr-2 size-4" /> Back</Button>
            <Button type="button" onClick={next} disabled={!canContinue || saving} className="h-12 rounded-xl bg-[#315fca] px-6 text-white shadow-[0_8px_20px_-12px_rgba(49,95,202,0.65)] hover:bg-[#244fae]">
              {saving ? "Setting up…" : step === 4 ? "Build my study plan" : "Continue"}
              {step === 4 ? <GraduationCap className="ml-2 size-4" /> : <ArrowRight className="ml-2 size-4" />}
            </Button>
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">You can explore every learning path whenever you like.</p>
        </div>
      </div>
    </main>
  )
}

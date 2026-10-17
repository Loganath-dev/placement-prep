"use client"

import { useRouter } from "next/navigation"
import * as React from "react"
import { StudyBenchWordmark } from "@/components/app/brand"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icon } from "@/components/app/icon"
import { CompanyAvatar } from "@/components/app/ui-bits"
import { SELECTABLE_COMPANIES, getCompany } from "@/lib/data/companies"
import { getSections } from "@/lib/data/content"
import { useStore, useStoreSelector } from "@/lib/store"
import type { CompanyId, Profile } from "@/lib/types"
import { cn } from "@/lib/utils"

// Graduation years 2026-2035.
const GRAD_YEARS = Array.from({ length: 10 }, (_, i) => String(2026 + i))

export default function OnboardingPage() {
  const router = useRouter()
  const { completeOnboarding } = useStore()
  const hydrated = useStoreSelector((store) => store.hydrated)
  const onboarded = useStoreSelector((store) => store.state.onboarded)
  const userId = useStoreSelector((store) => store.userId)
  const [step, setStep] = React.useState(0)
  const [submitting, setSubmitting] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [profile, setProfile] = React.useState<Profile>({
    name: "",
    college: "",
    branch: "",
    gradYear: "",
    cgpa: "",
    backlogs: "0",
  })
  const [interested, setInterested] = React.useState<CompanyId[]>([])
  const [primary, setPrimary] = React.useState<CompanyId | "">("")

  function set<K extends keyof Profile>(k: K, v: Profile[K]) {
    setProfile((p) => ({ ...p, [k]: v }))
  }
  function toggle(id: CompanyId) {
    setInterested((list) => {
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
      if (!next.includes(primary as CompanyId)) setPrimary(next[0] ?? "")
      else if (!primary && next.length) setPrimary(next[0])
      return next
    })
  }

  const canNextProfile = profile.name.trim() && profile.gradYear
  const canNextCompanies = interested.length > 0

  React.useEffect(() => {
    if (hydrated && onboarded && userId) router.replace("/dashboard")
  }, [hydrated, onboarded, userId, router])

  async function finish() {
    if (submitting) return
    setSubmitting(true)
    setSaveError(null)
    const prim = (primary || interested[0] || "general") as CompanyId
    const companies = interested.map(
      (id) => SELECTABLE_COMPANIES.find((company) => company.id === id)?.short ?? id.toUpperCase(),
    )
    try {
      await completeOnboarding(profile, interested, prim)
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Could not save your onboarding answers. Check your connection and try again.",
      )
      setSubmitting(false)
      return
    }
    void fetch("/api/email/welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profile.name, companies }),
    }).catch(() => {
      // Email should never block a student from reaching the dashboard.
    })
    // Land on the first chapter so new users get immediate value, not a blank dashboard.
    const sections = getSections(prim)
    const firstSection = sections[0]
    const firstChapter = firstSection?.chapters[0]
    if (firstSection && firstChapter) {
      router.push(`/learn/${prim}/${firstSection.id}/${firstChapter.id}`)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto flex min-h-svh max-w-xl flex-col justify-center px-4 py-10">
        <StudyBenchWordmark href="/" className="mb-6" />
        <div className="mb-4 rounded-full bg-muted/60 p-1">
          <div className="grid grid-cols-3 gap-1">
            {["Basics", "Targets", "Start"].map((label, index) => (
              <div
                key={label}
                className={cn(
                  "rounded-full px-3 py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.12em]",
                  index <= step ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <Stepper step={step} />

        {step === 0 ? <PlacementOutcomePanel /> : null}

        {step === 0 && (
          <Card className="mt-5 overflow-hidden rounded-2xl border-border/80 shadow-[0_22px_55px_-38px_oklch(0.25_0.08_260_/_35%)]">
            <CardContent className="space-y-4 pt-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  Step 1 of 3
                </p>
                <h1 className="font-heading text-2xl font-bold">Set up your prep in under a minute</h1>
                <p className="text-sm text-muted-foreground">
                  We only need the basics to personalize your route. College and branch can wait.
                </p>
              </div>
              <Field label="Full name">
                <Input
                  value={profile.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                />
              </Field>
              <Field label="College">
                <Input
                  value={profile.college}
                  onChange={(e) => set("college", e.target.value)}
                  placeholder="Optional"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Branch">
                  <Input
                    value={profile.branch}
                    onChange={(e) => set("branch", e.target.value)}
                    placeholder="Optional"
                  />
                </Field>
                <Field label="Graduation year">
                  <Select value={profile.gradYear} onValueChange={(v) => set("gradYear", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRAD_YEARS.map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="CGPA (optional)">
                <Input
                  value={profile.cgpa}
                  onChange={(e) => set("cgpa", e.target.value)}
                  placeholder="e.g. 8.2"
                  inputMode="decimal"
                />
              </Field>
              {/* Removed informational note per request */}
              <div className="flex justify-end pt-2">
                <Button disabled={!canNextProfile} onClick={() => setStep(1)}>
                  Continue <Icon name="ChevronRight" className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card className="mt-5 overflow-hidden rounded-2xl border-border/80 shadow-[0_22px_55px_-38px_oklch(0.25_0.08_260_/_35%)]">
            <CardContent className="space-y-4 pt-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  Step 2 of 3
                </p>
                <h1 className="font-heading text-2xl font-bold">
                  Which companies are you preparing for?
                </h1>
                <p className="text-sm text-muted-foreground">
                  Pick every company you care about. Your first choice becomes your main dashboard focus.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SELECTABLE_COMPANIES.map((c) => {
                  const on = interested.includes(c.id)
                  const primarySelected = primary === c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggle(c.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all",
                        on
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/40 hover:bg-muted/50",
                      )}
                    >
                      <CompanyAvatar id={c.id} size={44} />
                      <span className="text-sm font-semibold">
                        {c.id === "general" ? "Core Prep" : c.short}
                      </span>
                      {on ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="flex items-center gap-1 text-xs text-primary">
                            <Icon name="Check" className="size-3" /> Selected
                          </span>
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            primarySelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}>
                            {primarySelected ? "Main target" : "Can become main"}
                          </span>
                        </div>
                      ) : c.id === "general" ? (
                        <span className="text-xs leading-relaxed text-muted-foreground">
                          Build all core skills before choosing a company path.
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{c.sector}</span>
                      )}
                    </button>
                  )
                })}
              </div>
              {interested.length > 0 ? (
                <div className="rounded-xl border border-border bg-muted/35 p-4">
                  <p className="text-sm font-semibold">Main dashboard target</p>
                  <div className="mt-3 grid gap-2">
                    {interested.map((id) => {
                      const company = SELECTABLE_COMPANIES.find((item) => item.id === id)!
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setPrimary(id)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors",
                            primary === id
                              ? "border-primary bg-primary/8"
                              : "border-border bg-background hover:bg-muted/50",
                          )}
                        >
                          <CompanyAvatar id={id} size={28} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{company.name}</p>
                            <p className="text-xs text-muted-foreground">
                              This becomes your first learning route after signup.
                            </p>
                          </div>
                          {primary === id ? (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                              Main
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}
              <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-sm text-muted-foreground">
                Free gives you a starter path in every track. Premium opens the deeper chapters,
                full PYQ banks, company mocks and coding depth when you are ready.
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button disabled={!canNextCompanies} onClick={() => setStep(2)}>
                  Continue <Icon name="ChevronRight" className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="mt-5 overflow-hidden rounded-2xl border-border/80 shadow-[0_22px_55px_-38px_oklch(0.25_0.08_260_/_35%)]">
            <CardContent className="space-y-5 pt-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  Step 3 of 3
                </p>
                <h1 className="font-heading text-2xl font-bold">Here is your fastest route to first value</h1>
                <p className="text-sm text-muted-foreground">
                  Start with one chapter, one challenge and one mock. That is enough to make the app useful on day one.
                </p>
              </div>

              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <p className="text-sm font-semibold">Your main target</p>
                <div className="mt-3 flex items-center gap-3">
                  <CompanyAvatar id={(primary || interested[0] || "general") as CompanyId} size={40} />
                  <div>
                    <p className="font-semibold">
                      {getCompany((primary || interested[0] || "general") as CompanyId).name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      We will drop you straight into the first chapter after this.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  {
                    icon: "BookOpenCheck",
                    title: "Start your first learning chapter",
                    detail: "Open your primary company track and finish the first short chapter quiz.",
                  },
                  {
                    icon: "CalendarCheck",
                    title: "Complete today's daily challenge",
                    detail: "Answer five quick questions to start your streak and reveal weak areas.",
                  },
                  {
                    icon: "Code2",
                    title: "Try one coding problem",
                    detail: "Attempt one beginner problem from the coding ladder, even if you use hints.",
                  },
                  {
                    icon: "Trophy",
                    title: "Take a diagnostic mock",
                    detail: "Use your first mock score as a baseline, then improve from there.",
                  },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className="flex gap-3 rounded-2xl border border-border bg-muted/35 p-3"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon name={item.icon} className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Step {index + 1}
                      </p>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="font-heading font-semibold">Your dashboard will guide you</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  After this, your dashboard will keep your next three tasks visible so you always know what to do next.
                </p>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <div className="flex flex-col items-end gap-2">
                  {saveError ? (
                    <p className="max-w-xs text-right text-sm text-destructive">{saveError}</p>
                  ) : null}
                  <Button onClick={finish} disabled={submitting}>
                    {submitting ? "Saving..." : "Start preparing"}{" "}
                    {!submitting ? <Icon name="ArrowRight" className="size-4" /> : null}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function Stepper({ step }: { step: number }) {
  const labels = ["Basics", "Targets", "Start"]
  return (
    <div className="flex items-center gap-2">
      {labels.map((l, i) => (
        <React.Fragment key={l}>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "grid size-7 place-items-center rounded-full text-xs font-semibold",
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                i <= step ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {l}
            </span>
          </div>
          {i < labels.length - 1 ? <div className="h-px flex-1 bg-border" /> : null}
        </React.Fragment>
      ))}
    </div>
  )
}

function PlacementOutcomePanel() {
  const rows = [
    { label: "Target company plan", value: "Personalized" },
    { label: "Daily practice", value: "Aptitude + coding" },
    { label: "Interview prep", value: "Recruiter-style" },
  ]

  return (
    <div className="mt-5 rounded-2xl border border-primary/15 bg-background/80 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon name="BookOpen" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-base font-semibold">Build a placement route that fits you</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            StudyBench turns your selected companies into chapters, practice sets, mock tests and interview preparation.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl bg-muted/60 px-3 py-2">
            <p className="text-[11px] font-medium uppercase text-muted-foreground">{row.label}</p>
            <p className="mt-1 text-sm font-semibold">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  )
}

// ArrowRight isn't in the icon registry by default name lookup fallback handles it,
// but we map it here for crispness.

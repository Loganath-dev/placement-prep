"use client"

import Link from "next/link"
import { DriveOutcomes } from "@/components/app/drive-outcomes"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { PriRing } from "@/components/app/pri-ring"
import {
  CompanyAvatar,
  ProbabilityInputs,
  ProbabilityStat,
  ToneBadge,
} from "@/components/app/ui-bits"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCompany } from "@/lib/data/companies"
import { getSections } from "@/lib/data/content"
import {
  computePRI,
  EMPTY_PROGRESS,
  overallReadiness,
  priBand,
  readinessBand,
  sectionMastery,
} from "@/lib/scoring"
import { useStore } from "@/lib/store"
import type { CompanyId } from "@/lib/types"

export default function ReadinessPage() {
  const { state } = useStore()
  const overall = overallReadiness(state)
  const companies = state.interested.length ? state.interested : ([state.primary] as CompanyId[])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Placement signal"
        title="Readiness"
        description="An honest score for your preparation with deeper company-wise analysis."
      />

      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-5 p-6 sm:flex-row">
          <PriRing value={overall} label="Overall" tone={priBand(overall).tone} size={128} />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-heading text-xl font-semibold">Overall Readiness</h2>
            <p className="mt-1 text-muted-foreground">
              Aggregated across {companies.length}{" "}
              {companies.length === 1 ? "company" : "companies"} you&apos;re preparing for.
              {state.primary ? (
                <>
                  {" "}
                  <span className="font-medium text-foreground">
                    {getCompany(state.primary).short}
                  </span>{" "}
                  is your dashboard focus.
                </>
              ) : null}
            </p>
            <div className="mt-2">
              <ToneBadge band={priBand(overall)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <DriveOutcomes />

      {!state.premium ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <Icon name="Lock" className="size-7 text-primary" />
            <p className="font-medium">Unlock detailed readiness analysis</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Upgrade for company comparison,
              placement estimates and section-wise next steps.
            </p>
            <Button asChild className="mt-1">
              <Link href="/settings">Go Premium</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base">Compare tracks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0.5">
              <div className="hidden grid-cols-[1.4fr_1fr_auto] gap-3 px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
                <span>Company</span>
                <span>Readiness</span>
                <span className="text-right">Readiness est.</span>
              </div>
              {companies.map((id) => {
                const pri = computePRI(id, state.progress[id] ?? EMPTY_PROGRESS)
                const progress = state.progress[id] ?? EMPTY_PROGRESS
                return (
                  <Link
                    key={id}
                    href={`/learn/${id}`}
                    className="grid grid-cols-[1.4fr_1fr_auto] items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <CompanyAvatar id={id} size={28} />
                      <span className="truncate font-medium">{getCompany(id).short}</span>
                      {id === state.primary ? (
                        <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary md:inline">
                          Primary
                        </span>
                      ) : null}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{ width: `${pri}%` }}
                        />
                      </span>
                      <span className="w-8 text-right text-sm font-semibold tabular-nums">
                        {pri}
                      </span>
                    </span>
                    <span className="text-right text-sm tabular-nums text-muted-foreground">
                      <span
                        title={`PRI ${pri}/100 (${progress.mockScores.length} saved mock(s))`}
                      >
                        {readinessBand(pri).label}
                      </span>
                    </span>
                  </Link>
                )
              })}
            </CardContent>
          </Card>

          <h2 className="font-heading text-lg font-semibold">Per-company detail</h2>
          <div className="space-y-4">
            {companies.map((id, i) => {
              const progress = state.progress[id] ?? EMPTY_PROGRESS
              const pri = computePRI(id, progress)
              const sections = getSections(id)
              const weakest = [...sections]
                .map((s) => ({ s, m: sectionMastery(id, s.id, progress) }))
                .sort((a, b) => a.m - b.m)
                .slice(0, 2)
              return (
                <Card
                  key={id}
                  className="animate-rise"
                  style={{ animationDelay: `${Math.min(i * 60, 360)}ms` }}
                >
                  <CardHeader className="flex-row items-center gap-3 space-y-0">
                    <CompanyAvatar id={id} size={40} />
                    <div className="flex-1">
                      <CardTitle className="font-heading text-base">
                        {getCompany(id).name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{getCompany(id).sector}</p>
                    </div>
                    {id === state.primary ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Primary
                      </span>
                    ) : null}
                  </CardHeader>
                  <CardContent className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
                    <div className="flex items-center gap-5">
                      <PriRing value={pri} tone={priBand(pri).tone} size={96} stroke={9} />
                      <div className="space-y-1">
                        <ProbabilityStat pri={pri} compact />
                        <ToneBadge band={priBand(pri)} />
                      </div>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-4">
                      <p className="flex items-center gap-1.5 text-sm font-semibold">
                        <Icon name="Target" className="size-4 text-primary" /> What to do next
                      </p>
                      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                        {weakest.map(({ s, m }) => (
                          <li key={s.id} className="flex items-center justify-between gap-2">
                            <span>
                              {m === 0 ? "Start" : "Strengthen"}{" "}
                              <span className="font-medium text-foreground">{s.name}</span> ({m}%)
                            </span>
                            <Button asChild variant="ghost" size="sm" className="h-7">
                              <Link href={`/learn/${id}/${s.id}`}>
                                Go <Icon name="ArrowRight" className="size-3.5" />
                              </Link>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="sm:col-span-2">
                      <ProbabilityInputs companyId={id} progress={progress} />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}



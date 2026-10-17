"use client"

import * as React from "react"
import { EmptyState } from "@/components/app/empty-state"
import { Icon } from "@/components/app/icon"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { COMPANIES, getCompany } from "@/lib/data/companies"
import { computePRI, EMPTY_PROGRESS, outcomeCalibration } from "@/lib/scoring"
import { useStore } from "@/lib/store"
import type { CompanyId, DriveResult, DriveStage } from "@/lib/types"

const RESULTS: { value: DriveResult; label: string }[] = [
  { value: "selected", label: "Selected (got an offer)" },
  { value: "rejected", label: "Rejected" },
  { value: "in-progress", label: "Still in progress" },
  { value: "withdrawn", label: "Withdrew" },
]

const STAGES: { value: DriveStage; label: string }[] = [
  { value: "online-test", label: "Online test" },
  { value: "group-discussion", label: "Group discussion" },
  { value: "technical", label: "Technical interview" },
  { value: "hr", label: "HR interview" },
  { value: "offer", label: "Offer" },
]

const RESULT_TONE: Record<DriveResult, string> = {
  selected: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  "in-progress": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  withdrawn: "bg-muted text-muted-foreground",
}

function labelFor<T extends string>(list: { value: T; label: string }[], v: T): string {
  return list.find((x) => x.value === v)?.label ?? v
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

export function DriveOutcomes() {
  const { state, recordOutcome, removeOutcome } = useStore()
  const outcomes = state.outcomes ?? []
  const cal = outcomeCalibration(outcomes)

  const trackedCompanies = (state.interested.length ? state.interested : [state.primary]).filter(
    (id) => id !== "general",
  )
  const companyChoices = trackedCompanies.length
    ? trackedCompanies
    : (COMPANIES.filter((c) => c.id !== "general").map((c) => c.id) as CompanyId[])

  const [open, setOpen] = React.useState(false)
  const [companyId, setCompanyId] = React.useState<CompanyId>(companyChoices[0])
  const [result, setResult] = React.useState<DriveResult>("selected")
  const [stage, setStage] = React.useState<DriveStage>("offer")
  const [date, setDate] = React.useState("")

  function submit() {
    const ts = date ? new Date(`${date}T00:00:00`).getTime() : Date.now()
    recordOutcome({
      companyId,
      result,
      stageReached: stage,
      // Snapshot the PRI as it stands now — this is the honest "what the app
      // said" number we compare the real outcome against.
      priAtDrive: computePRI(companyId, state.progress[companyId] ?? EMPTY_PROGRESS),
      ts: Number.isNaN(ts) ? Date.now() : ts,
    })
    setOpen(false)
    setResult("selected")
    setStage("offer")
    setDate("")
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="font-heading text-base">Real drive outcomes</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Log what actually happened in your placement drives to see whether your in-app
            Readiness tracked reality.
          </p>
        </div>
        <Button size="sm" variant={open ? "ghost" : "default"} onClick={() => setOpen((o) => !o)}>
          {open ? "Cancel" : <><Icon name="Flag" className="size-4" /> Log drive</>}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {open ? (
          <div className="grid gap-3 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Select value={companyId} onValueChange={(v) => setCompanyId(v as CompanyId)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {companyChoices.map((id) => (
                    <SelectItem key={id} value={id}>
                      {getCompany(id).name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Result</Label>
              <Select value={result} onValueChange={(v) => setResult(v as DriveResult)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESULTS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Furthest round reached</Label>
              <Select value={stage} onValueChange={(v) => setStage(v as DriveStage)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="drive-date">Drive date (optional)</Label>
              <Input
                id="drive-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Button onClick={submit} className="w-full sm:w-auto">
                Save outcome
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Your current Readiness for {getCompany(companyId).short} (
                {computePRI(companyId, state.progress[companyId] ?? EMPTY_PROGRESS)}/100) is saved
                with this outcome so the comparison stays honest.
              </p>
            </div>
          </div>
        ) : null}

        {cal.decided >= 1 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Drives logged" value={String(cal.total)} />
            <Stat label="Selected" value={String(cal.selected)} />
            <Stat
              label="Avg PRI · selected"
              value={cal.avgPriSelected !== null ? String(cal.avgPriSelected) : "—"}
            />
            <Stat
              label="Avg PRI · rejected"
              value={cal.avgPriRejected !== null ? String(cal.avgPriRejected) : "—"}
            />
          </div>
        ) : null}

        {cal.separation !== null ? (
          <p className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
            {cal.separation > 0 ? (
              <>
                <Icon name="TrendingUp" className="mr-1 inline size-4 text-emerald-500" />
                For you, a higher in-app Readiness lined up with better real outcomes — your
                selected drives averaged{" "}
                <span className="font-semibold text-foreground">{cal.separation} PRI points</span>{" "}
                higher than your rejected ones.
              </>
            ) : (
              <>
                <Icon name="Info" className="mr-1 inline size-4" />
                Your Readiness score hasn&apos;t separated selected from rejected drives yet. It is a
                study signal, not a hiring prediction — keep logging real results to see the trend.
              </>
            )}
          </p>
        ) : null}

        {outcomes.length === 0 ? (
          <EmptyState
            icon="Flag"
            title="No drives logged yet"
            description="Add your first real outcome to start the honest feedback loop between your Readiness and real results."
          />
        ) : (
          <ul className="space-y-2">
            {outcomes.map((o) => (
              <li
                key={o.id}
                className="flex items-center gap-3 rounded-xl border p-3 text-sm"
              >
                <span className="flex-1 min-w-0">
                  <span className="font-medium">{getCompany(o.companyId).short}</span>{" "}
                  <span className="text-muted-foreground">
                    · {labelFor(STAGES, o.stageReached)} · {formatDate(o.ts)}
                  </span>
                </span>
                <span className="text-xs tabular-nums text-muted-foreground" title="Your in-app Readiness when this drive was logged">
                  PRI {o.priAtDrive}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${RESULT_TONE[o.result]}`}>
                  {labelFor(RESULTS, o.result).replace(/\s*\(.*\)$/, "")}
                </span>
                <button
                  type="button"
                  onClick={() => removeOutcome(o.id)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Remove outcome"
                >
                  <Icon name="Trash2" className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-3 text-center">
      <p className="font-heading text-xl font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{label}</p>
    </div>
  )
}

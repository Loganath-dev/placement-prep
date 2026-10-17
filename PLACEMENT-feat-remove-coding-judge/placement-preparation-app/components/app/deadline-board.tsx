"use client"

import Link from "next/link"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { getCompany } from "@/lib/data/companies"
import { getSections } from "@/lib/data/content"
import {
  buildPlacementDeadlines,
  daysUntil,
  type NextLearningTarget,
  type PlacementDeadline,
  type PlacementDeadlineType,
} from "@/lib/data/deadlines"
import { EMPTY_PROGRESS } from "@/lib/scoring"
import { useStoreState } from "@/lib/store"
import type { CompanyId } from "@/lib/types"
import { cn } from "@/lib/utils"

const TYPE_ICON: Record<PlacementDeadlineType, string> = {
  drive: "CalendarDays",
  mock: "Target",
  interview: "Mic",
  learning: "GraduationCap",
}

const TYPE_LABEL: Record<PlacementDeadlineType, string> = {
  drive: "Drive",
  mock: "Mock",
  interview: "Interview",
  learning: "Learning",
}

function nextLearningTarget(companyId: CompanyId): NextLearningTarget | null {
  const sections = getSections(companyId)
  for (const section of sections) {
    for (const chapter of section.chapters) {
      return {
        sectionId: section.id,
        sectionShort: section.short,
        chapterTitle: chapter.title,
        href: `/learn/${companyId}/${section.id}/${chapter.id}`,
      }
    }
  }
  return null
}

function nextIncompleteLearningTarget(
  companyId: CompanyId,
  progress = EMPTY_PROGRESS,
): NextLearningTarget | null {
  const sections = getSections(companyId)
  for (const section of sections) {
    for (const chapter of section.chapters) {
      if (!progress.chapters[chapter.id]?.passed) {
        return {
          sectionId: section.id,
          sectionShort: section.short,
          chapterTitle: chapter.title,
          href: `/learn/${companyId}/${section.id}/${chapter.id}`,
        }
      }
    }
  }
  return nextLearningTarget(companyId)
}

function useDeadlines() {
  const { state } = useStoreState()
  const progress = state.progress[state.primary] ?? EMPTY_PROGRESS
  return React.useMemo(
    () =>
      buildPlacementDeadlines({
        primary: state.primary,
        interested: state.interested.length ? state.interested : [state.primary],
        nextLearning: nextIncompleteLearningTarget(state.primary, progress),
        hasMockScore: progress.mockScores.length > 0,
      }),
    [progress, state.interested, state.primary],
  )
}

export function DeadlineBoard({ variant = "compact" }: { variant?: "compact" | "calendar" }) {
  const deadlines = useDeadlines()
  const { state } = useStoreState()
  const primary = getCompany(state.primary)

  if (variant === "calendar") {
    return <DeadlineCalendar deadlines={deadlines} primaryName={primary.short} />
  }

  return (
    <Card className="border-warning/25 bg-warning/[0.04]">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 font-heading text-base">
            <Icon name="Bell" className="size-4 text-primary" /> Deadlines & urgency
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Study targets tied to your selected track.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/plan">
            Calendar <Icon name="ArrowRight" className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-4">
        {deadlines.slice(0, 4).map((event) => (
          <DeadlineCard key={event.id} event={event} />
        ))}
      </CardContent>
    </Card>
  )
}

function DeadlineCalendar({
  deadlines,
  primaryName,
}: {
  deadlines: PlacementDeadline[]
  primaryName: string
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 font-heading text-base">
            <Icon name="CalendarDays" className="size-4 text-primary" /> Drive calendar
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Planned deadlines for {primaryName}, mocks, interviews and learning checkpoints.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/mock">
            Open mocks <Icon name="ArrowRight" className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          {deadlines.slice(0, 4).map((event) => (
            <DeadlineCard key={event.id} event={event} />
          ))}
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          {deadlines.map((event) => (
            <Link
              key={event.id}
              href={event.href}
              className="grid gap-3 border-b border-border p-3 transition-colors last:border-b-0 hover:bg-muted/45 sm:grid-cols-[9rem_1fr_auto]"
            >
              <div>
                <p className="text-sm font-semibold">{formatDate(event.date)}</p>
                <p className="text-xs text-muted-foreground">{relativeLabel(event.date)}</p>
              </div>
              <div className="min-w-0">
                <p className="font-medium">{event.title}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{event.detail}</p>
              </div>
              <span
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold",
                  event.priority === "today"
                    ? "bg-destructive/10 text-destructive"
                    : event.priority === "soon"
                      ? "bg-warning/15 text-warning-foreground"
                      : "bg-primary/10 text-primary",
                )}
              >
                <Icon name={TYPE_ICON[event.type]} className="size-3.5" />
                {TYPE_LABEL[event.type]}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function DeadlineCard({ event }: { event: PlacementDeadline }) {
  return (
    <Link
      href={event.href}
      className={cn(
        "rounded-xl border p-3 transition-all hover:border-primary/40 hover:bg-muted/45",
        event.priority === "today"
          ? "border-destructive/25 bg-destructive/10"
          : event.priority === "soon"
            ? "border-warning/30 bg-warning/10"
            : "border-border bg-background",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-background/70 text-primary ring-1 ring-border">
          <Icon name={TYPE_ICON[event.type]} className="size-4" />
        </span>
        <span className="text-xs font-semibold text-muted-foreground">{relativeLabel(event.date)}</span>
      </div>
      <p className="mt-3 line-clamp-2 font-medium">{event.title}</p>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{event.detail}</p>
    </Link>
  )
}

function relativeLabel(dateKey: string) {
  const days = daysUntil(dateKey)
  if (days <= 0) return "Today"
  if (days === 1) return "Tomorrow"
  return `${days} days`
}

function formatDate(dateKey: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(dateKey + "T00:00:00"))
}

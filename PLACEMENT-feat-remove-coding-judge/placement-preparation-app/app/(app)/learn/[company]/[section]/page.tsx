"use client"

import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { COMPANY_BY_ID, getCompany } from "@/lib/data/companies"
import { getSection, getSections } from "@/lib/data/content"
import {
  canAccessLearningChapter,
  canAccessLearningSection,
} from "@/lib/access"
import { EMPTY_PROGRESS } from "@/lib/scoring"
import { useStore } from "@/lib/store"
import type { CompanyId, SectionId } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function SectionPage() {
  const params = useParams<{ company: string; section: string }>()
  const { state } = useStore()
  const companyId = params.company as CompanyId
  const sectionId = params.section as SectionId
  if (!COMPANY_BY_ID[companyId]) notFound()
  const section = getSection(companyId, sectionId)
  if (!section) notFound()
  const sectionIndex = getSections(companyId).findIndex((item) => item.id === sectionId)

  const company = getCompany(companyId)
  const progress = state.progress[companyId] ?? EMPTY_PROGRESS
  const sectionPaywalled = !canAccessLearningSection(sectionIndex, state.premium)

  if (sectionPaywalled) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <Link
          href={`/learn/${companyId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <Icon name="ChevronRight" className="size-4 rotate-180" /> {company.short} track
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <span className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Icon name="Lock" className="size-8" />
            </span>
            <div>
              <h1 className="font-heading text-2xl font-bold">{section.name}</h1>
              <p className="mx-auto mt-1 max-w-md text-muted-foreground">
                Free users can open the first section and first chapter in each track.
                Upgrade to continue into this section.
              </p>
            </div>
            <Link href="/settings" className="text-sm font-medium text-primary hover:underline">
              Go Premium
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/learn/${companyId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <Icon name="ChevronRight" className="size-4 rotate-180" /> {company.short} track
      </Link>

      <div className="flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon name={section.icon} className="size-7" />
        </span>
        <div>
          <h1 className="font-heading text-2xl font-bold">{section.name}</h1>
          <p className="text-muted-foreground">{section.blurb}</p>
        </div>
      </div>

      <div className="space-y-3">
        {section.chapters.map((ch, i) => {
          const cp = progress.chapters[ch.id]
          const prev = i === 0 ? null : section.chapters[i - 1]
          const prevDone = prev ? !!progress.chapters[prev.id]?.passed : true
          const paywalled = !canAccessLearningChapter(sectionIndex, i, state.premium)
          const gateLocked = !prevDone
          const clickable = !gateLocked && !paywalled
          const href = `/learn/${companyId}/${sectionId}/${ch.id}`

          const inner = (
            <Card
              className={cn(
                "transition-all",
                clickable ? "hover:border-primary/40" : "opacity-75",
              )}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold",
                    cp?.passed
                      ? "bg-success/15 text-[color:var(--success)]"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {cp?.passed ? <Icon name="Check" className="size-5" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{ch.title}</p>
                    {cp?.passed ? (
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-[color:var(--success)]">
                        {cp.bestScore}%
                      </span>
                    ) : cp && cp.bestScore > 0 ? (
                      <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning-foreground">
                        Best {cp.bestScore}%
                      </span>
                    ) : null}
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{ch.summary}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {paywalled
                      ? "Premium chapter"
                      : gateLocked
                        ? "Complete previous chapter first"
                        : "Structured lesson practice"}
                  </p>
                </div>
                {gateLocked ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Icon name="Lock" className="size-3.5" /> Pass {i} first
                  </span>
                ) : paywalled ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-primary">
                    <Icon name="Lock" className="size-3.5" /> Premium
                  </span>
                ) : (
                  <Icon name="ChevronRight" className="size-5 text-muted-foreground" />
                )}
              </CardContent>
            </Card>
          )

          return clickable ? (
            <Link key={ch.id} href={href}>
              {inner}
            </Link>
          ) : (
            <div key={ch.id} aria-disabled className="cursor-not-allowed">
              {inner}
            </div>
          )
        })}
      </div>

      <p className="rounded-xl bg-muted/50 p-3 text-center text-sm text-muted-foreground">
        Free users can open Section 1, Chapter 1 in every track.
        {!state.premium ? (
          <>
            {" "}
            Chapter 2 and deeper sections require Premium.{" "}
            <Link href="/settings" className="text-primary hover:underline">
              Go Premium
            </Link>{" "}
            to unlock the full track.
          </>
        ) : (
          <> Premium is active, so every chapter in this section is unlocked.</>
        )}
      </p>
    </div>
  )
}



"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { SECTION_META } from "@/lib/data/content"
import { REVISION_SHEETS } from "@/lib/data/prep-guides"
import type { SectionId } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function RevisionPage() {
  const [section, setSection] = React.useState<SectionId | "all">("all")
  const sheets =
    section === "all" ? REVISION_SHEETS : REVISION_SHEETS.filter((sheet) => sheet.section === section)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Last-mile recall"
        title="Revision Sheets"
        description="Clean topic-wise formula sheets and common traps for fast review before mocks and company drives."
      />

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        <FilterPill active={section === "all"} label="All" icon="Layers" onClick={() => setSection("all")} />
        {SECTION_META.map((meta) => (
          <FilterPill
            key={meta.id}
            active={section === meta.id}
            label={meta.short}
            icon={meta.icon}
            onClick={() => setSection(meta.id)}
          />
        ))}
      </div>

      <div className="grid gap-5">
        {sheets.map((sheet) => {
          const meta = SECTION_META.find((item) => item.id === sheet.section)
          return (
            <Card key={sheet.id} className="overflow-hidden">
              <CardHeader className="border-b border-border/70 bg-[linear-gradient(135deg,var(--card),var(--accent))]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 font-heading text-xl">
                      <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Icon name={meta?.icon ?? "BookOpen"} className="size-5" />
                      </span>
                      {sheet.title}
                    </CardTitle>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      {sheet.goal}
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-md bg-background/80">
                    {meta?.short}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.75fr)] lg:p-5">
                <RevisionBlock title="Formula sheet" icon="Sigma" items={sheet.formulas} featured />
                <RevisionBlock title="Common traps" icon="Flag" items={sheet.traps} />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function FilterPill({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean
  label: string
  icon: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background/70 hover:bg-muted/60",
      )}
    >
      <Icon name={icon} className="size-4" />
      {label}
    </button>
  )
}

function RevisionBlock({
  title,
  icon,
  items,
  featured = false,
}: {
  title: string
  icon: string
  items: string[]
  featured?: boolean
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-background p-4",
        featured && "border-primary/20 bg-primary/[0.025]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-heading text-base font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon name={icon} className="size-4" />
          </span>
          {title}
        </p>
        <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
          {items.length} points
        </span>
      </div>

      {featured ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <FormulaCard key={item} item={item} index={index} />
          ))}
        </div>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {items.map((item, index) => (
            <li
              key={item}
              className="flex gap-3 rounded-lg bg-muted/45 px-3 py-2.5 text-sm leading-relaxed text-muted-foreground"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-background text-[11px] font-semibold text-primary ring-1 ring-border">
                {index + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function FormulaCard({ item, index }: { item: string; index: number }) {
  const parts = item.split(/\s=\s/)
  const hasFormula = parts.length > 1
  return (
    <div className="min-h-28 rounded-lg border border-border bg-card p-3 shadow-[0_8px_24px_-22px_oklch(0.25_0.08_260_/_35%)]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
          F{index + 1}
        </span>
        {hasFormula ? (
          <span className="text-[11px] font-medium text-muted-foreground">formula</span>
        ) : null}
      </div>
      {hasFormula ? (
        <div className="space-y-2">
          <p className="text-sm font-medium leading-snug text-foreground">{parts[0]}</p>
          <p className="rounded-md bg-muted px-2 py-2 font-mono text-[13px] leading-relaxed text-foreground">
            {parts.slice(1).join(" = ")}
          </p>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-foreground/85">{item}</p>
      )}
    </div>
  )
}

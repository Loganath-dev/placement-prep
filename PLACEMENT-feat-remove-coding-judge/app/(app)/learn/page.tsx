"use client"

import Link from "next/link"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { CompanyAvatar, ToneBadge } from "@/components/app/ui-bits"
import { Card, CardContent } from "@/components/ui/card"
import { getCompany, SELECTABLE_COMPANIES } from "@/lib/data/companies"
import { getSections, totalChapters } from "@/lib/data/content"
import { computePRI, EMPTY_PROGRESS, priBand } from "@/lib/scoring"
import { useStore } from "@/lib/store"
import type { CompanyId } from "@/lib/types"

// Core first, then every company track — derived so new companies show up automatically.
const ORDER: CompanyId[] = SELECTABLE_COMPANIES.map((c) => c.id)

export default function LearnPage() {
  const { state } = useStore()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learning paths"
        title="Learn"
        description="Choose a learning path and build progress section by section."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ORDER.map((id) => {
          const c = getCompany(id)
          const progress = state.progress[id] ?? EMPTY_PROGRESS
          const pri = computePRI(id, progress)
          const passed = Object.values(progress.chapters).filter((x) => x.passed).length
          const total = totalChapters(id)

          return (
            <Link key={id} href={`/learn/${id}`} className="group">
              <Card className="h-full transition-all group-hover:border-primary/40">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between">
                    <CompanyAvatar id={id} size={48} />
                    {id === state.primary ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Primary
                      </span>
                    ) : c.isGeneral ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Core
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <p className="font-heading text-lg font-semibold">{c.name}</p>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{c.blurb}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <ToneBadge band={priBand(pri)} />
                    <span className="text-sm text-muted-foreground">
                      PRI <span className="font-semibold text-foreground">{pri}</span>
                    </span>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>
                        {passed}/{total} chapters
                      </span>
                      <span>{getSections(id).length} sections</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${total ? (passed / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-primary">
                    Open track <Icon name="ArrowRight" className="size-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}



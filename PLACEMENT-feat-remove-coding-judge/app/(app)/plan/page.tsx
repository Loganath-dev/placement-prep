"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { DeadlineBoard } from "@/components/app/deadline-board"
import { WEEKLY_PLANS } from "@/lib/data/prep-guides"

const LEVEL_LABEL = {
  foundation: "Foundation",
  "drive-ready": "Drive ready",
  "product-track": "Product track",
} as const

export default function PlanPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Weekly strategy"
        title="Placement Plan"
        description="Follow a structured weekly routine for aptitude, coding, CS core, mocks and interview readiness."
        actions={
          <Button asChild variant="outline">
            <Link href="/revision">
              Revision sheets <Icon name="ArrowRight" className="size-4" />
            </Link>
          </Button>
        }
      />

      <DeadlineBoard variant="calendar" />

      <div className="grid gap-4">
        {WEEKLY_PLANS.map((plan) => (
          <Card key={plan.id}>
            <CardHeader className="border-b border-border/70">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="font-heading text-lg">{plan.title}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.summary}</p>
                </div>
                <Badge variant="outline" className="rounded-md font-semibold">
                  {LEVEL_LABEL[plan.level]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {plan.days.map((day) => (
                  <article
                    key={`${plan.id}-${day.day}`}
                    className="rounded-lg border border-border bg-background/60 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase text-primary">{day.day}</p>
                      <Icon name="CalendarCheck" className="size-4 text-muted-foreground" />
                    </div>
                    <h2 className="mt-2 font-heading font-semibold">{day.focus}</h2>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {day.tasks.map((task) => (
                        <li key={task} className="flex gap-2">
                          <Icon name="Check" className="mt-0.5 size-4 shrink-0 text-[color:var(--success)]" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 rounded-md bg-muted/60 p-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Checkpoint:</span>{" "}
                      {day.checkpoint}
                    </p>
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

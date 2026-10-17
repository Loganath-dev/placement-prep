"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { useStore } from "@/lib/store"

const SPRINT_DAYS = [
  {
    day: "Day 1",
    focus: "Diagnostic pressure",
    tasks: ["Take one mini mock", "Write down weakest 3 topics", "Review every wrong answer"],
    href: "/mock",
  },
  {
    day: "Day 2",
    focus: "Aptitude repair",
    tasks: ["Revise formulas", "Solve 30 quant/reasoning questions", "Redo mistake notebook"],
    href: "/revision",
  },
  {
    day: "Day 3",
    focus: "Coding basics",
    tasks: ["Solve 2 array/string problems", "Run samples until clean", "Write edge cases before code"],
    href: "/coding",
  },
  {
    day: "Day 4",
    focus: "CS core",
    tasks: ["Revise DBMS/OS/OOP", "Answer technical MCQs", "Explain one project module aloud"],
    href: "/learn",
  },
  {
    day: "Day 5",
    focus: "Full-length mock",
    tasks: ["Attempt one full mock", "Mark careless mistakes", "List time-loss sections"],
    href: "/mock",
  },
  {
    day: "Day 6",
    focus: "Interview practice",
    tasks: ["Practise self-intro", "Answer 10 HR/technical questions", "Prepare project explanation"],
    href: "/interview",
  },
  {
    day: "Day 7",
    focus: "Final revision",
    tasks: ["Revise only weak sheets", "Do a light challenge", "Sleep with a short next-day checklist"],
    href: "/revision",
  },
]

export default function SprintPage() {
  const { state } = useStore()
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Placement sprint"
        title="7-Day Placement Sprint"
        description="A focused week for students who need structure, pressure and revision without jumping between random resources."
        actions={
          <Button asChild>
            <Link href="/mock">
              Start with mock <Icon name="ArrowRight" className="size-4" />
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
          <SprintMetric label="Target company" value={state.primary.toUpperCase()} />
          <SprintMetric label="Daily time" value="90-150 min" />
          <SprintMetric label="Rule" value="Review mistakes" />
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {SPRINT_DAYS.map((item, index) => (
          <Card key={item.day}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="font-heading text-base">
                  {item.day}: {item.focus}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Finish this before moving to day {index + 2}.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={item.href}>
                  Open <Icon name="ArrowRight" className="size-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-3">
                {item.tasks.map((task) => (
                  <div key={task} className="rounded-lg border border-border bg-muted/35 p-3 text-sm">
                    {task}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function SprintMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-lg font-semibold">{value}</p>
    </div>
  )
}

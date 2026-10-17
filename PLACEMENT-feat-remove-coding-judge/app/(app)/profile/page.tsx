"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { PriRing } from "@/components/app/pri-ring"
import { BADGES, earnedBadges } from "@/lib/data/badges"
import { levelThreshold } from "@/lib/scoring"
import { useLevel, useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const { state } = useStore()
  const lvl = useLevel()
  const earned = new Set(earnedBadges(state).map((b) => b.id))

  let passed = 0
  let mocks = 0
  for (const p of Object.values(state.progress)) {
    passed += Object.values(p.chapters).filter((c) => c.passed).length
    mocks += p.mockScores.length
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student profile"
        title="Profile"
        description="Your progress, level and achievements."
      />

      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-5 p-6 sm:flex-row">
          <PriRing
            value={lvl.pct}
            label={`Lv ${lvl.level}`}
            sublabel={`${lvl.intoLevel}/${lvl.span} XP`}
            tone="info"
            size={132}
          />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="font-heading text-2xl font-bold">
              {state.profile.name || "Student"}
            </h2>
            <p className="text-muted-foreground">
              {[state.profile.branch, state.profile.college].filter(Boolean).join(" - ") ||
                "Add details in Settings"}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Pill icon="Target" label={`${state.xp} XP`} />
              <Pill icon="CalendarCheck" label={`${state.streak.count}-day streak`} />
              <Pill icon="GraduationCap" label={state.profile.gradYear || "-"} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {levelThreshold(lvl.level + 1) - state.xp} XP to Level {lvl.level + 1}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Level" value={lvl.level} icon="Star" />
        <Stat label="Total XP" value={state.xp} icon="Target" />
        <Stat label="Chapters passed" value={passed} icon="CircleCheckBig" />
        <Stat label="Mocks taken" value={mocks} icon="Trophy" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">
            Badges ({earned.size}/{BADGES.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {BADGES.map((b) => {
              const has = earned.has(b.id)
              return (
                <div
                  key={b.id}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all",
                    has
                      ? "border-primary/30 bg-primary/5"
                      : "border-border opacity-60 grayscale",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-12 place-items-center rounded-xl",
                      has ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon name={has ? b.icon : "Lock"} className="size-6" />
                  </span>
                  <p className="text-sm font-semibold">{b.label}</p>
                  <p className="text-xs text-muted-foreground">{b.description}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Pill({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-medium">
      <Icon name={icon} className="size-3.5 text-primary" /> {label}
    </span>
  )
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon name={icon} className="size-4" />
        </span>
        <p className="mt-2 font-heading text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}



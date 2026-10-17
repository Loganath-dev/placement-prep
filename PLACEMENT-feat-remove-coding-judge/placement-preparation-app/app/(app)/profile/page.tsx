"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { PageHeader } from "@/components/app/page-header"
import { PriRing } from "@/components/app/pri-ring"
import { BADGES, earnedBadges } from "@/lib/data/badges"
import { levelThreshold } from "@/lib/scoring"
import { useLevel, useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const BADGE_THEMES: Record<
  string,
  {
    bg: string
    border: string
    title: string
    desc: string
    glow: string
    iconBg: string
    iconColor: string
    iconGlow: string
  }
> = {
  "first-steps": {
    bg: "bg-gradient-to-br from-blue-500/10 via-sky-500/5 to-indigo-500/10 dark:from-blue-950/30 dark:via-sky-950/20 dark:to-indigo-950/30",
    border: "border-blue-200/50 dark:border-blue-800/40 hover:border-blue-400/60 dark:hover:border-blue-600/60",
    title: "text-blue-950 dark:text-blue-200",
    desc: "text-blue-700/80 dark:text-blue-400/70",
    glow: "shadow-[0_8px_30px_rgba(56,189,248,0.06)] hover:shadow-[0_8px_30px_rgba(56,189,248,0.18)]",
    iconBg: "bg-gradient-to-tr from-blue-500 to-sky-400 dark:from-blue-600 dark:to-sky-500",
    iconColor: "text-white",
    iconGlow: "shadow-[0_4px_12px_rgba(56,189,248,0.3)]",
  },
  "first-pass": {
    bg: "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-600/10 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30",
    border: "border-emerald-200/50 dark:border-emerald-800/40 hover:border-emerald-400/60 dark:hover:border-emerald-600/60",
    title: "text-emerald-950 dark:text-emerald-200",
    desc: "text-emerald-700/80 dark:text-emerald-400/70",
    glow: "shadow-[0_8px_30px_rgba(16,185,129,0.06)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.18)]",
    iconBg: "bg-gradient-to-tr from-emerald-500 to-teal-400 dark:from-emerald-600 dark:to-teal-500",
    iconColor: "text-white",
    iconGlow: "shadow-[0_4px_12px_rgba(16,185,129,0.3)]",
  },
  "streak-7": {
    bg: "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/30",
    border: "border-amber-200/50 dark:border-amber-800/40 hover:border-amber-400/60 dark:hover:border-amber-600/60",
    title: "text-amber-950 dark:text-amber-200",
    desc: "text-amber-700/80 dark:text-amber-400/70",
    glow: "shadow-[0_8px_30px_rgba(245,158,11,0.06)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.18)]",
    iconBg: "bg-gradient-to-tr from-amber-500 to-orange-400 dark:from-amber-600 dark:to-orange-500",
    iconColor: "text-white",
    iconGlow: "shadow-[0_4px_12px_rgba(245,158,11,0.3)]",
  },
  "streak-30": {
    bg: "bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-purple-500/10 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-purple-950/30",
    border: "border-rose-200/50 dark:border-rose-800/40 hover:border-rose-400/60 dark:hover:border-rose-600/60",
    title: "text-rose-950 dark:text-rose-200",
    desc: "text-rose-700/80 dark:text-rose-400/70",
    glow: "shadow-[0_8px_30px_rgba(244,63,94,0.06)] hover:shadow-[0_8px_30px_rgba(244,63,94,0.18)]",
    iconBg: "bg-gradient-to-tr from-rose-500 to-purple-500 dark:from-rose-600 dark:to-purple-600",
    iconColor: "text-white",
    iconGlow: "shadow-[0_4px_12px_rgba(244,63,94,0.3)]",
  },
  "mock-master": {
    bg: "bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-orange-600/10 dark:from-yellow-950/30 dark:via-amber-950/20 dark:to-orange-950/30",
    border: "border-yellow-200/50 dark:border-yellow-800/40 hover:border-yellow-400/60 dark:hover:border-yellow-600/60",
    title: "text-amber-950 dark:text-amber-200",
    desc: "text-amber-800/80 dark:text-amber-400/70",
    glow: "shadow-[0_8px_30px_rgba(234,179,8,0.06)] hover:shadow-[0_8px_30px_rgba(234,179,8,0.18)]",
    iconBg: "bg-gradient-to-tr from-yellow-500 via-amber-400 to-orange-500 dark:from-yellow-600 dark:via-amber-500 dark:to-orange-600",
    iconColor: "text-white",
    iconGlow: "shadow-[0_4px_12px_rgba(234,179,8,0.3)]",
  },
  "multi-company": {
    bg: "bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 dark:from-violet-950/30 dark:via-purple-950/20 dark:to-fuchsia-950/30",
    border: "border-violet-200/50 dark:border-violet-800/40 hover:border-violet-400/60 dark:hover:border-violet-600/60",
    title: "text-violet-950 dark:text-violet-200",
    desc: "text-violet-700/80 dark:text-violet-400/70",
    glow: "shadow-[0_8px_30px_rgba(139,92,246,0.06)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.18)]",
    iconBg: "bg-gradient-to-tr from-violet-500 to-fuchsia-500 dark:from-violet-600 dark:to-fuchsia-600",
    iconColor: "text-white",
    iconGlow: "shadow-[0_4px_12px_rgba(139,92,246,0.3)]",
  },
  "level-5": {
    bg: "bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-indigo-500/10 dark:from-cyan-950/30 dark:via-teal-950/20 dark:to-indigo-950/30",
    border: "border-cyan-200/50 dark:border-cyan-800/40 hover:border-cyan-400/60 dark:hover:border-cyan-600/60",
    title: "text-cyan-950 dark:text-cyan-200",
    desc: "text-cyan-700/80 dark:text-cyan-400/70",
    glow: "shadow-[0_8px_30px_rgba(6,182,212,0.06)] hover:shadow-[0_8px_30px_rgba(6,182,212,0.18)]",
    iconBg: "bg-gradient-to-tr from-cyan-500 to-indigo-500 dark:from-cyan-600 dark:to-indigo-600",
    iconColor: "text-white",
    iconGlow: "shadow-[0_4px_12px_rgba(6,182,212,0.3)]",
  },
}

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

      <Card className="overflow-hidden border-border/80 shadow-md">
        <CardHeader className="border-b border-border/50 bg-muted/10 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="font-heading text-lg font-bold flex items-center gap-2">
                🏆 Credentials & Achievements
              </CardTitle>
              <p className="text-xs text-muted-foreground leading-normal">
                Earn milestone badges by onboarding, maintaining streaks, passing quizzes, and taking mock tests.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-center bg-background border rounded-xl px-3.5 py-1.5 shadow-sm">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground leading-none">Unlocked</p>
                <p className="mt-1 text-sm font-bold text-primary leading-none tabular-nums">
                  {earned.size} / {BADGES.length}
                </p>
              </div>
              <div className="relative w-16 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(earned.size / BADGES.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {BADGES.map((b) => {
              const has = earned.has(b.id)
              const theme = BADGE_THEMES[b.id] || {
                bg: "bg-primary/5",
                border: "border-primary/30",
                title: "text-foreground",
                desc: "text-muted-foreground",
                glow: "",
                iconBg: "bg-primary",
                iconColor: "text-primary-foreground",
                iconGlow: "",
              }
              return (
                <div
                  key={b.id}
                  className={cn(
                    "group relative flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                    has
                      ? cn(theme.bg, theme.border, theme.glow, "hover:-translate-y-1.5 hover:scale-[1.02]")
                      : "border-border/60 bg-muted/5 opacity-55 hover:opacity-75"
                  )}
                >
                  {/* Lock Indicator in top right */}
                  {!has && (
                    <div className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground border border-border/80 shadow-sm">
                      <Icon name="Lock" className="size-2.5" />
                    </div>
                  )}

                  {/* Icon Container with custom themed colors */}
                  <div
                    className={cn(
                      "grid size-14 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110",
                      has
                        ? cn(theme.iconBg, theme.iconColor, theme.iconGlow)
                        : "bg-muted/45 text-muted-foreground/40 dark:bg-muted/20 dark:text-muted-foreground/35 ring-1 ring-black/5"
                    )}
                  >
                    <Icon name={b.icon} className="size-6" />
                  </div>

                  {/* Text Details */}
                  <div className="space-y-1">
                    <p
                      className={cn(
                        "text-sm font-bold tracking-tight",
                        has ? theme.title : "text-muted-foreground/80"
                      )}
                    >
                      {b.label}
                    </p>
                    <p
                      className={cn(
                        "text-xs leading-normal font-medium",
                        has ? theme.desc : "text-muted-foreground/50"
                      )}
                    >
                      {b.description}
                    </p>
                  </div>
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



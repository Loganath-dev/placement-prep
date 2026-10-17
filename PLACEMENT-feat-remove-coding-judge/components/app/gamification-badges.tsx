"use client"

import * as React from "react"
import { useStoreState } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@/components/app/icon"
import { Progress } from "@/components/ui/progress"

const BADGE_META: Record<string, { label: string; description: string; icon: string; color: string }> = {
  "streak-7": { label: "7-Day Streak", description: "Studied for 7 days in a row.", icon: "Flame", color: "text-[color:var(--chart-1)]" },
  "streak-30": { label: "30-Day Streak", description: "Studied for 30 days in a row.", icon: "Flame", color: "text-[color:var(--chart-2)]" },
  "streak-100": { label: "100-Day Streak", description: "Studied for 100 days in a row.", icon: "Flame", color: "text-[color:var(--chart-3)]" },
  "goal-crusher": { label: "Goal Crusher", description: "Hit your daily XP target.", icon: "Target", color: "text-[color:var(--success)]" },
}

export function GamificationBadges() {
  const { state } = useStoreState()
  
  const dailyProgress = Math.min(100, Math.round((state.goals.dailyXp / Math.max(1, state.goals.targetXp)) * 100))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon name="Trophy" className="size-4 text-primary" /> Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium">
              <Icon name="Flame" className="size-4 text-[color:var(--chart-1)]" />
              {state.streak.count} Day Streak
            </span>
            <span className="text-muted-foreground">{state.xp} XP total</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Daily Goal</span>
            <span>{state.goals.dailyXp} / {state.goals.targetXp} XP</span>
          </div>
          <Progress value={dailyProgress} className="h-2" />
        </div>

        {state.badges.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Badges Earned</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {state.badges.map((b) => {
                const meta = BADGE_META[b]
                if (!meta) return null
                return (
                  <div key={b} className="flex items-start gap-3 rounded-md border border-border p-3">
                    <span className={`mt-0.5 shrink-0 ${meta.color}`}>
                      <Icon name={meta.icon as any} className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium leading-none">{meta.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

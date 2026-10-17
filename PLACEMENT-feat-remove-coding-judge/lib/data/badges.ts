import type { AppState } from "@/lib/types"
import { levelFromXP } from "@/lib/scoring"

export interface Badge {
  id: string
  label: string
  description: string
  icon: string // lucide name
  earned: (s: AppState) => boolean
}

export const BADGES: Badge[] = [
  {
    id: "first-steps",
    label: "First Steps",
    description: "Completed onboarding and picked your companies.",
    icon: "Flag",
    earned: (s) => s.onboarded,
  },
  {
    id: "first-pass",
    label: "First Pass",
    description: "Passed your first chapter quiz (>=60%).",
    icon: "CircleCheckBig",
    earned: (s) =>
      Object.values(s.progress).some((p) =>
        Object.values(p.chapters).some((c) => c.passed),
      ),
  },
  {
    id: "streak-7",
    label: "Week Warrior",
    description: "Reached a 7-day streak.",
    icon: "CalendarCheck",
    earned: (s) => s.streak.count >= 7,
  },
  {
    id: "streak-30",
    label: "Unstoppable",
    description: "Reached a 30-day streak.",
    icon: "Target",
    earned: (s) => s.streak.count >= 30,
  },
  {
    id: "mock-master",
    label: "Mock Master",
    description: "Completed a company-pattern mock test.",
    icon: "Trophy",
    earned: (s) => Object.values(s.progress).some((p) => p.mockScores.length > 0),
  },
  {
    id: "multi-company",
    label: "Multi-Tasker",
    description: "Preparing for 3 or more companies.",
    icon: "Layers",
    earned: (s) => s.interested.length >= 3,
  },
  {
    id: "level-5",
    label: "Rising Star",
    description: "Reached Level 5.",
    icon: "Star",
    earned: (s) => levelFromXP(s.xp).level >= 5,
  },
]

export function earnedBadges(s: AppState): Badge[] {
  return BADGES.filter((b) => b.earned(s))
}

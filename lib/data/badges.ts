import type { AppState } from "@/lib/types"
import { levelFromXP } from "@/lib/scoring"

export interface Badge {
  id: string
  label: string
  description: string
  icon: string
  earned: (s: AppState) => boolean
}

function chapterProgress(s: AppState) {
  return Object.values(s.progress).flatMap((company) => Object.values(company.chapters))
}

function lessonPassCount(s: AppState) {
  return chapterProgress(s).reduce((total, chapter) => total + (chapter.learning?.passedLessonIds?.length ?? 0), 0)
}

function recallCount(s: AppState) {
  return chapterProgress(s).filter((chapter) => Boolean(chapter.learning?.recallCompletedAt)).length
}

function practiceCount(s: AppState) {
  return chapterProgress(s).reduce((total, chapter) => total + (chapter.learning?.practiceAttempts?.length ?? 0), 0)
}

function chapterPassCount(s: AppState) {
  return chapterProgress(s).filter((chapter) => chapter.passed).length
}

export const BADGES: Badge[] = [
  { id: "first-steps", label: "First Steps", description: "Complete your StudyBench onboarding.", icon: "Flag", earned: (s) => s.onboarded },
  { id: "first-lesson", label: "Lesson Learner", description: "Pass your first lesson checkpoint.", icon: "BookOpenCheck", earned: (s) => lessonPassCount(s) >= 1 },
  { id: "lesson-explorer", label: "Lesson Explorer", description: "Pass 10 lesson checkpoints.", icon: "Map", earned: (s) => lessonPassCount(s) >= 10 },
  { id: "first-recall", label: "Memory Builder", description: "Complete Chapter Recall for the first time.", icon: "Brain", earned: (s) => recallCount(s) >= 1 },
  { id: "recall-five", label: "Recall Ranger", description: "Complete Chapter Recall in five chapters.", icon: "Lightbulb", earned: (s) => recallCount(s) >= 5 },
  { id: "first-practice", label: "Practice Starter", description: "Complete your first chapter practice attempt.", icon: "ListChecks", earned: (s) => practiceCount(s) >= 1 },
  { id: "practice-ten", label: "Practice Pro", description: "Complete 10 chapter practice attempts.", icon: "Dumbbell", earned: (s) => practiceCount(s) >= 10 },
  { id: "first-chapter", label: "Chapter Champion", description: "Pass your first chapter assessment.", icon: "BadgeCheck", earned: (s) => chapterPassCount(s) >= 1 },
  { id: "five-chapters", label: "Path Builder", description: "Pass five chapter assessments.", icon: "Route", earned: (s) => chapterPassCount(s) >= 5 },
  { id: "perfect-score", label: "Perfect Score", description: "Earn 100% in a chapter assessment.", icon: "Star", earned: (s) => chapterProgress(s).some((chapter) => chapter.bestScore === 100 && chapter.passed) },
  { id: "xp-250", label: "Bright Beginner", description: "Earn 250 experience points.", icon: "Zap", earned: (s) => s.xp >= 250 },
  { id: "xp-1000", label: "Knowledge Seeker", description: "Earn 1,000 experience points.", icon: "Sparkles", earned: (s) => s.xp >= 1000 },
  { id: "level-five", label: "Rising Star", description: "Reach Level 5.", icon: "Crown", earned: (s) => levelFromXP(s.xp).level >= 5 },
  { id: "mock-master", label: "Mock Master", description: "Complete a company mock test.", icon: "Trophy", earned: (s) => Object.values(s.progress).some((company) => company.mockScores.length > 0) },
  { id: "code-crafter", label: "Code Crafter", description: "Pass five coding test cases across your attempts.", icon: "Code2", earned: (s) => s.codingAttempts.reduce((total, attempt) => total + attempt.passed, 0) >= 5 },
]

export function earnedBadges(s: AppState): Badge[] {
  // The persisted badge ID list is hydrated from learning_badge_awards by the
  // server. Never derive earned UI state from client-editable counters/snapshots.
  return BADGES.filter((badge) => s.badges?.includes(badge.id) === true)
}

export function badgeProgress(s: AppState, badge: Badge): boolean {
  return s.badges?.includes(badge.id) === true
}

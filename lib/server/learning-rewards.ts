import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import { levelFromXP } from "@/lib/scoring"

type RewardMetrics = { onboarded: boolean; lessons: number; practices: number; chapters: number; mocks: number; perfect: number; xp: number }
const BADGE_RULES: { id: string; label: string; predicate: (metrics: RewardMetrics) => boolean }[] = [
  { id: "first-steps", label: "First Steps", predicate: (m) => m.onboarded },
  { id: "first-lesson", label: "Lesson Learner", predicate: (m) => m.lessons >= 1 },
  { id: "lesson-explorer", label: "Lesson Explorer", predicate: (m) => m.lessons >= 10 },
  { id: "first-practice", label: "Practice Starter", predicate: (m) => m.practices >= 1 },
  { id: "practice-ten", label: "Practice Pro", predicate: (m) => m.practices >= 10 },
  { id: "first-chapter", label: "Chapter Champion", predicate: (m) => m.chapters >= 1 },
  { id: "five-chapters", label: "Path Builder", predicate: (m) => m.chapters >= 5 },
  { id: "mock-master", label: "Mock Master", predicate: (m) => m.mocks >= 1 },
  { id: "perfect-score", label: "Perfect Score", predicate: (m) => m.perfect >= 1 },
  { id: "xp-250", label: "Bright Beginner", predicate: (m) => m.xp >= 250 },
  { id: "xp-1000", label: "Knowledge Seeker", predicate: (m) => m.xp >= 1000 },
  { id: "level-five", label: "Rising Star", predicate: (m) => levelFromXP(m.xp).level >= 5 },
]

function xpForEvent(event: { event_type: string; passed: boolean | null; selected_answers: Record<string, unknown> | null }) {
  if (event.event_type === "lesson_card_completed") return 2
  if (event.event_type === "lesson_practice_submitted" && event.passed) return 25
  // Chapter Recall is a learner self-check, not independently verifiable mastery.
  // It therefore does not award XP; the chapter assessment remains the mastery gate.
  if (event.event_type === "chapter_assessment_submitted" && event.passed) return 50
  if (event.event_type === "daily_challenge_submitted") return 30 + Number(event.selected_answers?.correct_count ?? 0) * 10
  if (event.event_type === "weekly_challenge_submitted") return 100 + Number(event.selected_answers?.correct_count ?? 0) * 10
  if (event.event_type === "mock_test_submitted") return 100
  return 0
}

/** Process only the event just committed. The database RPC returns bounded aggregate metrics. */
export async function ensureLearningRewards(userId: string, sourceEventId: string) {
  const admin = createAdminClient()
  const { data: event, error: eventError } = await admin.from("learning_progress_events")
    .select("id,event_type,passed,selected_answers,company_id")
    .eq("id", sourceEventId).eq("user_id", userId).maybeSingle()
  if (eventError) throw eventError
  if (!event) throw new Error("Reward source event was not found for this user")

  const xp = xpForEvent(event)
  if (xp > 0) {
    const rewardKey = event.event_type === "mock_test_submitted" ? `mock-first-${event.company_id}` : "learning-v1"
    const reward = { user_id: userId, source_event_id: event.id, reward_key: rewardKey, xp }
    if (event.event_type === "mock_test_submitted") {
      const { error } = await admin.from("learning_reward_ledger").insert(reward)
      // A first-mock reward is unique per user/company, even across attempts.
      if (error && error.code !== "23505") throw error
    } else {
      const { error } = await admin.from("learning_reward_ledger").upsert(reward, { onConflict: "source_event_id,reward_key", ignoreDuplicates: true })
      if (error) throw error
    }
  }

  const { data: rawMetrics, error: metricsError } = await admin.rpc("get_learning_reward_metrics", { p_user_id: userId })
  if (metricsError) throw metricsError
  const metrics = rawMetrics as RewardMetrics
  if (!metrics || typeof metrics.xp !== "number") throw new Error("Learning reward metrics RPC returned an invalid result")
  const earned = BADGE_RULES.filter((badge) => badge.predicate(metrics)).map((badge) => ({
    user_id: userId, badge_id: badge.id, evidence: { source: "verified_learning_events", label: badge.label },
  }))
  if (earned.length) {
    const { error } = await admin.from("learning_badge_awards").upsert(earned, { onConflict: "user_id,badge_id", ignoreDuplicates: true })
    if (error) throw error
  }
  const { data: awards, error: awardsError } = await admin.from("learning_badge_awards").select("badge_id").eq("user_id", userId)
  if (awardsError) throw awardsError
  return { xp: metrics.xp, badges: (awards ?? []).map((row: { badge_id: string }) => row.badge_id) }
}

import type { Mistake } from "@/lib/types"

/**
 * Leitner-box spaced repetition for the Mistake Notebook.
 *
 * Every question a student gets wrong becomes a "card" in box 1. Reviewing it
 * correctly promotes it one box; getting it wrong again sends it back to box 1.
 * Higher boxes have longer intervals, so material you have nearly mastered comes
 * back rarely while fragile material comes back fast. This is what makes weak
 * areas actually stick instead of being seen once and forgotten.
 *
 * Schedules live on the Mistake object (box/due/reviews/lapses). They persist in
 * localStorage with the rest of app state; for signed-in users on a fresh device
 * the schedule resets to box 1 (a re-miss would reset it anyway), so degrading
 * gracefully is acceptable and needs no DB migration.
 */

/** Days before a card in each box (1..5) becomes due again. Box 1 = same day. */
export const LEITNER_INTERVALS_DAYS = [0, 1, 3, 7, 16] as const
export const MAX_BOX = LEITNER_INTERVALS_DAYS.length // 5
const DAY_MS = 24 * 60 * 60 * 1000

export interface ReviewSchedule {
  box: number
  due: number
  reviews: number
  lapses: number
}

export function intervalDaysForBox(box: number): number {
  const clamped = Math.min(Math.max(box, 1), MAX_BOX)
  return LEITNER_INTERVALS_DAYS[clamped - 1]!
}

/** Current box for a card, defaulting an unscheduled mistake to box 1. */
export function boxOf(m: Pick<Mistake, "box">): number {
  const b = m.box ?? 1
  return Math.min(Math.max(b, 1), MAX_BOX)
}

/**
 * Next schedule after a review. Correct promotes one box; wrong resets to box 1
 * and records a lapse. `due` is pushed out by the new box's interval.
 */
export function nextSchedule(
  prev: Pick<Mistake, "box" | "reviews" | "lapses">,
  correct: boolean,
  now: number = Date.now(),
): ReviewSchedule {
  const currentBox = boxOf(prev)
  const box = correct ? Math.min(currentBox + 1, MAX_BOX) : 1
  const due = now + intervalDaysForBox(box) * DAY_MS
  return {
    box,
    due,
    reviews: (prev.reviews ?? 0) + 1,
    lapses: (prev.lapses ?? 0) + (correct ? 0 : 1),
  }
}

/** A card is due when its `due` timestamp has passed (or it was never scheduled). */
export function isDue(m: Pick<Mistake, "due">, now: number = Date.now()): boolean {
  return (m.due ?? 0) <= now
}

/** A card is "mastered" once it reaches the top box. */
export function isMastered(m: Pick<Mistake, "box">): boolean {
  return boxOf(m) >= MAX_BOX
}

/**
 * Cards due for review now, weakest-first: lower boxes (more fragile) surface
 * before higher boxes, and within a box the most overdue comes first.
 */
export function dueForReview<T extends Pick<Mistake, "due" | "box">>(
  mistakes: T[],
  now: number = Date.now(),
): T[] {
  return mistakes
    .filter((m) => isDue(m, now))
    .sort((a, b) => boxOf(a) - boxOf(b) || (a.due ?? 0) - (b.due ?? 0))
}

export function dueCount(mistakes: Pick<Mistake, "due">[], now: number = Date.now()): number {
  return mistakes.reduce((n, m) => (isDue(m, now) ? n + 1 : n), 0)
}

/** 0–100 aggregate mastery across the notebook (box 1 = 0%, top box = 100%). */
export function masteryPercent(mistakes: Pick<Mistake, "box">[]): number {
  if (mistakes.length === 0) return 0
  const total = mistakes.reduce((sum, m) => sum + (boxOf(m) - 1), 0)
  return Math.round((total / (mistakes.length * (MAX_BOX - 1))) * 100)
}

/** Human label for when a card is next due. */
export function dueLabel(m: Pick<Mistake, "due">, now: number = Date.now()): string {
  const due = m.due ?? 0
  if (due <= now) return "Due now"
  const days = Math.ceil((due - now) / DAY_MS)
  if (days <= 1) return "Due tomorrow"
  return `Due in ${days} days`
}

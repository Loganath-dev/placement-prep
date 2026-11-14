"use client"

// DB sync helpers. All calls use the browser client (anon key + RLS).
// Sync failures are surfaced to the durable client queue; they must never be swallowed.

import { createClient } from "@/lib/supabase/client"

import { logger } from "@/lib/logger"
import type { ProgressSyncOperations } from "@/lib/supabase/progress-sync-queue"
import type {
  AppState,
  CompanyId,
  DriveOutcome,
  Mistake,
  Profile,
} from "@/lib/types"

// ─── row shapes ──────────────────────────────────────────────────────────────
// Hand-typed mirrors of the `supabase/migrations` tables. `select("*")` otherwise
// hands back implicitly-`any` rows, so every field read below would be unchecked.

interface ProfileRow {
  id: string
  name: string | null
  college: string | null
  branch: string | null
  grad_year: string | null
  cgpa: string | null
  backlogs: string | null
}

interface UserStateRow {
  id: string
  xp: number
  streak_count: number
  streak_last_active: string | null
  premium: boolean
  premium_until: string | null
  primary_company: CompanyId
  interested: CompanyId[] | null
  onboarded: boolean
  topic_stats: AppState["topicStats"] | null
  badges: string[] | null
  coding_attempts: AppState["codingAttempts"] | null
  learning_preferences?: AppState["learningPreferences"] | null
}

interface CompanyProgressRow {
  user_id: string
  company_id: CompanyId
  mock_scores: number[] | null
}

interface LearningProgressEventRow {
  id: string
  company_id: CompanyId
  section_id: string
  chapter_id: string
  lesson_id: string | null
  event_type: "lesson_card_completed" | "lesson_practice_submitted" | "chapter_recall_completed" | "chapter_assessment_submitted"
  selected_answers: Record<string, unknown> | null
  score_percent: number | null
  passed: boolean | null
  created_at: string
}

interface DailyRow {
  id: string
  date: string | null
  general: boolean | null
  aptitude: boolean | null
  coding: boolean | null
  weekly_date?: string | null
  weekly_completed?: boolean | null
  weekly_score?: number | null
}

interface MistakeRow {
  user_id: string
  question_id: string
  prompt: string
  question_type?: "mcq" | "fill_blank" | null
  accepted_answers?: string[] | null
  response_text?: string | null
  options: Mistake["options"]
  answer: number
  chosen: number
  explanation: string
  topic: string
  difficulty: string
  ts: number
  // Leitner schedule (migration 0009). Nullable so rows written before the
  // migration still read fine.
  box: number | null
  due: number | null
  reviews: number | null
  lapses: number | null
}

interface DriveOutcomeRow {
  id: string
  user_id: string
  company_id: CompanyId
  result: string
  stage_reached: string
  pri_at_drive: number
  ts: number
  notes: string | null
}

async function safe(label: string, fn: () => PromiseLike<unknown> | unknown): Promise<void> {
  try {
    const res = await fn()
    if (res && typeof res === 'object' && 'error' in res && res.error) {
      throw res.error
    }
  } catch (err) {
    // Preserve PostgREST fields explicitly: Supabase error objects often
    // serialize as {} in browser consoles because their properties are not enumerable.
    const value = err && typeof err === "object" ? err as Record<string, unknown> : {}
    const diagnostic = {
      label,
      code: typeof value.code === "string" ? value.code : null,
      message: typeof value.message === "string" ? value.message : err instanceof Error ? err.message : String(err),
      details: typeof value.details === "string" ? value.details : null,
      hint: typeof value.hint === "string" ? value.hint : null,
      status: typeof value.status === "number" ? value.status : null,
    }
    logger.warn(`[supabase/db] ${label} failed`, diagnostic)
    throw err instanceof Error ? err : Object.assign(new Error(diagnostic.message), diagnostic)
  }
}

function isMissingWeeklyChallengeColumns(error: { code?: string; message?: string } | null) {
  return error?.code === "42703" && /weekly_(date|completed|score)/i.test(error.message ?? "")
}

function warnWeeklyChallengeMigrationPending() {
  logger.warn(
    "[supabase/db] daily_challenges is missing weekly fields; apply migration 20261112164658_personalized_challenges.sql to enable weekly challenge persistence",
  )
}

async function upsertDailyChallenges(userId: string, s: AppState) {
  const sb = createClient()
  const result = await sb.from("daily_challenges").upsert({
    id: userId,
    date: s.daily.date,
    general: s.daily.general,
    aptitude: s.daily.aptitude,
    coding: s.daily.coding,
    weekly_date: s.daily.weeklyDate ?? null,
    weekly_completed: s.daily.weeklyCompleted ?? false,
    weekly_score: s.daily.weeklyScore ?? null,
  })

  if (isMissingWeeklyChallengeColumns(result.error)) {
    warnWeeklyChallengeMigrationPending()
    await sb.from("daily_challenges").upsert({
      id: userId,
      date: s.daily.date,
      general: s.daily.general,
      aptitude: s.daily.aptitude,
      coding: s.daily.coding,
    }).throwOnError()
    return
  }

  if (result.error) throw result.error
}

async function loadAllLearningEvents(sb: ReturnType<typeof createClient>, userId: string) {
  const rows: LearningProgressEventRow[] = []
  const pageSize = 500
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await sb.from("learning_progress_events")
      .select("id,company_id,section_id,chapter_id,lesson_id,event_type,selected_answers,score_percent,passed,created_at")
      .eq("user_id", userId).order("created_at", { ascending: true }).order("id", { ascending: true })
      .range(from, from + pageSize - 1)
    if (error) throw error
    const page = (data ?? []) as LearningProgressEventRow[]
    rows.push(...page)
    if (page.length < pageSize) return rows
  }
}

async function loadAllLearningRewards(sb: ReturnType<typeof createClient>, userId: string) {
  const rows: { xp: number }[] = []
  const pageSize = 500
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await sb.from("learning_reward_ledger").select("xp")
      .eq("user_id", userId).order("created_at", { ascending: true }).order("id", { ascending: true })
      .range(from, from + pageSize - 1)
    if (error) throw error
    const page = (data ?? []) as { xp: number }[]
    rows.push(...page)
    if (page.length < pageSize) return rows
  }
}

export async function loadUserState(userId: string): Promise<Partial<AppState> | null> {
  const sb = createClient()

  const [profRes, stRes, cpRes, initialDailyRes, outcomesRes, progressEventsRes, rewardsRes, badgeAwardsRes, legacyArchiveRes] = await Promise.all([
    sb.from("profiles").select("id,name,college,branch,grad_year,cgpa,backlogs").eq("id", userId).maybeSingle(),
    sb.from("user_state").select("id,xp,streak_count,streak_last_active,premium,premium_until,primary_company,interested,onboarded,topic_stats,badges,coding_attempts,learning_preferences").eq("id", userId).maybeSingle(),
    sb.from("company_progress").select("user_id,company_id,mock_scores").eq("user_id", userId),
    sb.from("daily_challenges").select("id,date,general,aptitude,coding,weekly_date,weekly_completed,weekly_score").eq("id", userId).maybeSingle(),
    sb.from("drive_outcomes").select("id,user_id,company_id,result,stage_reached,pri_at_drive,ts,notes").eq("user_id", userId).order("ts", { ascending: false }).limit(50),
    loadAllLearningEvents(sb, userId).then((data) => ({ data, error: null })),
    loadAllLearningRewards(sb, userId).then((data) => ({ data, error: null })),
    sb.from("learning_badge_awards").select("badge_id").eq("user_id", userId),
    sb.from("company_progress_legacy_archive").select("company_id,chapters,mock_scores,archived_at,provenance").eq("user_id", userId),
  ])
  let dailyRes = initialDailyRes
  if (isMissingWeeklyChallengeColumns(dailyRes.error)) {
    warnWeeklyChallengeMigrationPending()
    dailyRes = await sb.from("daily_challenges")
      .select("id,date,general,aptitude,coding")
      .eq("id", userId)
      .maybeSingle()
  }

  let mistakesRes = await sb.from("mistakes")
    .select("user_id,question_id,prompt,question_type,accepted_answers,response_text,options,answer,chosen,explanation,topic,difficulty,ts,box,due,reviews,lapses")
    .eq("user_id", userId).order("ts", { ascending: false }).limit(60)

  // Older deployments may not have applied migration 0023 yet. Keep the
  // notebook readable while the additive migration is pending; typed-answer
  // metadata becomes available automatically after the migration is applied.
  if (mistakesRes.error?.code === "42703") {
    const missingTypedColumn = /question_type|accepted_answers|response_text/.test(mistakesRes.error.message ?? "")
    if (missingTypedColumn) {
      logger.warn("[loadUserState] mistakes table is missing typed-answer columns; using legacy-compatible read until migration 0033 is applied")
      mistakesRes = await sb.from("mistakes")
        .select("user_id,question_id,prompt,options,answer,chosen,explanation,topic,difficulty,ts,box,due,reviews,lapses")
        .eq("user_id", userId).order("ts", { ascending: false }).limit(60)
    }
  }

  // Keep failures attributable to their query. Supabase/PostgREST error objects
  // often appear as `{}` in browser consoles because their useful fields are not
  // enumerable; copy the safe diagnostic fields explicitly instead.
  const queryResults = [
    ["profiles", profRes],
    ["user_state", stRes],
    ["company_progress", cpRes],
    ["daily_challenges", dailyRes],
    ["mistakes", mistakesRes],
    ["drive_outcomes", outcomesRes],
    ["learning_progress_events", progressEventsRes],
    ["learning_reward_ledger", rewardsRes],
    ["learning_badge_awards", badgeAwardsRes],
    ["company_progress_legacy_archive", legacyArchiveRes],
  ] as const

  const failedQueries = queryResults.filter(([, result]) => result.error)
  for (const [table, result] of failedQueries) {
    const error = result.error!
    logger.error("[loadUserState] Supabase query failed", {
      table,
      code: error.code ?? null,
      message: error.message ?? "Unknown Supabase query error",
      details: error.details ?? null,
      hint: error.hint ?? null,
      status: "status" in error ? error.status : null,
    })
  }
  if (failedQueries.length) {
    const [table, result] = failedQueries[0]
    throw new Error(`Could not load StudyBench progress from ${table}: ${result.error?.message ?? "database query failed"}`)
  }

  const prof = profRes.data as ProfileRow | null
  const st = stRes.data as UserStateRow | null
  const cpRows = (cpRes.data ?? []) as CompanyProgressRow[]
  const daily = dailyRes.data as DailyRow | null
  const mistakeRows = (mistakesRes.data ?? []) as MistakeRow[]
  const outcomeRows = (outcomesRes.data ?? []) as DriveOutcomeRow[]

  if (!st) {
    if (!prof) return null
    return {
      onboarded: Boolean(prof.name || prof.grad_year),
      profile: {
        name: prof.name ?? "",
        college: prof.college ?? "",
        branch: prof.branch ?? "",
        gradYear: prof.grad_year ?? "",
        cgpa: prof.cgpa ?? "",
        backlogs: prof.backlogs ?? "",
      },
    }
  }

  // `company_progress.chapters` is a browser-writable legacy snapshot. Keep its
  // mock history for display, but never use its completion flags, scores or
  // card IDs as current mastery. New mastery is rebuilt only from server-authored
  // learning_progress_events (RLS permits owner reads; browser writes are denied).
  const progress: AppState["progress"] = {}
  for (const row of cpRows ?? []) {
    progress[row.company_id] = { chapters: {}, mockScores: row.mock_scores ?? [] }
  }
  const progressEvents = (progressEventsRes.data ?? []) as LearningProgressEventRow[]
  for (const event of progressEvents) {
    const company = progress[event.company_id] ?? { chapters: {}, mockScores: [] }
    const previous = company.chapters[event.chapter_id] ?? { bestScore: 0, passed: false, skipped: false, attempts: 0 }
    const learning = previous.learning ?? { completedCardIds: [], completedLessonIds: [], passedLessonIds: [], practiceAttempts: [], savedCards: [] }
    if (event.event_type === "lesson_card_completed") {
      const cardId = typeof event.selected_answers?.cardId === "string" ? event.selected_answers.cardId : null
      if (cardId && !learning.completedCardIds.includes(cardId)) learning.completedCardIds.push(cardId)
    } else if (event.event_type === "lesson_practice_submitted" && event.lesson_id && event.score_percent !== null) {
      learning.practiceAttempts.push({ score: event.score_percent, correct: 0, total: 0, completedAt: Date.parse(event.created_at) || 0, lessonId: event.lesson_id })
      if (event.passed) learning.passedLessonIds = [...new Set([...(learning.passedLessonIds ?? []), event.lesson_id])]
    } else if (event.event_type === "chapter_recall_completed" && event.passed) {
      learning.recallCompletedAt = Date.parse(event.created_at) || Date.now()
    } else if (event.event_type === "chapter_assessment_submitted") {
      const score = event.score_percent ?? 0
      previous.bestScore = Math.max(previous.bestScore, score)
      previous.attempts += 1
      previous.passed = previous.passed || event.passed === true
    }
    previous.learning = learning
    company.chapters[event.chapter_id] = previous
    progress[event.company_id] = company
  }

  const mistakes: AppState["mistakes"] = mistakeRows.map((r) => ({
    questionId: r.question_id,
    prompt: r.prompt,
    type: r.question_type ?? undefined,
    acceptedAnswers: r.accepted_answers ?? undefined,
    responseText: r.response_text ?? undefined,
    options: r.options,
    answer: r.answer,
    chosen: r.chosen,
    explanation: r.explanation,
    topic: r.topic,
    difficulty: r.difficulty as AppState["mistakes"][number]["difficulty"],
    ts: r.ts,
    // Leitner schedule — undefined when the row predates migration 0009; the
    // client treats an undefined box as box 1, due now.
    box: r.box ?? undefined,
    due: r.due ?? undefined,
    reviews: r.reviews ?? undefined,
    lapses: r.lapses ?? undefined,
  }))

  const outcomes: AppState["outcomes"] = outcomeRows.map((r) => ({
    id: r.id,
    companyId: r.company_id,
    result: r.result as DriveOutcome["result"],
    stageReached: r.stage_reached as DriveOutcome["stageReached"],
    priAtDrive: r.pri_at_drive,
    ts: r.ts,
    notes: r.notes ?? undefined,
  }))

  return {
    onboarded: st.onboarded,
    learningPreferences: st.learning_preferences ?? undefined,
    premium: st.premium,
    premiumUntil: st.premium_until ?? undefined,
    xp: (rewardsRes.data ?? []).reduce((sum, row) => sum + Number(row.xp || 0), 0),
    streak: { count: st.streak_count, lastActive: st.streak_last_active ?? "" },
    primary: st.primary_company,
    interested: st.interested ?? [],
    badges: (badgeAwardsRes.data ?? []).map((row: { badge_id: string }) => row.badge_id),
    topicStats: st.topic_stats ?? {},
    codingAttempts: st.coding_attempts ?? [],
    mistakes,
    outcomes,
    progress,
    ...(prof
      ? {
          profile: {
            name: prof.name ?? "",
            college: prof.college ?? "",
            branch: prof.branch ?? "",
            gradYear: prof.grad_year ?? "",
            cgpa: prof.cgpa ?? "",
            backlogs: prof.backlogs ?? "",
          },
        }
      : {}),
    ...(daily
      ? {
          daily: {
            date: daily.date ?? "",
            general: daily.general ?? false,
            aptitude: daily.aptitude ?? false,
            coding: daily.coding ?? false,
            weeklyDate: daily.weekly_date ?? undefined,
            weeklyCompleted: daily.weekly_completed ?? false,
            weeklyScore: daily.weekly_score ?? undefined,
          },
        }
      : {}),
  }
}

// NOTE: premium / premium_until are intentionally absent from every write
// below. Entitlement is granted only by the server (verify route + webhook,
// service role) and a DB trigger rejects client writes to those columns —
// including the old failure mode where a stale client synced premium=false
// and silently destroyed a paid entitlement.

export async function ensureUserState(userId: string, s: AppState) {
  await safe("ensureUserState", async () => {
    const sb = createClient()
    await sb.from("user_state").upsert({
      id: userId,
      streak_count: s.streak.count,
      streak_last_active: s.streak.lastActive,
      primary_company: s.primary,
      interested: s.interested,
      // ONE-WAY RATCHET: never write onboarded=false to the DB.
      // If the user has completed onboarding, that fact lives in the DB and
      // must never be overwritten by a client that hydrated from DEFAULT_STATE
      // (e.g. new device, private browsing, cleared storage). We only include
      // this field when it is true so the DB value is always preserved.
      ...(s.onboarded ? { onboarded: true } : {}),
      topic_stats: s.topicStats,
      coding_attempts: s.codingAttempts,
    }).throwOnError()
    await upsertDailyChallenges(userId, s)
  })
}

export function syncProfile(userId: string, p: Profile) {
  return safe("syncProfile", () => {
    return createClient()
      .from("profiles")
      .upsert({
        id: userId,
        name: p.name,
        college: p.college,
        branch: p.branch,
        grad_year: p.gradYear,
        cgpa: p.cgpa,
        backlogs: p.backlogs,
      }).throwOnError()
  })
}


export function syncUserState(userId: string, s: AppState) {
  return safe("syncUserState", () =>
    createClient()
      .from("user_state")
      .upsert({
        id: userId,
        streak_count: s.streak.count,
        streak_last_active: s.streak.lastActive,
        primary_company: s.primary,
        interested: s.interested,
        // ONE-WAY RATCHET — same reasoning as ensureUserState above.
        ...(s.onboarded ? { onboarded: true } : {}),
        topic_stats: s.topicStats,
        coding_attempts: s.codingAttempts,
        learning_preferences: s.learningPreferences ?? {},
      }),
  )
}

export function syncCompanyProgress(userId: string, companyId: string, s: AppState) {
  const prog = s.progress[companyId]
  if (!prog) return Promise.resolve()
  return safe("syncCompanyProgress", async () => {
    const sb = createClient()
    // The legacy chapters column is intentionally not writable by browser roles.
    // Use a column-scoped UPDATE for the remaining legacy mock history; an UPSERT
    // would also require UPDATE privileges on the conflict key columns.
    const updated = await sb
      .from("company_progress")
      .update({ mock_scores: prog.mockScores })
      .eq("user_id", userId)
      .eq("company_id", companyId)
      .select("user_id")
      .maybeSingle()
    if (updated.error) throw updated.error
    if (updated.data) return

    const inserted = await sb.from("company_progress").insert({
      user_id: userId,
      company_id: companyId,
      mock_scores: prog.mockScores,
    })
    if (inserted.error?.code === "23505") {
      const retry = await sb
        .from("company_progress")
        .update({ mock_scores: prog.mockScores })
        .eq("user_id", userId)
        .eq("company_id", companyId)
      if (retry.error) throw retry.error
      return
    }
    if (inserted.error) throw inserted.error
  })
}

export function syncDaily(userId: string, s: AppState) {
  return safe("syncDaily", () => upsertDailyChallenges(userId, s))
}

/**
 * Idempotently upsert one mistake as part of the durable full-snapshot sync.
 */
export function syncOneMistake(userId: string, m: Mistake) {
  return safe("syncOneMistake", () =>
    createClient()
      .from("mistakes")
      .upsert(
        {
          user_id: userId,
          question_id: m.questionId,
          prompt: m.prompt,
          question_type: m.type ?? null,
          accepted_answers: m.acceptedAnswers ?? null,
          response_text: m.responseText ?? null,
          options: m.options,
          answer: m.answer,
          chosen: m.chosen,
          explanation: m.explanation,
          topic: m.topic,
          difficulty: m.difficulty,
          ts: m.ts,
          box: m.box ?? 1,
          due: m.due ?? null,
          reviews: m.reviews ?? 0,
          lapses: m.lapses ?? 0,
        },
        { onConflict: "user_id,question_id" },
      ),
  )
}

/**
 * Persist just the Leitner schedule after a review. Lighter than a full
 * upsert — the row already exists from recordMistake — and keeps the review
 * schedule portable across devices.
 */
export function syncMistakeSchedule(userId: string, m: Mistake) {
  return safe("syncMistakeSchedule", () =>
    createClient()
      .from("mistakes")
      .update({
        box: m.box ?? 1,
        due: m.due ?? null,
        reviews: m.reviews ?? 0,
        lapses: m.lapses ?? 0,
      })
      .eq("user_id", userId)
      .eq("question_id", m.questionId),
  )
}

/**
 * Delete a single mistake row. Called when the student clears one mistake.
 */
export function deleteMistake(userId: string, questionId: string) {
  return safe("deleteMistake", () =>
    createClient()
      .from("mistakes")
      .delete()
      .eq("user_id", userId)
      .eq("question_id", questionId),
  )
}

/**
 * Delete all mistakes for a user. Called on clearMistakes() and account reset.
 */
export function deleteAllMistakes(userId: string) {
  return safe("deleteAllMistakes", () =>
    createClient().from("mistakes").delete().eq("user_id", userId),
  )
}

// ─── drive outcomes ───────────────────────────────────────────────────────────

/** Upsert a single self-reported drive outcome (keyed by client-generated id). */
export function syncOutcome(userId: string, o: DriveOutcome) {
  return safe("syncOutcome", () =>
    createClient()
      .from("drive_outcomes")
      .upsert(
        {
          id: o.id,
          user_id: userId,
          company_id: o.companyId,
          result: o.result,
          stage_reached: o.stageReached,
          pri_at_drive: o.priAtDrive,
          ts: o.ts,
          notes: o.notes ?? null,
        },
        { onConflict: "user_id,id" },
      ),
  )
}

/** Delete one drive outcome the student removed. */
export function deleteOutcome(userId: string, id: string) {
  return safe("deleteOutcome", () =>
    createClient().from("drive_outcomes").delete().eq("user_id", userId).eq("id", id),
  )
}

/** Delete all self-reported drive outcomes after an explicit local reset. */
export function deleteAllOutcomes(userId: string) {
  return safe("deleteAllOutcomes", () =>
    createClient().from("drive_outcomes").delete().eq("user_id", userId),
  )
}

/**
 * Synchronize a complete, acknowledged snapshot. This is intentionally the
 * single recovery path used by the durable queue: profile, user state, daily
 * goals, every company progress record, mistakes and drive outcomes are all
 * covered. Operations are idempotent (upserts keyed by user/question or id).
 * Destructive operations are explicit queue intents; absence from a capped
 * local snapshot must never be interpreted as a remote deletion.
 */
export async function syncAll(userId: string, s: AppState, operations: ProgressSyncOperations = {}): Promise<void> {
  await Promise.all([
    syncProfile(userId, s.profile),
    syncUserState(userId, s),
    syncDaily(userId, s),
    ...Object.keys(s.progress).map((companyId) => syncCompanyProgress(userId, companyId, s)),
  ])

  const mistakes = s.mistakes ?? []
  const outcomes = s.outcomes ?? []

  // A local snapshot is deliberately bounded (60 mistakes / 50 outcomes), so
  // absence from that snapshot is NOT evidence that a remote record was deleted.
  // Only explicit, durable queue operations may delete remote student data.
  if (operations.clearAllMistakes) {
    await deleteAllMistakes(userId)
  }
  if (operations.clearAllOutcomes) {
    await deleteAllOutcomes(userId)
  }
  if (mistakes.length) {
    await Promise.all(mistakes.map((mistake) => syncOneMistake(userId, mistake)))
  }
  if (outcomes.length) {
    await Promise.all(outcomes.map((outcome) => syncOutcome(userId, outcome)))
  }
  await Promise.all([
    ...(operations.deleteMistakeIds ?? []).map((id) => deleteMistake(userId, id)),
    ...(operations.deleteOutcomeIds ?? []).map((id) => deleteOutcome(userId, id)),
  ])
}

// ─── question reports (admin review queue) ───────────────────────────────────

/** Persist a student's report of a problematic question (RLS-protected). */
export async function reportQuestion(questionId: string, prompt: string, reason?: string) {
  const sb = createClient()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return // not signed in — nothing to persist
  await safe("reportQuestion", () =>
    sb.from("question_reports").insert({
      user_id: user.id,
      question_id: questionId,
      prompt: prompt.slice(0, 500),
      reason: reason ?? null,
    }),
  )
}

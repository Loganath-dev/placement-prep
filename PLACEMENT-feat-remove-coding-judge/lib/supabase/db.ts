"use client"

// DB sync helpers. All calls use the browser client (anon key + RLS).
// Errors are logged but not thrown so the UI stays responsive offline.

import { createClient } from "@/lib/supabase/client"

import { logger } from "@/lib/logger"
import type {
  AppState,
  CompanyId,
  CompanyProgress,
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
}

interface CompanyProgressRow {
  user_id: string
  company_id: CompanyId
  chapters: CompanyProgress["chapters"] | null
  mock_scores: number[] | null
}

interface DailyRow {
  id: string
  date: string | null
  general: boolean | null
  aptitude: boolean | null
  coding: boolean | null
}

interface MistakeRow {
  user_id: string
  question_id: string
  prompt: string
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

const SYNC_ERROR_EVENT = "studybench:sync-error"

async function safe(label: string, fn: () => PromiseLike<unknown> | unknown): Promise<void> {
  try {
    const res = await fn()
    if (res && typeof res === 'object' && 'error' in res && res.error) {
      throw res.error
    }
  } catch (err) {
    // Sync failures are usually transient (offline) so this is warn-level, not a
    // captured error — the UI's offline banner is driven by the event below.
    logger.warn(`[supabase/db] ${label} failed`, { error: err })
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(SYNC_ERROR_EVENT, { detail: { label } }))
    }
  }
}

export async function loadUserState(userId: string): Promise<Partial<AppState> | null> {
  const sb = createClient()

  const [profRes, stRes, cpRes, dailyRes, mistakesRes, outcomesRes] = await Promise.all([
    sb.from("profiles").select("id,name,college,branch,grad_year,cgpa,backlogs").eq("id", userId).maybeSingle(),
    sb.from("user_state").select("id,xp,streak_count,streak_last_active,premium,premium_until,primary_company,interested,onboarded,topic_stats,badges,coding_attempts").eq("id", userId).maybeSingle(),
    sb.from("company_progress").select("user_id,company_id,chapters,mock_scores").eq("user_id", userId),
    sb.from("daily_challenges").select("id,date,general,aptitude,coding").eq("id", userId).maybeSingle(),
    sb.from("mistakes").select("user_id,question_id,prompt,options,answer,chosen,explanation,topic,difficulty,ts,box,due,reviews,lapses").eq("user_id", userId).order("ts", { ascending: false }).limit(60),
    sb.from("drive_outcomes").select("id,user_id,company_id,result,stage_reached,pri_at_drive,ts,notes").eq("user_id", userId).order("ts", { ascending: false }).limit(50),
  ])

  for (const res of [profRes, stRes, cpRes, dailyRes, mistakesRes, outcomesRes]) {
    if (res.error) {
      console.error("[loadUserState] db query failed:", res.error)
    }
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

  const progress: AppState["progress"] = {}
  for (const row of cpRows ?? []) {
    progress[row.company_id] = {
      chapters: row.chapters ?? {},
      mockScores: row.mock_scores ?? [],
    }
  }

  const mistakes: AppState["mistakes"] = mistakeRows.map((r) => ({
    questionId: r.question_id,
    prompt: r.prompt,
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
    premium: st.premium,
    premiumUntil: st.premium_until ?? undefined,
    xp: st.xp,
    streak: { count: st.streak_count, lastActive: st.streak_last_active ?? "" },
    primary: st.primary_company,
    interested: st.interested ?? [],
    badges: st.badges ?? [],
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
      xp: s.xp,
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
      badges: s.badges,
      coding_attempts: s.codingAttempts,
    }).throwOnError()
    await sb.from("daily_challenges").upsert({
      id: userId,
      date: s.daily.date,
      general: s.daily.general,
      aptitude: s.daily.aptitude,
      coding: s.daily.coding,
    }).throwOnError()
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
        xp: s.xp,
        streak_count: s.streak.count,
        streak_last_active: s.streak.lastActive,
        primary_company: s.primary,
        interested: s.interested,
        // ONE-WAY RATCHET — same reasoning as ensureUserState above.
        ...(s.onboarded ? { onboarded: true } : {}),
        topic_stats: s.topicStats,
        badges: s.badges,
        coding_attempts: s.codingAttempts,
      }),
  )
}

export function syncCompanyProgress(userId: string, companyId: string, s: AppState) {
  const prog = s.progress[companyId]
  if (!prog) return Promise.resolve()
  return safe("syncCompanyProgress", () =>
    createClient()
      .from("company_progress")
      .upsert(
        {
          user_id: userId,
          company_id: companyId,
          chapters: prog.chapters,
          mock_scores: prog.mockScores,
        },
        { onConflict: "user_id,company_id" },
      ),
  )
}

export function syncDaily(userId: string, s: AppState) {
  return safe("syncDaily", () =>
    createClient()
      .from("daily_challenges")
      .upsert({
        id: userId,
        date: s.daily.date,
        general: s.daily.general,
        aptitude: s.daily.aptitude,
        coding: s.daily.coding,
      }),
  )
}

/**
 * Upsert a single mistake. Called immediately after recordMistake() so the DB
 * stays in sync even if the user closes the tab before a full syncAll() fires.
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

export async function syncAll(userId: string, s: AppState) {
  await Promise.all([
    syncProfile(userId, s.profile),
    syncUserState(userId, s),
    syncDaily(userId, s),
    ...Object.keys(s.progress).map((companyId) => syncCompanyProgress(userId, companyId, s)),
  ])
}

/**
 * Called once when a user completes onboarding. Persist profile, user_state
 * and initial progress. Kept separate for clarity and potential future
 * onboarding-specific side-effects.
 */
export async function syncOnboardingComplete(userId: string, s: AppState) {
  // Ensure profile and user state are persisted, and all company progress rows
  // are created. Reuse existing helpers.
  await syncProfile(userId, s.profile)
  await syncUserState(userId, s)
  await Promise.all(Object.keys(s.progress).map((companyId) => syncCompanyProgress(userId, companyId, s)))
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

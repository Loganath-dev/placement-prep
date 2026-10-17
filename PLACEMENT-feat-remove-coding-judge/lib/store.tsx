"use client"

import * as React from "react"
import type { Session, User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import {
  deleteAllMistakes,
  deleteMistake,
  deleteOutcome,
  ensureUserState,
  loadUserState,
  syncAll,
  syncCompanyProgress,
  syncDaily,
  syncMistakeSchedule,
  syncOneMistake,
  syncOnboardingComplete,
  syncOutcome,
  syncProfile,
  syncUserState,
} from "@/lib/supabase/db"
import type {
  AppState,
  CodingAttempt,
  CompanyId,
  DriveOutcome,
  Profile,
  Question,
  SectionId,
} from "@/lib/types"
import { levelFromXP, XP } from "@/lib/scoring"
import { nextSchedule } from "@/lib/spaced-repetition"
import { identifyAnalyticsUser, track } from "@/lib/analytics"

const MISTAKE_CAP = 60

const STORAGE_KEY = "studybench.state.v1"
const LEGACY_STORAGE_KEY = "placeready.state.v1"
const HYDRATION_TIMEOUT_MS = 8_000

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer)
  })
}

function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = HYDRATION_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timer)
  })
}

const DEFAULT_STATE: AppState = {
  onboarded: false,
  premium: false,
  premiumUntil: undefined,
  entitlementSource: "free",
  profile: { name: "", college: "", branch: "", gradYear: "", cgpa: "", backlogs: "" },
  interested: [],
  primary: "general",
  xp: 0,
  streak: { count: 0, lastActive: "" },
  badges: [],
  goals: { dailyXp: 0, targetXp: 50, lastUpdated: "" },
  progress: {},
  topicStats: {},
  daily: { date: "", general: false, aptitude: false, coding: false },
  codingAttempts: [],
  mistakes: [],
  outcomes: [],
}

function normalizeEntitlement(state: AppState): AppState {
  if (!state.premium || !state.premiumUntil) return state
  const expiresAt = Date.parse(state.premiumUntil)
  if (!Number.isFinite(expiresAt) || expiresAt > Date.now()) return state
  return { ...state, premium: false, premiumUntil: undefined }
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}
function yesterday(d: string): string {
  const dt = new Date(d + "T00:00:00")
  dt.setDate(dt.getDate() - 1)
  return dt.toISOString().slice(0, 10)
}

function ensureProgress(state: AppState, id: CompanyId) {
  const existing = state.progress[id]
  if (!existing) {
    state.progress[id] = { chapters: {}, mockScores: [] }
  } else {
    // Shallow-clone this company's progress so mutations don't bleed into prev state.
    state.progress[id] = {
      chapters: { ...existing.chapters },
      mockScores: [...existing.mockScores],
    }
  }
  return state.progress[id]
}

function awardXp(state: AppState, amount: number) {
  if (amount <= 0) return
  state.xp += amount
  
  const t = today()
  if (state.goals.lastUpdated !== t) {
    state.goals.dailyXp = 0
    state.goals.lastUpdated = t
  }
  state.goals.dailyXp += amount
  
  if (state.goals.dailyXp >= state.goals.targetXp) {
    if (!state.badges.includes("goal-crusher")) state.badges.push("goal-crusher")
  }
}

function bumpStreak(state: AppState): number {
  const t = today()
  let milestoneXp = 0
  if (state.streak.lastActive === t) return 0
  const prev = state.streak.count
  const count = state.streak.lastActive === yesterday(t) ? prev + 1 : 1
  state.streak = { count, lastActive: t }
  if (count === 7 && prev < 7) {
    milestoneXp = XP.streak7
    if (!state.badges.includes("streak-7")) state.badges.push("streak-7")
  }
  if (count === 30 && prev < 30) {
    milestoneXp = XP.streak30
    if (!state.badges.includes("streak-30")) state.badges.push("streak-30")
  }
  if (count === 100 && prev < 100) {
    milestoneXp = XP.streak100
    if (!state.badges.includes("streak-100")) state.badges.push("streak-100")
  }
  awardXp(state, milestoneXp)
  return milestoneXp
}

function applyTopics(
  state: AppState,
  results: { topic: string; correct: boolean }[],
) {
  for (const r of results) {
    const prev = state.topicStats[r.topic]
    // Always create a new object so shallow-cloned topicStats doesn't share refs with prev state.
    state.topicStats[r.topic] = {
      correct: (prev?.correct ?? 0) + (r.correct ? 1 : 0),
      total: (prev?.total ?? 0) + 1,
    }
  }
}

export interface QuizResult {
  score: number
  passed: boolean
  xpGained: number
  newlyPassed: boolean
}

// ── Context shapes ──────────────────────────────────────────────────────────

interface StoreStateValue {
  state: AppState
  hydrated: boolean
  userId: string | null
  /** Account registration timestamp (ISO). */
  userCreatedAt: string | null
}

interface StoreActionsValue {
  completeOnboarding: (p: Profile, interested: CompanyId[], primary: CompanyId) => Promise<void>
  setPrimary: (id: CompanyId) => void
  addInterested: (id: CompanyId) => void
  removeInterested: (id: CompanyId) => void
  activatePremium: (premiumUntil?: string, source?: "creator" | "purchase") => void
  updateProfile: (p: Partial<Profile>) => void
  submitQuiz: (args: {
    companyId: CompanyId
    sectionId: SectionId
    chapterId: string
    results: { topic: string; correct: boolean }[]
  }) => QuizResult
  skipChapter: (companyId: CompanyId, chapterId: string) => void
  submitDaily: (
    category: "general" | "aptitude" | "coding",
    results: { topic: string; correct: boolean }[],
  ) => { xpGained: number }
  submitMock: (companyId: CompanyId, score: number) => { xpGained: number }
  recordCodingAttempt: (attempt: CodingAttempt) => void
  recordMistake: (q: Question, chosen: number) => void
  /** Record the outcome of a spaced-repetition review for one card. */
  reviewMistake: (questionId: string, correct: boolean) => void
  clearMistake: (questionId: string) => void
  clearMistakes: () => void
  /** Log the outcome of a real placement drive (local-only). */
  recordOutcome: (outcome: Omit<DriveOutcome, "id" | "ts"> & { ts?: number }) => void
  removeOutcome: (id: string) => void
  reset: () => void
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
}

interface StoreSubscriptionValue {
  getSnapshot: () => StoreStateValue
  subscribe: (listener: () => void) => () => void
}

// StoreContext re-exports both shapes for the backward-compatible useStore() hook.
type StoreContextValue = StoreStateValue & StoreActionsValue

// ── Contexts ────────────────────────────────────────────────────────────────

const StoreStateContext = React.createContext<StoreStateValue | null>(null)

// Actions context is intentionally never null after mount; stable identity
// means any component subscribed only to actions never re-renders on state changes.
const StoreActionsContext = React.createContext<StoreActionsValue | null>(null)
const StoreSubscriptionContext = React.createContext<StoreSubscriptionValue | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────────

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AppState>(DEFAULT_STATE)
  const [hydrated, setHydrated] = React.useState(false)
  const [userId, setUserId] = React.useState<string | null>(null)
  const [userCreatedAt, setUserCreatedAt] = React.useState<string | null>(null)
  const snapshotRef = React.useRef<StoreStateValue>({
    state: DEFAULT_STATE,
    hydrated: false,
    userId: null,
    userCreatedAt: null,
  })
  const listenersRef = React.useRef(new Set<() => void>())
  const skipPersistRef = React.useRef(false)

  function readCachedState(): AppState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
      if (!raw) return null
      const parsed = normalizeEntitlement({ ...DEFAULT_STATE, ...JSON.parse(raw) })
      if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, raw)
        localStorage.removeItem(LEGACY_STORAGE_KEY)
      }
      return parsed
    } catch {
      return null
    }
  }

  // ── hydrate: localStorage first (fast), then Supabase (authoritative) ──
  React.useEffect(() => {
    let cancelled = false

    async function applyRemoteState(user: User) {
      const [remoteResult, statusResult] = await Promise.allSettled([
        withTimeout(loadUserState(user.id), HYDRATION_TIMEOUT_MS, "Supabase state"),
        fetchWithTimeout("/api/premium/status", { cache: "no-store" }),
      ])
      if (cancelled) return

      const remote = remoteResult.status === "fulfilled" ? remoteResult.value : null
      if (remote) {
        const normalized = normalizeEntitlement({ ...DEFAULT_STATE, ...remote })
        // Repair DB rows for users whose onboarding flag was lost to a race.
        if (normalized.onboarded) {
          void syncUserState(user.id, normalized)
        }
        if (statusResult.status === "fulfilled" && statusResult.value.ok) {
          try {
            const entitlement = (await statusResult.value.json()) as {
              premium: boolean
              premiumUntil: string | null
              source: "creator" | "purchase" | "free"
            }
            if (cancelled) return
            setState({
              ...normalized,
              premium: entitlement.premium,
              premiumUntil: entitlement.premiumUntil ?? undefined,
              entitlementSource: entitlement.source,
            })
          } catch {
            setState(normalized)
          }
        } else {
          setState(normalized)
        }
      } else if (remoteResult.status === "fulfilled") {
        // Brand-new user — seed rows without overwriting anything later.
        await withTimeout(
          ensureUserState(user.id, DEFAULT_STATE),
          HYDRATION_TIMEOUT_MS,
          "Supabase state initialization",
        )
      }
    }

    async function hydrate() {
      const cachedState = readCachedState()

      // 1. Check Supabase session before applying any cached routing state.
      const supabase = createClient()
      const user = await withTimeout<{ data: { user: User | null } }>(
        supabase.auth.getUser() as Promise<{ data: { user: User | null } }>,
        HYDRATION_TIMEOUT_MS,
        "Supabase auth",
      )
        .then((res) => res.data.user)
        .catch(() => null)

      if (cancelled) return

      if (user) {
        skipPersistRef.current = false
        setUserId(user.id)
        setUserCreatedAt(user.created_at ?? null)
        identifyAnalyticsUser(user.id)

        // Fast path: cache already says onboarded — show UI immediately while
        // Supabase refreshes in the background. Never fast-path when
        // onboarded=false; that value is often stale (sign-out race).
        const canFastPath = cachedState?.onboarded === true
        if (canFastPath && cachedState) {
          setState(cachedState)
          setHydrated(true)
        }

        try {
          await applyRemoteState(user)
        } catch {
          if (!canFastPath && cachedState) setState(cachedState)
        }

        if (!canFastPath && !cancelled) setHydrated(true)
      } else {
        identifyAnalyticsUser(null)
        if (cachedState) setState(cachedState)
        if (!cancelled) setHydrated(true)
      }
    }

    void hydrate()

    // 4. Keep userId in sync with auth state changes (sign-in / sign-out).
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      if (cancelled) return
      const nextUserId = session?.user?.id ?? null
      setUserId(nextUserId)
      setUserCreatedAt(session?.user?.created_at ?? null)

      // After email signup (no full reload) or OAuth return, pull authoritative
      // state so onboarded/profile/targets survive the next sign-out.
      if (event === "SIGNED_IN" && session?.user) {
        skipPersistRef.current = false
        identifyAnalyticsUser(session.user.id)
        try {
          await applyRemoteState(session.user)
        } catch {
          /* offline */
        }
      }

      if (event === "SIGNED_OUT") {
        skipPersistRef.current = true
      }
    })
    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  React.useEffect(() => {
    if (!hydrated || !state.premium || !state.premiumUntil) return
    const expiresAt = Date.parse(state.premiumUntil)
    if (!Number.isFinite(expiresAt)) return
    const delay = Math.max(0, Math.min(expiresAt - Date.now(), 60_000))
    const id = setTimeout(() => {
      setState((prev) => normalizeEntitlement(prev))
    }, delay)
    return () => clearTimeout(id)
  }, [hydrated, state.premium, state.premiumUntil])

  // ── persist to localStorage, debounced so rapid mutations don't thrash ──
  React.useEffect(() => {
    if (!hydrated || skipPersistRef.current) return
    const id = setTimeout(() => {
      if (skipPersistRef.current) return
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {
        /* quota / private mode */
      }
    }, 400)
    return () => clearTimeout(id)
  }, [state, hydrated])

  // ── mutate helper ──
  const uidRef = React.useRef(userId)
  React.useEffect(() => {
    uidRef.current = userId
  }, [userId])

  // mutate is stable (empty deps) — state is always read via setState(prev => ...)
  const mutate = React.useCallback(
    <T,>(fn: (draft: AppState) => T, syncFn?: (uid: string, next: AppState) => void): T => {
      let out!: T
      let next!: AppState
      setState((prev) => {
        // Targeted shallow clone: top-level primitives copy by spread; every mutable
        // nested collection gets its own new reference so prev state is never mutated.
        // ensureProgress() deep-clones individual company progress on first touch.
        // applyTopics() always writes new { correct, total } objects.
        const draft: AppState = {
          ...prev,
          streak: { ...prev.streak },
          profile: { ...prev.profile },
          progress: { ...prev.progress },
          topicStats: { ...prev.topicStats },
          daily: { ...prev.daily },
          mistakes: prev.mistakes ? [...prev.mistakes] : [],
          outcomes: prev.outcomes ? [...prev.outcomes] : [],
          codingAttempts: prev.codingAttempts ? [...prev.codingAttempts] : [],
          badges: [...prev.badges],
          goals: { ...prev.goals },
          interested: [...prev.interested],
        }
        out = fn(draft)
        next = draft
        return draft
      })
      // Fire-and-forget sync to Supabase after state is committed.
      if (syncFn && uidRef.current) {
        const uid = uidRef.current
        // Use a microtask so React has time to commit the new state.
        Promise.resolve().then(() => syncFn(uid, next))
      }
      return out
    },
    [],
  )

  // ── Actions context — deps: [mutate] only, so this is STABLE after mount ──
  const actionsValue = React.useMemo<StoreActionsValue>(
    () => ({
      completeOnboarding: async (profile, interested, primary) => {
        let nextState!: AppState
        mutate((d) => {
          d.profile = profile
          d.interested = interested
          d.primary = primary
          d.onboarded = true
          for (const id of interested) ensureProgress(d, id)
          ensureProgress(d, "general")
          track("onboarding_complete", { primary, interested_count: interested.length })
          nextState = d
        })

        let uid = uidRef.current
        if (!uid) {
          const {
            data: { user },
          } = await createClient().auth.getUser()
          uid = user?.id ?? null
        }

        if (!uid) {
          throw new Error("You must be signed in to complete onboarding.")
        }

        if (!nextState) {
          throw new Error("Onboarding state was not saved. Please try again.")
        }

        try {
          await syncOnboardingComplete(uid, nextState)
        } catch (err) {
          mutate((d) => {
            d.onboarded = false
          })
          throw err
        }
      },

      setPrimary: (id) =>
        mutate(
          (d) => {
            d.primary = id
            if (!d.interested.includes(id) && id !== "general") d.interested.push(id)
            ensureProgress(d, id)
          },
          syncUserState,
        ),

      addInterested: (id) =>
        mutate(
          (d) => {
            if (!d.interested.includes(id)) d.interested.push(id)
            ensureProgress(d, id)
          },
          syncUserState,
        ),

      removeInterested: (id) =>
        mutate(
          (d) => {
            d.interested = d.interested.filter((x) => x !== id)
            if (d.primary === id) d.primary = d.interested[0] ?? "general"
          },
          syncUserState,
        ),

      // Local echo after a server-verified payment. The authoritative write
      // already happened in the verify route / webhook via the service role —
      // clients can no longer write entitlement columns (DB trigger).
      activatePremium: (premiumUntil, source = "purchase") =>
        mutate(
          (d) => {
            const next = normalizeEntitlement({
              ...d,
              premium: true,
              premiumUntil,
            })
            d.premium = next.premium
            d.premiumUntil = next.premiumUntil
            d.entitlementSource = source
            track("premium_upgrade", { premium_until: premiumUntil ?? null })
          },
          syncUserState,
        ),

      updateProfile: (p) =>
        mutate(
          (d) => void Object.assign(d.profile, p),
          (uid, s) => syncProfile(uid, s.profile),
        ),

      submitQuiz: ({ companyId, sectionId, chapterId, results }) =>
        mutate(
          (d): QuizResult => {
            const total = results.length || 1
            const correct = results.filter((r) => r.correct).length
            const score = Math.round((correct / total) * 100)
            const prog = ensureProgress(d, companyId)
            const prev = prog.chapters[chapterId] ?? {
              bestScore: 0,
              passed: false,
              skipped: false,
              attempts: 0,
            }
            const wasPassed = prev.passed
            const bestScore = Math.max(prev.bestScore, score)
            const passed = bestScore >= 70
            prog.chapters[chapterId] = {
              bestScore,
              passed,
              skipped: false,
              attempts: prev.attempts + 1,
            }
            applyTopics(d, results)
            let xpGained = correct * XP.correctFirst
            const newlyPassed = passed && !wasPassed
            if (newlyPassed) xpGained += XP.quizPass
            awardXp(d, xpGained)
            xpGained += bumpStreak(d)
            void sectionId
            track("quiz_attempt", { company: companyId, chapter: chapterId, score, passed, newly_passed: newlyPassed })
            return { score, passed, xpGained, newlyPassed }
          },
          (uid, s) => {
            syncCompanyProgress(uid, companyId, s)
            syncUserState(uid, s)
          },
        ),

      skipChapter: (companyId, chapterId) =>
        mutate(
          (d) => {
            const prog = ensureProgress(d, companyId)
            const prev = prog.chapters[chapterId]
            if (prev?.passed) return
            prog.chapters[chapterId] = {
              bestScore: prev?.bestScore ?? 0,
              passed: false,
              skipped: true,
              attempts: prev?.attempts ?? 0,
            }
          },
          (uid, s) => syncCompanyProgress(uid, companyId, s),
        ),

      submitDaily: (category, results) =>
        mutate(
          (d) => {
            const t = today()
            if (d.daily.date !== t)
              d.daily = { date: t, general: false, aptitude: false, coding: false }
            applyTopics(d, results)
            const correct = results.filter((r) => r.correct).length
            let xpGained = correct * XP.correctFirst
            if (!d.daily[category]) {
              d.daily[category] = true
              xpGained += XP.daily
            }
            awardXp(d, xpGained)
            xpGained += bumpStreak(d)
            return { xpGained }
          },
          (uid, s) => {
            syncDaily(uid, s)
            syncUserState(uid, s)
          },
        ),

      submitMock: (companyId, score) =>
        mutate(
          (d) => {
            const prog = ensureProgress(d, companyId)
            prog.mockScores.push(score)
            let xpGained = XP.mock
            awardXp(d, xpGained)
            xpGained += bumpStreak(d)
            track("mock_complete", { company: companyId, score })
            return { xpGained }
          },
          (uid, s) => {
            syncCompanyProgress(uid, companyId, s)
            syncUserState(uid, s)
          },
        ),

      recordCodingAttempt: (attempt) =>
        mutate((d) => {
          d.codingAttempts = [attempt, ...(d.codingAttempts ?? [])].slice(0, 80)
        }, syncUserState),

      recordMistake: (qn, chosen) =>
        mutate(
          (d) => {
            const without = (d.mistakes ?? []).filter((m) => m.questionId !== qn.id)
            const entry = {
              questionId: qn.id,
              prompt: qn.prompt,
              options: qn.options,
              answer: qn.answer,
              chosen,
              explanation: qn.explanation,
              topic: qn.topic,
              difficulty: qn.difficulty,
              ts: Date.now(),
              // Fresh miss → Leitner box 1, due immediately. Re-missing an
              // existing card also lands here, which correctly resets it.
              box: 1,
              due: Date.now(),
              reviews: 0,
              lapses: 0,
            }
            d.mistakes = [entry, ...without].slice(0, MISTAKE_CAP)
          },
          (uid, s) => {
            // Sync only the new/updated entry — cheaper than a full syncAll.
            const entry = s.mistakes.find((m) => m.questionId === qn.id)
            if (entry) syncOneMistake(uid, entry)
          },
        ),

      reviewMistake: (questionId, correct) =>
        mutate(
          (d) => {
            const list = d.mistakes ?? []
            const i = list.findIndex((x) => x.questionId === questionId)
            if (i === -1) return
            // Write a new object (the array is shallow-cloned; its items are shared
            // with prev state) rather than mutating the existing card in place.
            list[i] = { ...list[i], ...nextSchedule(list[i], correct) }
          },
          // Persist just the updated Leitner schedule so review state follows the
          // student across devices (mistakes table gained box/due in migration 0009).
          (uid, s) => {
            const entry = s.mistakes.find((m) => m.questionId === questionId)
            if (entry) syncMistakeSchedule(uid, entry)
          },
        ),

      clearMistake: (questionId) =>
        mutate(
          (d) => {
            d.mistakes = (d.mistakes ?? []).filter((m) => m.questionId !== questionId)
          },
          (uid) => deleteMistake(uid, questionId),
        ),

      clearMistakes: () =>
        mutate(
          (d) => void (d.mistakes = []),
          (uid) => deleteAllMistakes(uid),
        ),

      recordOutcome: (outcome) =>
        mutate(
          (d) => {
            const entry: DriveOutcome = {
              ...outcome,
              id:
                typeof crypto !== "undefined" && "randomUUID" in crypto
                  ? crypto.randomUUID()
                  : `outcome-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              ts: outcome.ts ?? Date.now(),
            }
            d.outcomes = [entry, ...(d.outcomes ?? [])]
            track("drive_outcome_logged", {
              company: entry.companyId,
              result: entry.result,
              stage: entry.stageReached,
              pri_at_drive: entry.priAtDrive,
            })
          },
          // Persist to drive_outcomes (migration 0009) so the calibration history
          // is portable across devices.
          (uid, s) => {
            const entry = s.outcomes[0]
            if (entry) syncOutcome(uid, entry)
          },
        ),

      removeOutcome: (id) =>
        mutate(
          (d) => {
            d.outcomes = (d.outcomes ?? []).filter((o) => o.id !== id)
          },
          (uid) => deleteOutcome(uid, id),
        ),

      reset: () => {
        setState(DEFAULT_STATE)
        if (uidRef.current) syncAll(uidRef.current, DEFAULT_STATE)
      },

      signOut: async () => {
        skipPersistRef.current = true
        await createClient().auth.signOut()
        setState(DEFAULT_STATE)
        setUserId(null)
        try {
          localStorage.removeItem(STORAGE_KEY)
          localStorage.removeItem(LEGACY_STORAGE_KEY)
        } catch {
          /* ignore */
        }
      },

      deleteAccount: async () => {
        skipPersistRef.current = true
        // Server route erases the auth user + all rows with the service-role key.
        try {
          await fetch("/api/account/delete", { method: "POST" })
        } catch {
          /* network — still sign out and clear locally below */
        }
        try {
          await createClient().auth.signOut()
        } catch {
          /* already signed out */
        }
        setState(DEFAULT_STATE)
        setUserId(null)
        try {
          localStorage.removeItem(STORAGE_KEY)
          localStorage.removeItem(LEGACY_STORAGE_KEY)
        } catch {
          /* ignore */
        }
      },
    }),
    [mutate],
  )

  // ── State context — re-renders whenever state/hydrated/userId change ──
  const stateValue = React.useMemo<StoreStateValue>(
    () => ({ state, hydrated, userId, userCreatedAt }),
    [state, hydrated, userId, userCreatedAt],
  )

  const subscriptionValue = React.useMemo<StoreSubscriptionValue>(
    () => ({
      getSnapshot: () => snapshotRef.current,
      subscribe: (listener) => {
        listenersRef.current.add(listener)
        return () => listenersRef.current.delete(listener)
      },
    }),
    [],
  )

  React.useEffect(() => {
    snapshotRef.current = stateValue
    for (const listener of listenersRef.current) listener()
  }, [stateValue])

  return (
    <StoreSubscriptionContext.Provider value={subscriptionValue}>
      <StoreActionsContext.Provider value={actionsValue}>
        <StoreStateContext.Provider value={stateValue}>
          {children}
        </StoreStateContext.Provider>
      </StoreActionsContext.Provider>
    </StoreSubscriptionContext.Provider>
  )
}

// ── Hooks ────────────────────────────────────────────────────────────────────

/** Read-only state + hydration flag. Re-renders on every state change. */
export function useStoreState(): StoreStateValue {
  const ctx = React.useContext(StoreStateContext)
  if (!ctx) throw new Error("useStoreState must be used within AppStoreProvider")
  return ctx
}

/**
 * Stable action functions — identity never changes after mount.
 * Use this in components that only dispatch mutations and never render state,
 * so they don't re-render when state changes.
 */
export function useStoreActions(): StoreActionsValue {
  const ctx = React.useContext(StoreActionsContext)
  if (!ctx) throw new Error("useStoreActions must be used within AppStoreProvider")
  return ctx
}

/**
 * Selector-based subscription for always-mounted shells and helpers that only
 * need a tiny slice of store state. This avoids re-rendering them on every
 * unrelated progress update.
 */
export function useStoreSelector<T>(selector: (value: StoreStateValue) => T): T {
  const ctx = React.useContext(StoreSubscriptionContext)
  if (!ctx) throw new Error("useStoreSelector must be used within AppStoreProvider")
  return React.useSyncExternalStore(
    ctx.subscribe,
    () => selector(ctx.getSnapshot()),
    () => selector(ctx.getSnapshot()),
  )
}

export function useStoreSnapshot(): StoreSubscriptionValue {
  const ctx = React.useContext(StoreSubscriptionContext)
  if (!ctx) throw new Error("useStoreSnapshot must be used within AppStoreProvider")
  return ctx
}

/**
 * Backward-compatible hook — returns both state and actions.
 * Existing call sites work unchanged; prefer useStoreState / useStoreActions
 * when a component only needs one of the two.
 */
export function useStore(): StoreContextValue {
  const stateCtx = useStoreState()
  const actionsCtx = useStoreActions()
  // actionsCtx identity is permanently stable after mount; stateCtx only changes
  // when state/hydrated/userId actually change. Memoize the spread so consumers
  // don't receive a new object reference on unrelated parent renders.
  return React.useMemo(() => ({ ...stateCtx, ...actionsCtx }), [stateCtx, actionsCtx])
}

export function useLevel() {
  const { state } = useStoreState()
  return levelFromXP(state.xp)
}

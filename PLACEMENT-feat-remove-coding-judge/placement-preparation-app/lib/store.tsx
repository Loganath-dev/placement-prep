"use client"

import * as React from "react"
import type { Session } from "@supabase/supabase-js"
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
import { COMPANIES } from "@/lib/data/companies"

const MISTAKE_CAP = 60

const STORAGE_KEY = "studybench.state.v1"
const LEGACY_STORAGE_KEY = "placeready.state.v1"

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

/**
 * Strip any company IDs that no longer exist in the active company list.
 * This prevents crashes when a user's stored state still references a removed
 * company (e.g. old "ibm" persisted in localStorage or Supabase).
 */
const ACTIVE_COMPANY_IDS = new Set(COMPANIES.map((c) => c.id))
function sanitizeCompanyIds(state: AppState): AppState {
  const primary = ACTIVE_COMPANY_IDS.has(state.primary) ? state.primary : "general"
  const interested = (state.interested ?? []).filter((id) => ACTIVE_COMPANY_IDS.has(id))
  if (primary === state.primary && interested.length === (state.interested ?? []).length) return state
  return { ...state, primary, interested }
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

function bumpStreak(state: AppState): number {
  const t = today()
  let milestoneXp = 0
  if (state.streak.lastActive === t) return 0
  const prev = state.streak.count
  const count = state.streak.lastActive === yesterday(t) ? prev + 1 : 1
  state.streak = { count, lastActive: t }
  if (count === 7 && prev < 7) milestoneXp = XP.streak7
  if (count === 30 && prev < 30) milestoneXp = XP.streak30
  if (count === 100 && prev < 100) milestoneXp = XP.streak100
  state.xp += milestoneXp
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
  const [state, _setState] = React.useState<AppState>(DEFAULT_STATE)
  const stateRef = React.useRef<AppState>(state)

  const setState = React.useCallback((val: React.SetStateAction<AppState>) => {
    const next = typeof val === "function" ? (val as (prevState: AppState) => AppState)(stateRef.current) : val
    stateRef.current = next
    _setState(next)
  }, [])

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

  // ── hydrate: localStorage first (fast), then Supabase (authoritative) ──
  React.useEffect(() => {
    async function hydrate() {
      // 1. Restore from localStorage immediately so UI doesn't flash blank.
      let restoredFromCache = false
      try {
        const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
        if (raw) {
          setState(sanitizeCompanyIds(normalizeEntitlement({ ...DEFAULT_STATE, ...JSON.parse(raw) })))
          restoredFromCache = true
          // Returning users can use the cached app immediately while Supabase
          // refreshes in the background. This removes a full-network loader.
          setHydrated(true)
          if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, raw)
            localStorage.removeItem(LEGACY_STORAGE_KEY)
          }
        }
      } catch {
        /* ignore corrupt state */
      }

      // 2. Check Supabase session.
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
        setUserCreatedAt(user.created_at ?? null)
        identifyAnalyticsUser(user.id)
        // 3. Refresh state and entitlement concurrently; neither depends on the
        // other and serializing them adds an avoidable network round trip.
        try {
          const remotePromise = loadUserState(user.id)
          const statusPromise = fetch("/api/premium/status", { cache: "no-store" }).catch(() => null)
          const [remote, statusResponse] = await Promise.all([remotePromise, statusPromise])
          
          if (remote) {
            const normalized = sanitizeCompanyIds(normalizeEntitlement({ ...DEFAULT_STATE, ...remote }))
            void ensureUserState(user.id, normalized)
            if (statusResponse && statusResponse.ok) {
              const entitlement = (await statusResponse.json()) as {
                premium: boolean
                premiumUntil: string | null
                source: "creator" | "purchase" | "free"
              }
              setState({
                ...normalized,
                premium: entitlement.premium,
                premiumUntil: entitlement.premiumUntil ?? undefined,
                entitlementSource: entitlement.source,
              })
            } else {
              setState(normalized)
            }
          } else {
            // `remote` is null only for brand-new users who have no rows in
            // user_state yet. Seed their row so subsequent syncs have a target.
            // ensureUserState uses a one-way ratchet on `onboarded`, so this
            // is safe to call with DEFAULT_STATE (which has onboarded=false).
            await ensureUserState(user.id, DEFAULT_STATE)
          }
        } catch {
          /* offline — localStorage fallback stays */
        }
      } else {
        identifyAnalyticsUser(null)
      }

      // First-time users have no safe cached routing state, so they wait for
      // the authoritative load. Returning users were already released above.
      if (!restoredFromCache) setHydrated(true)
    }

    void hydrate()

    // 4. Keep userId in sync with auth state changes (sign-in / sign-out).
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUserId(session?.user?.id ?? null)
      setUserCreatedAt(session?.user?.created_at ?? null)
    })
    return () => subscription.unsubscribe()
  }, [setState])

  React.useEffect(() => {
    if (!hydrated || !state.premium || !state.premiumUntil) return
    const expiresAt = Date.parse(state.premiumUntil)
    if (!Number.isFinite(expiresAt)) return
    const delay = Math.max(0, Math.min(expiresAt - Date.now(), 60_000))
    const id = setTimeout(() => {
      setState((prev) => normalizeEntitlement(prev))
    }, delay)
    return () => clearTimeout(id)
  }, [hydrated, state.premium, state.premiumUntil, setState])

  // ── persist to localStorage, debounced so rapid mutations don't thrash ──
  React.useEffect(() => {
    if (!hydrated) return
    const id = setTimeout(() => {
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
    <T,>(fn: (draft: AppState) => T, syncFn?: (uid: string, next: AppState) => void | PromiseLike<void>): T => {
      const prev = stateRef.current
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
        interested: [...prev.interested],
      }
      
      const out = fn(draft)
      stateRef.current = draft
      _setState(draft)
      
      // Fire-and-forget sync to Supabase after state is committed.
      if (syncFn && uidRef.current) {
        const uid = uidRef.current
        // Use a microtask so React has time to commit the new state.
        Promise.resolve().then(() => syncFn(uid, draft))
      }
      return out
    },
    [],
  )

  // ── Actions context — deps: [mutate] only, so this is STABLE after mount ──
  const actionsValue = React.useMemo<StoreActionsValue>(
    () => ({
      completeOnboarding: async (profile, interested, primary) => {
        const nextState = mutate((d) => {
            d.profile = profile
            d.interested = interested
            d.primary = primary
            d.onboarded = true
            for (const id of interested) ensureProgress(d, id)
            ensureProgress(d, "general")
            track("onboarding_complete", { primary, interested_count: interested.length })
            return d
          })

        const uid = uidRef.current
        if (uid) {
          await syncAll(uid, nextState)
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
        mutate((d) => {
          const next = normalizeEntitlement({
            ...d,
            premium: true,
            premiumUntil,
          })
          d.premium = next.premium
          d.premiumUntil = next.premiumUntil
          d.entitlementSource = source
          track("premium_upgrade", { premium_until: premiumUntil ?? null })
        }),

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
            d.xp += xpGained
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
            d.xp += xpGained
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
            d.xp += XP.mock
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
        // Set hydrated = false FIRST so the persist-to-localStorage effect
        // (which guards on `if (!hydrated) return`) cannot re-write
        // DEFAULT_STATE back into storage after removeItem.
        setHydrated(false)
        setState(DEFAULT_STATE)
        setUserId(null)
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {
          /* ignore */
        }
        await createClient().auth.signOut()
        window.location.href = "/auth/login"
      },

      deleteAccount: async () => {
        // Server route erases the auth user + all rows with the service-role key.
        try {
          await fetch("/api/account/delete", { method: "POST" })
        } catch {
          /* network — still sign out and clear locally below */
        }
        // Same guard as signOut: kill hydrated first so the persist effect
        // cannot re-write DEFAULT_STATE back into localStorage.
        setHydrated(false)
        setState(DEFAULT_STATE)
        setUserId(null)
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {
          /* ignore */
        }
        try {
          await createClient().auth.signOut()
        } catch {
          /* already signed out */
        }
      },
    }),
    [mutate, setState],
  )

  // ── State context — re-renders whenever state/hydrated/userId change ──
  const stateValue = React.useMemo<StoreStateValue>(
    () => ({ state, hydrated, userId, userCreatedAt }),
    [state, hydrated, userId, userCreatedAt],
  )
  
  React.useLayoutEffect(() => {
    snapshotRef.current = stateValue
  }, [stateValue])

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

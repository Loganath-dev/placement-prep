"use client"

import type { AppState } from "@/lib/types"
import { syncAll } from "@/lib/supabase/db"

const QUEUE_KEY_PREFIX = "studybench.progress-sync-queue.v2:"
const LEGACY_QUEUE_KEY = "studybench.progress-sync-queue.v1"
const ERROR_EVENT = "studybench:sync-error"
const STATUS_EVENT = "studybench:sync-status"
const COALESCE_MS = 350

export type ProgressSyncOperations = {
  /** Explicit deletions are queued separately from the capped local snapshots. */
  deleteMistakeIds?: string[]
  deleteOutcomeIds?: string[]
  /** Intentional bulk clears; never inferred from a partial local snapshot. */
  clearAllMistakes?: boolean
  clearAllOutcomes?: boolean
}

type PendingSnapshot = {
  userId: string
  state: AppState
  updatedAt: number
  attempts: number
  operations?: ProgressSyncOperations
}

const drains = new Map<string, Promise<void>>()
const retryTimers = new Map<string, ReturnType<typeof setTimeout>>()
const coalesceTimers = new Map<string, ReturnType<typeof setTimeout>>()
// Permanent authorization/schema/data errors remain queued locally but are not
// retried on a timer. A user-triggered retry can explicitly clear this block.
const blockedSyncUsers = new Set<string>()

function queueKey(userId: string): string {
  return `${QUEUE_KEY_PREFIX}${encodeURIComponent(userId)}`
}

/**
 * Each account has its own storage key. A single shared JSON object could be
 * lost when two tabs for different accounts perform read/modify/write at once.
 * The v1 record is read lazily for backwards compatibility and is never
 * destructively rewritten during migration.
 */
function readPending(userId: string): PendingSnapshot | null {
  const current = window.localStorage.getItem(queueKey(userId))
  if (current) {
    const parsed = JSON.parse(current) as PendingSnapshot
    if (parsed.userId !== userId || !parsed.state || typeof parsed.updatedAt !== "number") {
      throw new Error("The saved progress queue is invalid. Do not clear browser storage; contact support.")
    }
    return parsed
  }

  const legacyRaw = window.localStorage.getItem(LEGACY_QUEUE_KEY)
  if (!legacyRaw) return null
  const legacy = JSON.parse(legacyRaw) as Record<string, PendingSnapshot>
  const pending = legacy[userId]
  if (!pending) return null
  if (pending.userId !== userId || !pending.state) {
    throw new Error("The legacy progress queue is invalid. Do not clear browser storage; contact support.")
  }
  // Persist the migrated record before returning it. Keep v1 untouched so a
  // quota/write failure can never destroy the only recoverable copy.
  window.localStorage.setItem(queueKey(userId), JSON.stringify(pending))
  return pending
}

function writePending(userId: string, pending: PendingSnapshot | null): void {
  if (pending) window.localStorage.setItem(queueKey(userId), JSON.stringify(pending))
  else window.localStorage.removeItem(queueKey(userId))
}

function emitStatus(status: "pending" | "syncing" | "synced" | "failed", detail?: Record<string, unknown>) {
  window.dispatchEvent(new CustomEvent(STATUS_EVENT, { detail: { status, ...detail } }))
}

function isPermanentSyncError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false
  const value = error as Record<string, unknown>
  const code = typeof value.code === "string" ? value.code : ""
  const status = typeof value.status === "number" ? value.status : typeof value.statusCode === "number" ? value.statusCode : 0
  return ["42501", "23503", "23514", "22P02", "22001", "42P01", "42703"].includes(code)
    || [400, 401, 403, 404].includes(status)
}

function emitError(error: unknown, userId: string, queuedLocally: boolean, retryable = true) {
  const value = error && typeof error === "object" ? error as Record<string, unknown> : {}
  const diagnostic = {
    label: "progress snapshot",
    code: typeof value.code === "string" ? value.code : null,
    message: error instanceof Error ? error.message : String(error),
    details: typeof value.details === "string" ? value.details : null,
    hint: typeof value.hint === "string" ? value.hint : null,
    userId,
    queuedLocally,
    retryable,
  }
  window.dispatchEvent(new CustomEvent(ERROR_EVENT, { detail: diagnostic }))
  emitStatus("failed", diagnostic)
}

function scheduleDrain(userId: string, delay = COALESCE_MS): void {
  const existing = coalesceTimers.get(userId)
  if (existing) clearTimeout(existing)
  const timer = setTimeout(() => {
    coalesceTimers.delete(userId)
    void drain(userId)
  }, delay)
  coalesceTimers.set(userId, timer)
}

async function drain(userId: string): Promise<void> {
  if (blockedSyncUsers.has(userId)) return
  const active = drains.get(userId)
  if (active) return active

  const task = (async () => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      emitStatus("pending", { userId, reason: "offline" })
      return
    }
    while (true) {
      let next: PendingSnapshot | null
      try {
        next = readPending(userId)
      } catch (error) {
        emitError(error, userId, false)
        break
      }
      if (!next) break
      emitStatus("syncing", { userId })
      try {
        await syncAll(userId, next.state, next.operations)
        const latest = readPending(userId)
        // Do not remove a newer snapshot queued while this request was running.
        if (latest?.updatedAt === next.updatedAt) {
          writePending(userId, null)
          emitStatus("synced", { userId })
          break
        }
        // A newer snapshot arrived in flight. Loop and send that latest state.
      } catch (error) {
        let attempts = 1
        try {
          const pending = readPending(userId)
          if (pending) {
            pending.attempts += 1
            attempts = pending.attempts
            writePending(userId, pending)
          }
        } catch (queueError) {
          emitError(queueError, userId, false)
        }
        const retryable = !isPermanentSyncError(error)
        emitError(error, userId, true, retryable)
        if (!retryable) {
          blockedSyncUsers.add(userId)
          break
        }
        const delay = Math.min(60_000, 1_000 * 2 ** Math.min(attempts, 6))
        const existing = retryTimers.get(userId)
        if (existing) clearTimeout(existing)
        retryTimers.set(userId, setTimeout(() => {
          retryTimers.delete(userId)
          scheduleDrain(userId, 0)
        }, delay))
        break
      }
    }
  })().finally(() => {
    drains.delete(userId)
  })
  drains.set(userId, task)
  return task
}

/** Persist the newest full state before attempting any network request. */
export async function enqueueProgressSync(
  userId: string,
  state: AppState,
  operations: ProgressSyncOperations = {},
): Promise<void> {
  try {
    const previous = readPending(userId)
    const snapshot = JSON.parse(JSON.stringify(state)) as AppState
    const previousOperations = previous?.operations ?? {}
    const currentMistakeIds = new Set((snapshot.mistakes ?? []).map((item) => item.questionId))
    const currentOutcomeIds = new Set((snapshot.outcomes ?? []).map((item) => item.id))
    const mergedOperations: ProgressSyncOperations = {
      deleteMistakeIds: [...new Set([
        ...(previousOperations.deleteMistakeIds ?? []),
        ...(operations.deleteMistakeIds ?? []),
      ])].filter((id) => !currentMistakeIds.has(id)),
      deleteOutcomeIds: [...new Set([
        ...(previousOperations.deleteOutcomeIds ?? []),
        ...(operations.deleteOutcomeIds ?? []),
      ])].filter((id) => !currentOutcomeIds.has(id)),
      clearAllMistakes: Boolean(previousOperations.clearAllMistakes || operations.clearAllMistakes),
      clearAllOutcomes: Boolean(previousOperations.clearAllOutcomes || operations.clearAllOutcomes),
    }
    const pending: PendingSnapshot = {
      userId,
      state: snapshot,
      updatedAt: Date.now() + Math.random(),
      attempts: previous?.attempts ?? 0,
      operations: mergedOperations,
    }
    writePending(userId, pending)
    emitStatus("pending", { userId })
    scheduleDrain(userId)
  } catch (error) {
    emitError(error, userId, false)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

export function getPendingProgressSnapshot(userId: string): AppState | null {
  try {
    return readPending(userId)?.state ?? null
  } catch {
    return null
  }
}

export function hasPendingProgressSync(userId: string): boolean {
  try {
    return Boolean(readPending(userId))
  } catch {
    // Treat unreadable queue storage as pending; never overwrite the local state
    // with a potentially stale remote snapshot in this condition.
    return true
  }
}

/** Explicit retry used by the toast and online/visibility recovery hooks. */
export async function retryProgressSync(userId: string, options: { force?: boolean } = {}): Promise<void> {
  try {
    if (options.force !== false) blockedSyncUsers.delete(userId)
    if (blockedSyncUsers.has(userId)) return
    const retryTimer = retryTimers.get(userId)
    if (retryTimer) {
      clearTimeout(retryTimer)
      retryTimers.delete(userId)
    }
    const coalesceTimer = coalesceTimers.get(userId)
    if (coalesceTimer) {
      clearTimeout(coalesceTimer)
      coalesceTimers.delete(userId)
    }
    const pending = readPending(userId)
    if (!pending) return
    pending.updatedAt = Date.now() + Math.random()
    writePending(userId, pending)
    await drain(userId)
  } catch (error) {
    emitError(error, userId, false)
  }
}

/** Remove queued personal data only after the server confirms account deletion. */
export function clearPendingProgressSync(userId: string): void {
  try {
    writePending(userId, null)
  } catch (error) {
    emitError(error, userId, false)
  }

  // Account erasure must also remove this user's recoverable V1 queue entry;
  // otherwise a later sign-in in the same browser could re-import deleted data.
  try {
    const legacyRaw = window.localStorage.getItem(LEGACY_QUEUE_KEY)
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as Record<string, PendingSnapshot>
      if (Object.prototype.hasOwnProperty.call(legacy, userId)) {
        delete legacy[userId]
        if (Object.keys(legacy).length) window.localStorage.setItem(LEGACY_QUEUE_KEY, JSON.stringify(legacy))
        else window.localStorage.removeItem(LEGACY_QUEUE_KEY)
      }
    }
  } catch (error) {
    emitError(error, userId, false)
  }

  const retryTimer = retryTimers.get(userId)
  if (retryTimer) clearTimeout(retryTimer)
  retryTimers.delete(userId)
  blockedSyncUsers.delete(userId)
  const coalesceTimer = coalesceTimers.get(userId)
  if (coalesceTimer) clearTimeout(coalesceTimer)
  coalesceTimers.delete(userId)
}

export function installProgressSyncRecovery(getUserId: () => string | null): () => void {
  const retry = () => {
    const userId = getUserId()
    // Focus/online recovery only retries transient failures. Permanent database
    // permission errors require an explicit user retry after the underlying
    // deployment/configuration issue has been corrected.
    if (navigator.onLine && userId && !blockedSyncUsers.has(userId)) scheduleDrain(userId, 0)
  }
  window.addEventListener("online", retry)
  window.addEventListener("focus", retry)
  const interval = window.setInterval(retry, 30_000)
  return () => {
    window.removeEventListener("online", retry)
    window.removeEventListener("focus", retry)
    window.clearInterval(interval)
  }
}

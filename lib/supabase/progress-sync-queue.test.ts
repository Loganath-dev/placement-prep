import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { AppState } from "@/lib/types"

vi.mock("@/lib/supabase/db", () => ({ syncAll: vi.fn() }))
import { syncAll } from "@/lib/supabase/db"
import {
  clearPendingProgressSync,
  enqueueProgressSync,
  getPendingProgressSnapshot,
  hasPendingProgressSync,
  retryProgressSync,
} from "@/lib/supabase/progress-sync-queue"

const state = (xp: number) => ({ xp } as AppState)

class TestWindow extends EventTarget {
  values = new Map<string, string>()
  storage = {
    getItem: (key: string) => this.values.get(key) ?? null,
    setItem: (key: string, value: string) => this.values.set(key, String(value)),
    removeItem: (key: string) => this.values.delete(key),
  }
  setInterval = () => 1
  clearInterval = () => undefined
}

let testWindow: TestWindow

beforeEach(() => {
  vi.useFakeTimers()
  testWindow = new TestWindow()
  vi.stubGlobal("window", Object.assign(testWindow, { localStorage: testWindow.storage }))
  vi.stubGlobal("navigator", { onLine: true })
  vi.mocked(syncAll).mockReset()
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("durable progress queue", () => {
  it("keeps account snapshots isolated instead of rewriting one shared queue object", async () => {
    await enqueueProgressSync("account-a", state(10))
    await enqueueProgressSync("account-b", state(20))

    expect(getPendingProgressSnapshot("account-a")?.xp).toBe(10)
    expect(getPendingProgressSnapshot("account-b")?.xp).toBe(20)
    expect(testWindow.storage.getItem("studybench.progress-sync-queue.v2:account-a")).toBeTruthy()
    expect(testWindow.storage.getItem("studybench.progress-sync-queue.v2:account-b")).toBeTruthy()
  })

  it("removes only the deleted account's legacy queue data after account erasure", () => {
    testWindow.storage.setItem("studybench.progress-sync-queue.v1", JSON.stringify({
      "deleted-user": { userId: "deleted-user", state: state(1), updatedAt: 1, attempts: 0 },
      "other-user": { userId: "other-user", state: state(2), updatedAt: 2, attempts: 0 },
    }))
    testWindow.storage.setItem("studybench.progress-sync-queue.v2:deleted-user", JSON.stringify({
      userId: "deleted-user", state: state(1), updatedAt: 1, attempts: 0,
    }))

    clearPendingProgressSync("deleted-user")

    expect(testWindow.storage.getItem("studybench.progress-sync-queue.v2:deleted-user")).toBeNull()
    expect(JSON.parse(testWindow.storage.getItem("studybench.progress-sync-queue.v1") ?? "{}")).toHaveProperty("other-user")
    expect(JSON.parse(testWindow.storage.getItem("studybench.progress-sync-queue.v1") ?? "{}")).not.toHaveProperty("deleted-user")
  })

  it("migrates a pending v1 account snapshot without deleting the legacy recovery copy", async () => {
    testWindow.storage.setItem("studybench.progress-sync-queue.v1", JSON.stringify({
      "legacy-user": {
        userId: "legacy-user",
        state: state(42),
        updatedAt: 123,
        attempts: 2,
      },
    }))

    expect(getPendingProgressSnapshot("legacy-user")?.xp).toBe(42)
    expect(testWindow.storage.getItem("studybench.progress-sync-queue.v2:legacy-user")).toBeTruthy()
    expect(testWindow.storage.getItem("studybench.progress-sync-queue.v1")).toBeTruthy()
  })

  it("removes a queued snapshot only after syncAll acknowledges it", async () => {
    vi.mocked(syncAll).mockResolvedValue(undefined)
    await enqueueProgressSync("student", state(99))

    expect(hasPendingProgressSync("student")).toBe(true)
    await retryProgressSync("student")

    expect(syncAll).toHaveBeenCalledWith("student", expect.objectContaining({ xp: 99 }), {
      deleteMistakeIds: [], deleteOutcomeIds: [], clearAllMistakes: false, clearAllOutcomes: false,
    })
    expect(hasPendingProgressSync("student")).toBe(false)
  })

  it("sends a newer snapshot queued while an older sync is in flight", async () => {
    let releaseFirst!: () => void
    vi.mocked(syncAll)
      .mockImplementationOnce(() => new Promise<void>((resolve) => { releaseFirst = resolve }))
      .mockResolvedValueOnce(undefined)

    await enqueueProgressSync("student", state(10))
    const draining = retryProgressSync("student")
    await Promise.resolve()
    expect(syncAll).toHaveBeenCalledTimes(1)

    await enqueueProgressSync("student", state(20))
    releaseFirst()
    await draining

    expect(syncAll).toHaveBeenNthCalledWith(1, "student", expect.objectContaining({ xp: 10 }), expect.any(Object))
    expect(syncAll).toHaveBeenNthCalledWith(2, "student", expect.objectContaining({ xp: 20 }), expect.any(Object))
    expect(hasPendingProgressSync("student")).toBe(false)
  })

  it("retains the snapshot and explicit deletion operations when the server sync fails", async () => {
    vi.mocked(syncAll).mockRejectedValue(new Error("temporary network failure"))
    await enqueueProgressSync("student", state(77), { deleteMistakeIds: ["q-old"], deleteOutcomeIds: ["drive-old"] })

    await retryProgressSync("student")

    expect(hasPendingProgressSync("student")).toBe(true)
    expect(getPendingProgressSnapshot("student")?.xp).toBe(77)
    expect(vi.mocked(syncAll)).toHaveBeenLastCalledWith("student", expect.objectContaining({ xp: 77 }), {
      deleteMistakeIds: ["q-old"],
      deleteOutcomeIds: ["drive-old"],
      clearAllMistakes: false,
      clearAllOutcomes: false,
    })
  })

  it("does not automatically retry permanent database permission failures", async () => {
    vi.mocked(syncAll).mockRejectedValue(Object.assign(new Error("permission denied for table company_progress"), { code: "42501", status: 403 }))
    await enqueueProgressSync("student", state(88))

    await retryProgressSync("student", { force: false })
    expect(syncAll).toHaveBeenCalledTimes(1)
    expect(hasPendingProgressSync("student")).toBe(true)

    // Focus/online recovery uses force:false and must respect the permanent block.
    await retryProgressSync("student", { force: false })
    expect(syncAll).toHaveBeenCalledTimes(1)

    // An explicit user retry is allowed after the underlying permission issue is fixed.
    vi.mocked(syncAll).mockResolvedValueOnce(undefined)
    await retryProgressSync("student")
    expect(syncAll).toHaveBeenCalledTimes(2)
    expect(hasPendingProgressSync("student")).toBe(false)
  })

  it("preserves explicit delete intents across newer snapshots until acknowledgement", async () => {
    await enqueueProgressSync("student", state(10), { deleteMistakeIds: ["q-1"], clearAllMistakes: true })
    await enqueueProgressSync("student", state(11), { deleteOutcomeIds: ["drive-1"] })
    vi.mocked(syncAll).mockResolvedValue(undefined)

    await retryProgressSync("student")

    expect(vi.mocked(syncAll)).toHaveBeenLastCalledWith("student", expect.objectContaining({ xp: 11 }), {
      deleteMistakeIds: ["q-1"],
      deleteOutcomeIds: ["drive-1"],
      clearAllMistakes: true,
      clearAllOutcomes: false,
    })
    expect(hasPendingProgressSync("student")).toBe(false)
  })

  it("does not keep a mistake deletion if that question is present again in the latest snapshot", async () => {
    const withMistake = { ...state(12), mistakes: [{ questionId: "q-1" }] } as unknown as AppState
    await enqueueProgressSync("student", state(10), { deleteMistakeIds: ["q-1"] })
    await enqueueProgressSync("student", withMistake)
    vi.mocked(syncAll).mockResolvedValue(undefined)

    await retryProgressSync("student")

    expect(vi.mocked(syncAll)).toHaveBeenLastCalledWith("student", expect.objectContaining({ xp: 12 }), {
      deleteMistakeIds: [],
      deleteOutcomeIds: [],
      clearAllMistakes: false,
      clearAllOutcomes: false,
    })
  })

  it("does not infer remote deletions from a bounded snapshot", async () => {
    vi.mocked(syncAll).mockResolvedValue(undefined)
    await enqueueProgressSync("student", { ...state(13), mistakes: [{ questionId: "only-the-latest-local-record" }], outcomes: [] } as unknown as AppState)
    await retryProgressSync("student")

    expect(vi.mocked(syncAll)).toHaveBeenLastCalledWith("student", expect.objectContaining({ xp: 13 }), {
      deleteMistakeIds: [],
      deleteOutcomeIds: [],
      clearAllMistakes: false,
      clearAllOutcomes: false,
    })
  })
})

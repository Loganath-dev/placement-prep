import { afterEach, describe, expect, it, vi } from "vitest"
import { UpstashRestAdapter, type RateLimitAdapter } from "@/lib/rate-limit"

const fallback: RateLimitAdapter = {
  check: vi.fn(async () => ({ allowed: true, remaining: 3 })),
}

const originalNodeEnv = process.env.NODE_ENV

afterEach(() => {
  vi.unstubAllGlobals()
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV
  else process.env.NODE_ENV = originalNodeEnv
  vi.restoreAllMocks()
})

describe("UpstashRestAdapter", () => {
  it("uses one atomic Redis EVAL command for prune, count, add and expiry", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => ({
      ok: true,
      json: async () => [{ result: [1, 2] }],
    }))
    vi.stubGlobal("fetch", fetchMock)

    const adapter = new UpstashRestAdapter("https://redis.example", "token", fallback)
    await expect(adapter.check("order:user-1", 5, 60_000)).resolves.toEqual({
      allowed: true,
      remaining: 3,
    })

    expect(fetchMock).toHaveBeenCalledOnce()
    const init = fetchMock.mock.calls[0][1]
    const commands = JSON.parse(String(init?.body))
    expect(commands).toHaveLength(1)
    expect(commands[0][0]).toBe("EVAL")
    expect(commands[0][1]).toContain("ZREMRANGEBYSCORE")
    expect(commands[0][1]).toContain("ZCARD")
    expect(commands[0][1]).toContain("ZADD")
    expect(commands[0][1]).toContain("PEXPIRE")
    expect(commands[0][3]).toBe("order:user-1")
    expect(init?.signal).toBeDefined()
  })

  it("returns the limit-exceeded result without allowing another hit", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => [{ result: [0, 5] }],
    })))
    const adapter = new UpstashRestAdapter("https://redis.example", "token", fallback)
    await expect(adapter.check("order:user-1", 5, 60_000)).resolves.toEqual({
      allowed: false,
      remaining: 0,
    })
  })

  it("fails closed in production when Redis is unavailable", async () => {
    process.env.NODE_ENV = "production"
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("network unavailable") }))
    const adapter = new UpstashRestAdapter("https://redis.example", "token", fallback)
    await expect(adapter.check("order:user-1", 5, 60_000)).rejects.toThrow(
      "Global rate limiter unavailable; request rejected",
    )
    expect(fallback.check).not.toHaveBeenCalled()
  })

  it("uses the in-memory fallback only outside production", async () => {
    process.env.NODE_ENV = "test"
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("network unavailable") }))
    const adapter = new UpstashRestAdapter("https://redis.example", "token", fallback)
    await expect(adapter.check("order:user-1", 5, 60_000)).resolves.toEqual({
      allowed: true,
      remaining: 3,
    })
    expect(fallback.check).toHaveBeenCalledWith("order:user-1", 5, 60_000)
  })

  it("rejects an invalid Redis response in production", async () => {
    process.env.NODE_ENV = "production"
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => [{ result: "not-an-array" }],
    })))
    const adapter = new UpstashRestAdapter("https://redis.example", "token", fallback)
    await expect(adapter.check("order:user-1", 5, 60_000)).rejects.toThrow(
      "Global rate limiter unavailable; request rejected",
    )
  })
})

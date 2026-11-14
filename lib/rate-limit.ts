/**
 * Shared sliding-window rate limiter.
 *
 * Production requires Upstash Redis. The Lua script runs atomically, so two
 * server instances cannot both pass the limit between separate count/add calls.
 * The in-memory adapter is local-development-only; production failures fail closed.
 */

export interface RateLimitResult {
  allowed: boolean
  remaining: number
}

export interface RateLimitAdapter {
  check(key: string, limit: number, windowMs: number): RateLimitResult | Promise<RateLimitResult>
}

class InMemoryAdapter implements RateLimitAdapter {
  private readonly buckets = new Map<string, number[]>()
  private callCount = 0

  check(key: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now()
    if (++this.callCount % 500 === 0) {
      for (const [bucketKey, hits] of this.buckets) {
        if (hits.every((timestamp) => now - timestamp >= windowMs)) this.buckets.delete(bucketKey)
      }
    }
    const hits = (this.buckets.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs)
    if (hits.length >= limit) return { allowed: false, remaining: 0 }
    hits.push(now)
    this.buckets.set(key, hits)
    return { allowed: true, remaining: limit - hits.length }
  }
}

const SLIDING_WINDOW_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local member = ARGV[4]

redis.call('ZREMRANGEBYSCORE', key, 0, now - windowMs)
local count = redis.call('ZCARD', key)
if count >= limit then
  redis.call('PEXPIRE', key, windowMs)
  return {0, count}
end

redis.call('ZADD', key, now, member)
redis.call('PEXPIRE', key, windowMs)
return {1, count + 1}
`

/** Exported to support direct tests of the Redis adapter without live credentials. */
export class UpstashRestAdapter implements RateLimitAdapter {
  constructor(
    private readonly url: string,
    private readonly token: string,
    private readonly fallback: RateLimitAdapter,
  ) {}

  async check(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now()
    const member = `${now}-${crypto.randomUUID()}`

    try {
      const response = await fetch(`${this.url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([[
          "EVAL",
          SLIDING_WINDOW_SCRIPT,
          "1",
          key,
          String(now),
          String(windowMs),
          String(limit),
          member,
        ]]),
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      })
      if (!response.ok) throw new Error(`Upstash responded ${response.status}`)

      const payload = await response.json() as ({ result?: unknown; error?: string }[])
      const command = payload[0]
      if (!command || command.error != null || !Array.isArray(command.result)) {
        throw new Error(command?.error ?? "Invalid Upstash rate-limit response")
      }

      const [allowedValue, countValue] = command.result
      const count = Number(countValue)
      if (!Number.isFinite(count) || (Number(allowedValue) !== 0 && Number(allowedValue) !== 1)) {
        throw new Error("Invalid Upstash rate-limit result")
      }
      return { allowed: Number(allowedValue) === 1, remaining: Math.max(0, limit - count) }
    } catch (error) {
      console.error("[rate-limit] Upstash check failed:", error)
      if (process.env.NODE_ENV === "production") {
        throw new Error("Global rate limiter unavailable; request rejected")
      }
      return this.fallback.check(key, limit, windowMs)
    }
  }
}

const inMemory = new InMemoryAdapter()
let adapter: RateLimitAdapter | null = null

function getAdapter(): RateLimitAdapter {
  if (adapter) return adapter
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (process.env.NODE_ENV === "production" && (!url || !token)) {
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required in production")
  }
  adapter = url && token ? new UpstashRestAdapter(url, token, inMemory) : inMemory
  return adapter
}

/** Override the adapter (tests, or a custom backend). */
export function setRateLimitAdapter(value: RateLimitAdapter): void {
  adapter = value
}

/**
 * Record a hit for `key` and report whether it is within `limit` per `windowMs`.
 * Async because the production adapter performs a network round-trip.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  return getAdapter().check(key, limit, windowMs)
}

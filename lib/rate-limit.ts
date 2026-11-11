/**
 * Pluggable sliding-window rate limiter.
 *
 * Production requires a shared Upstash Redis backend. The per-instance memory
 * adapter is for local development only; Redis failures fail closed in
 * production rather than silently weakening limits across server instances.
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

class UpstashRestAdapter implements RateLimitAdapter {
  constructor(
    private readonly url: string,
    private readonly token: string,
    private readonly fallback: RateLimitAdapter,
  ) {}

  async check(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now()
    const member = `${now}-${Math.random().toString(36).slice(2)}`
    const commands = [
      ["ZREMRANGEBYSCORE", key, "0", String(now - windowMs)],
      ["ZADD", key, String(now), member],
      ["ZCARD", key],
      ["PEXPIRE", key, String(windowMs)],
    ]

    try {
      const response = await fetch(`${this.url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commands),
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      })
      if (!response.ok) throw new Error(`Upstash responded ${response.status}`)

      const payload = await response.json() as ({ result?: unknown; error?: string }[])
      const zcard = payload[2]
      if (!zcard || zcard.error != null) throw new Error(zcard?.error ?? "Upstash pipeline error")
      const count = Number(zcard.result ?? 0)
      return { allowed: count <= limit, remaining: Math.max(0, limit - count) }
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

export function setRateLimitAdapter(value: RateLimitAdapter): void {
  adapter = value
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  return getAdapter().check(key, limit, windowMs)
}

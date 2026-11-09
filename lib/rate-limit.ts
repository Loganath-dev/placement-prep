/**
 * Pluggable sliding-window rate limiter.
 *
 * Two adapters ship here and the right one is selected automatically:
 *
 *   • UpstashRestAdapter — used when UPSTASH_REDIS_REST_URL and
 *     UPSTASH_REDIS_REST_TOKEN are set. State lives in Redis, so the limit holds
 *     GLOBALLY across every Vercel edge/serverless instance. Talks to Upstash
 *     over its REST API with plain fetch — no extra npm dependency, works on the
 *     edge runtime.
 *
 *   • InMemoryAdapter — fallback when those env vars are absent (local dev,
 *     preview). Per-instance only, so it is best-effort: it blunts a burst that
 *     lands on one warm instance but cannot enforce a global limit. Fine for dev;
 *     set the Upstash vars in production to make the limit real.
 *
 * Usage (handlers are already async):
 *   const { allowed } = await rateLimit(`order:${user.id}`, 5, 60 * 60 * 1000)
 *   if (!allowed) return new Response("Too many requests", { status: 429 })
 */

export interface RateLimitResult {
  allowed: boolean
  remaining: number
}

export interface RateLimitAdapter {
  check(key: string, limit: number, windowMs: number): RateLimitResult | Promise<RateLimitResult>
}

// ── In-memory adapter (fallback) ──────────────────────────────────────────────

class InMemoryAdapter implements RateLimitAdapter {
  private readonly buckets = new Map<string, number[]>()
  private callCount = 0

  check(key: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now()

    // Prune stale buckets occasionally so memory can't grow unbounded.
    if (++this.callCount % 500 === 0) {
      for (const [k, hits] of this.buckets) {
        if (hits.every((t) => now - t >= windowMs)) this.buckets.delete(k)
      }
    }

    const hits = (this.buckets.get(key) ?? []).filter((t) => now - t < windowMs)
    if (hits.length >= limit) return { allowed: false, remaining: 0 }
    hits.push(now)
    this.buckets.set(key, hits)
    return { allowed: true, remaining: limit - hits.length }
  }
}

// ── Upstash REST adapter (production) ─────────────────────────────────────────

class UpstashRestAdapter implements RateLimitAdapter {
  constructor(
    private readonly url: string,
    private readonly token: string,
    private readonly fallback: RateLimitAdapter,
  ) {}

  async check(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now()
    const member = `${now}-${Math.random().toString(36).slice(2)}`
    // One pipelined round-trip implements a true sliding window:
    //   drop hits older than the window, record this hit, count what's left,
    //   and let the key expire once the window passes so it self-cleans.
    const commands = [
      ["ZREMRANGEBYSCORE", key, "0", String(now - windowMs)],
      ["ZADD", key, String(now), member],
      ["ZCARD", key],
      ["PEXPIRE", key, String(windowMs)],
    ]

    try {
      const res = await fetch(`${this.url}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commands),
        cache: "no-store",
      })
      if (!res.ok) throw new Error(`Upstash ${res.status}`)

      const payload = (await res.json()) as ({ result?: unknown; error?: string }[])
      const zcard = payload[2]
      if (!zcard || zcard.error != null) throw new Error(zcard?.error ?? "Upstash pipeline error")

      const count = Number(zcard.result ?? 0)
      // ZADD already recorded this hit, so `count` includes the current request.
      return { allowed: count <= limit, remaining: Math.max(0, limit - count) }
    } catch (err) {
      // Redis unreachable: fall back to per-instance limiting rather than either
      // blocking a paying user or letting the request through unchecked.
      console.error("[rate-limit] Upstash check failed, using in-memory fallback:", err)
      return this.fallback.check(key, limit, windowMs)
    }
  }
}

// ── Adapter selection ─────────────────────────────────────────────────────────

const inMemory = new InMemoryAdapter()

let _adapter: RateLimitAdapter | null = null

function getAdapter(): RateLimitAdapter {
  if (_adapter) return _adapter
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  _adapter = url && token ? new UpstashRestAdapter(url, token, inMemory) : inMemory
  return _adapter
}

/** Override the adapter (tests, or a custom backend). */
export function setRateLimitAdapter(adapter: RateLimitAdapter): void {
  _adapter = adapter
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

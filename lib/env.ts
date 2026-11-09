/**
 * SERVER-ONLY environment access + boot validation. No external dependency.
 *
 * Two classes of variable:
 *   • CORE (required) — the app cannot function without them. Validated at boot
 *     in instrumentation.ts: a missing core var crashes the server in production
 *     (fail fast) and warns loudly in development.
 *   • FEATURE (optional) — payments / email / rate-limit. Absent means the
 *     feature is disabled, not that the app is broken, so these are validated
 *     lazily at their call sites via the typed getters below. This preserves the
 *     existing graceful degradation (a preview deploy can run without Razorpay).
 *
 * Do NOT import this module from client components — it reads secret values.
 */

export interface EnvVarSpec {
  name: string
  required: boolean
  /** Inlined into the client bundle (NEXT_PUBLIC_*). */
  isPublic: boolean
  feature: string
}

export const ENV_SPEC: readonly EnvVarSpec[] = [
  { name: "NEXT_PUBLIC_SUPABASE_URL", required: true, isPublic: true, feature: "core" },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true, isPublic: true, feature: "core" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", required: true, isPublic: false, feature: "core (server)" },
  { name: "RAZORPAY_KEY_ID", required: false, isPublic: false, feature: "payments" },
  { name: "RAZORPAY_KEY_SECRET", required: false, isPublic: false, feature: "payments" },
  { name: "RAZORPAY_WEBHOOK_SECRET", required: false, isPublic: false, feature: "payments (webhook)" },
  { name: "RESEND_API_KEY", required: false, isPublic: false, feature: "email" },
  { name: "RESEND_FROM_EMAIL", required: false, isPublic: false, feature: "email" },
  { name: "UPSTASH_REDIS_REST_URL", required: false, isPublic: false, feature: "rate-limit" },
  { name: "UPSTASH_REDIS_REST_TOKEN", required: false, isPublic: false, feature: "rate-limit" },
] as const

/** A present, non-empty env value, or undefined. */
function read(name: string): string | undefined {
  const v = process.env[name]
  return v && v.trim().length > 0 ? v : undefined
}

export class EnvError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "EnvError"
  }
}

export interface EnvReport {
  ok: boolean
  missingRequired: string[]
  /** feature → list of partially/unconfigured vars, for an informational warning. */
  unconfiguredFeatures: Record<string, string[]>
}

/**
 * Inspect the current environment. Pure — never throws — so the caller decides
 * whether a gap is fatal (production boot) or a warning (development / optional).
 */
export function inspectEnv(): EnvReport {
  const missingRequired: string[] = []
  const unconfiguredFeatures: Record<string, string[]> = {}

  for (const spec of ENV_SPEC) {
    if (read(spec.name)) continue
    if (spec.required) {
      missingRequired.push(spec.name)
    } else {
      ;(unconfiguredFeatures[spec.feature] ??= []).push(spec.name)
    }
  }

  return {
    ok: missingRequired.length === 0,
    missingRequired,
    unconfiguredFeatures,
  }
}

// ── Typed feature getters (lazy, call-site validated) ─────────────────────────

export interface RazorpayEnv {
  keyId: string
  keySecret: string
  webhookSecret?: string
}

/** Razorpay config, or null when payments are not configured (routes 500). */
export function getRazorpayEnvOrNull(): RazorpayEnv | null {
  const keyId = read("RAZORPAY_KEY_ID")
  const keySecret = read("RAZORPAY_KEY_SECRET")
  if (!keyId || !keySecret) return null
  return { keyId, keySecret, webhookSecret: read("RAZORPAY_WEBHOOK_SECRET") }
}

/** Razorpay webhook secret, or null when the webhook is not configured. */
export function getRazorpayWebhookSecretOrNull(): string | null {
  return read("RAZORPAY_WEBHOOK_SECRET") ?? null
}

export interface ResendEnv {
  apiKey: string
  fromEmail: string
}

/** Resend config, or null when transactional email is not configured. */
export function getResendEnvOrNull(): ResendEnv | null {
  const apiKey = read("RESEND_API_KEY")
  const fromEmail = read("RESEND_FROM_EMAIL")
  if (!apiKey || !fromEmail) return null
  return { apiKey, fromEmail }
}

/** Supabase service-role key (server-only). Throws if absent — callers that
 *  need it (entitlement grant, account erasure) cannot operate without it. */
export function getServiceRoleKey(): string {
  const key = read("SUPABASE_SERVICE_ROLE_KEY")
  if (!key) {
    throw new EnvError("SUPABASE_SERVICE_ROLE_KEY is not set — required for server-side admin operations.")
  }
  return key
}

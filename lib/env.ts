/**
 * SERVER-ONLY environment access + boot validation. No external dependency.
 *
 * Core Supabase credentials are required. Global Upstash rate limiting is also
 * required in production; an in-memory fallback is permitted only in local
 * development and preview environments.
 */

export interface EnvVarSpec {
  name: string
  required: boolean
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
  { name: "STUDYBENCH_ADMIN_EMAILS", required: false, isPublic: false, feature: "admin access" },
  { name: "STUDYBENCH_CREATOR_EMAILS", required: false, isPublic: false, feature: "creator access" },
] as const

function read(name: string): string | undefined {
  const value = process.env[name]
  return value && value.trim().length > 0 ? value : undefined
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
  unconfiguredFeatures: Record<string, string[]>
}

export function inspectEnv(): EnvReport {
  const missingRequired: string[] = []
  const unconfiguredFeatures: Record<string, string[]> = {}

  for (const spec of ENV_SPEC) {
    if (read(spec.name)) continue
    if (spec.required) missingRequired.push(spec.name)
    else (unconfiguredFeatures[spec.feature] ??= []).push(spec.name)
  }

  return { ok: missingRequired.length === 0, missingRequired, unconfiguredFeatures }
}

export interface RazorpayEnv {
  keyId: string
  keySecret: string
  webhookSecret?: string
}

export function getRazorpayEnvOrNull(): RazorpayEnv | null {
  const keyId = read("RAZORPAY_KEY_ID")
  const keySecret = read("RAZORPAY_KEY_SECRET")
  if (!keyId || !keySecret) return null
  return { keyId, keySecret, webhookSecret: read("RAZORPAY_WEBHOOK_SECRET") }
}

export function getRazorpayWebhookSecretOrNull(): string | null {
  return read("RAZORPAY_WEBHOOK_SECRET") ?? null
}

export interface ResendEnv {
  apiKey: string
  fromEmail: string
}

export function getResendEnvOrNull(): ResendEnv | null {
  const apiKey = read("RESEND_API_KEY")
  const fromEmail = read("RESEND_FROM_EMAIL")
  if (!apiKey || !fromEmail) return null
  return { apiKey, fromEmail }
}

export function getServiceRoleKey(): string {
  const key = read("SUPABASE_SERVICE_ROLE_KEY")
  if (!key) throw new EnvError("SUPABASE_SERVICE_ROLE_KEY is not set — required for server-side admin operations.")
  return key
}

import "server-only"
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"

export type RewardSubmissionClaims = {
  userId: string
  kind: "daily" | "weekly" | "mock"
  subjectId: string
  periodKey?: string
  timeZone?: string
  companyId: string
  questions: Array<{ id: string; answer: number; optionCount: number; acceptedAnswers?: string[] }>
  issuedAt: number
}

function key() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!value) throw new Error("Reward submission signing secret is not configured.")
  return createHash("sha256").update(value).digest()
}

export function signRewardSubmission(claims: RewardSubmissionClaims) {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key(), iv)
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(claims), "utf8"), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url")
}

export function verifyRewardSubmission(token: unknown, userId: string): RewardSubmissionClaims | null {
  if (typeof token !== "string" || token.length > 20000) return null
  try {
    const packed = Buffer.from(token, "base64url")
    if (packed.length < 29) return null
    const iv = packed.subarray(0, 12)
    const tag = packed.subarray(12, 28)
    const encrypted = packed.subarray(28)
    const decipher = createDecipheriv("aes-256-gcm", key(), iv)
    decipher.setAuthTag(tag)
    const claims = JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8")) as RewardSubmissionClaims
    if (claims.userId !== userId || !["daily", "weekly", "mock"].includes(claims.kind)) return null
    if (!Array.isArray(claims.questions) || !claims.questions.length || claims.questions.length > 120) return null
    if (Date.now() - claims.issuedAt > 4 * 60 * 60 * 1000 || claims.issuedAt > Date.now() + 60_000) return null
    return claims
  } catch { return null }
}

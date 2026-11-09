import type { CompanyId, Difficulty, SectionId } from "@/lib/types"
import seed from "@/lib/data/content-seed.json"

/**
 * Canonical authored seed for the `content_questions` datastore (migration 0010).
 *
 * The data lives in content-seed.json (single source of truth); this module adds
 * types for the app/tests, and scripts/seed-content.mjs reads the same JSON to
 * upsert into Supabase. `/api/questions` then serves these gated by entitlement.
 *
 * These are original, hand-written questions with per-option teaching rationale
 * (`optionNotes`) — the flagship quality bar. A genuine starter SEED that proves
 * the server-served, tier-gated content path end-to-end (not a full bank).
 * `tier: "premium"` rows are never sent to a free client — they are served only
 * through the requirePremium path, so this content truly sits behind the paywall
 * rather than in the JS bundle.
 */
export interface SeedQuestion {
  id: string
  section: SectionId
  companyId?: CompanyId
  topic: string
  difficulty: Difficulty
  prompt: string
  options: string[]
  answer: number
  explanation: string
  /** Parallel to options: why each choice is right/wrong. */
  optionNotes: string[]
  tier: "free" | "premium"
}

export const CONTENT_SEED = seed as SeedQuestion[]

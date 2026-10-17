/**
 * Lightweight analytics client for StudyBench.
 *
 * Inserts rows into `analytics_events` using the browser (anon + RLS) Supabase
 * client so no extra network dependency is required. All calls are fire-and-forget:
 * a tracking failure never blocks the user's action.
 *
 * Usage:
 *   import { track } from "@/lib/analytics"
 *   track("quiz_complete", { company: "tcs", score: 85, passed: true })
 *
 * Event catalogue (keep in sync with admin/metrics page):
 *   marketing_cta_click    — public-site CTA clicked
 *   signup                 — new user account created
 *   onboarding_complete    — user finished onboarding
 *   chapter_start          — user opened a chapter
 *   quiz_attempt           — user submitted a chapter quiz
 *   mock_complete          — user finished a mock test
 *   daily_complete         — user finished a daily challenge category
 *   premium_upgrade        — user successfully activated premium
 *   share_pri              — user clicked "Share my PRI"
 *   seo_page_view          — public /prep page loaded (server-side)
 *   account_delete         — user deleted their account
 *   drive_outcome_logged   — user recorded a real placement-drive outcome
 */

type EventName =
  | "marketing_cta_click"
  | "signup"
  | "onboarding_complete"
  | "chapter_start"
  | "quiz_attempt"
  | "mock_complete"
  | "daily_complete"
  | "premium_upgrade"
  | "share_pri"
  | "seo_page_view"
  | "account_delete"
  | "drive_outcome_logged"

type Properties = Record<string, string | number | boolean | null | undefined>

let _userId: string | null = null

/** Call once on auth state resolution (in AppStoreProvider) to bind the user. */
export function identifyAnalyticsUser(uid: string | null) {
  _userId = uid
}

/**
 * Fire-and-forget analytics event.
 * Never throws — a broken analytics call must never surface to the user.
 */
export function track(event: EventName, properties?: Properties): void {
  const uid = _userId
  // Skip in SSR (no window means no Supabase browser client).
  if (typeof window === "undefined") return

  // Lazy import to avoid pulling supabase into the initial bundle unnecessarily.
  import("@/lib/supabase/client").then(({ createClient }) => {
    const row: Record<string, unknown> = {
      event,
      properties: properties ?? {},
    }
    if (uid) row.user_id = uid

    createClient()
      .from("analytics_events")
      .insert(row)
      .then(({ error }: { error: { message: string } | null }) => {
        if (error) {
          // Non-critical: log but do not surface.
          console.debug("[analytics] insert failed:", event, error.message)
        }
      })
  }).catch(() => {
    // Module load failure — analytics silently dropped.
  })
}

/**
 * Server-side analytics event (for SEO page views and API routes).
 * Uses the admin client so it can write even without a user session.
 */
export async function trackServer(
  event: EventName,
  properties?: Properties,
  userId?: string,
): Promise<void> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin")
    const row: Record<string, unknown> = {
      event,
      properties: properties ?? {},
    }
    if (userId) row.user_id = userId
    await createAdminClient().from("analytics_events").insert(row)
  } catch {
    // Non-critical: never throw.
  }
}

import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"

import { deriveVerifiedProgress, type ProgressEvent } from "@/lib/learning-progress-events"

const PAGE_SIZE = 500

export async function readVerifiedProgress(userId: string, companyId: string) {
  const admin = createAdminClient()
  const events: ProgressEvent[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await admin
      .from("learning_progress_events")
      .select("id,company_id,section_id,chapter_id,lesson_id,event_type,selected_answers,score_percent,passed,created_at")
      .eq("user_id", userId)
      .eq("company_id", companyId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw error
    const page = (data ?? []) as ProgressEvent[]
    events.push(...page)
    if (page.length < PAGE_SIZE) break
  }
  return deriveVerifiedProgress(events)
}

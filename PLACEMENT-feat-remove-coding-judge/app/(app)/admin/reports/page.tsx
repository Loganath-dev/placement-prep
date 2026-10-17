import { requireAdmin } from "@/lib/admin"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

interface ReportRow {
  question_id: string
  prompt: string
  reason: string | null
  created_at: string
}

interface QuestionReportGroup {
  questionId: string
  prompt: string
  count: number
  reasons: Record<string, number>
  lastReported: string
}

/**
 * Aggregate the student-flagged question queue by question so the most-reported
 * items rise to the top. Service-role read — RLS limits a normal user to their
 * own reports, but the content team needs to see every flag.
 */
async function getReports(): Promise<{ groups: QuestionReportGroup[]; total: number }> {
  const admin = createAdminClient()
  const { data } = await admin
    .from("question_reports")
    .select("question_id, prompt, reason, created_at")
    .order("created_at", { ascending: false })
    .limit(1000)

  const rows = (data ?? []) as ReportRow[]
  const byQuestion = new Map<string, QuestionReportGroup>()

  for (const row of rows) {
    const existing = byQuestion.get(row.question_id)
    const reasonKey = (row.reason ?? "unspecified").trim() || "unspecified"
    if (existing) {
      existing.count += 1
      existing.reasons[reasonKey] = (existing.reasons[reasonKey] ?? 0) + 1
      if (row.created_at > existing.lastReported) existing.lastReported = row.created_at
    } else {
      byQuestion.set(row.question_id, {
        questionId: row.question_id,
        prompt: row.prompt,
        count: 1,
        reasons: { [reasonKey]: 1 },
        lastReported: row.created_at,
      })
    }
  }

  const groups = [...byQuestion.values()].sort(
    (a, b) => b.count - a.count || b.lastReported.localeCompare(a.lastReported),
  )
  return { groups, total: rows.length }
}

export default async function AdminReportsPage() {
  await requireAdmin()
  const { groups, total } = await getReports()

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Question reports</h1>
        <p className="mt-1 text-muted-foreground">
          {total} flag{total === 1 ? "" : "s"} across {groups.length} question
          {groups.length === 1 ? "" : "s"} · most-reported first · admin only
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border border-border p-10 text-center text-muted-foreground">
          No questions have been reported yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {groups.map((g) => (
            <li key={g.questionId} className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <code className="text-xs text-muted-foreground">{g.questionId}</code>
                  <p className="mt-1 line-clamp-3 text-sm font-medium">{g.prompt}</p>
                </div>
                <span className="shrink-0 rounded-full bg-destructive/10 px-2.5 py-1 text-sm font-semibold text-destructive tabular-nums">
                  {g.count}×
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {Object.entries(g.reasons).map(([reason, n]) => (
                  <span
                    key={reason}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {reason} · {n}
                  </span>
                ))}
                <span className="ml-auto text-xs text-muted-foreground">
                  last {new Date(g.lastReported).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function label(value: string) { return value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }

export default async function HistoricalProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const admin = createAdminClient()
  const { data: gamification, error: gamificationError } = await admin.from("user_gamification_legacy_archive")
    .select("legacy_xp,legacy_badges,archived_at,provenance").eq("user_id", user.id).maybeSingle()
  if (gamificationError) throw new Error("Historical reward history is temporarily unavailable.")
  const { data, error } = await admin.from("company_progress_legacy_archive")
    .select("company_id,chapters,mock_scores,archived_at,provenance")
    .eq("user_id", user.id).order("archived_at", { ascending: false })
  if (error) throw new Error("Historical progress is temporarily unavailable.")
  const rows = data ?? []
  const legacyBadges: string[] = Array.isArray(gamification?.legacy_badges) ? gamification.legacy_badges.filter((item: unknown): item is string => typeof item === "string") : []
  const chapters = rows.flatMap((row) => Object.entries((row.chapters ?? {}) as Record<string, Record<string, unknown>>).map(([id, value]) => ({
    company: row.company_id, id, passed: value.passed === true,
    score: typeof value.bestScore === "number" ? value.bestScore : null,
    attempts: typeof value.attempts === "number" ? value.attempts : 0,
    skipped: value.skipped === true,
  })))
  return <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
    <header className="space-y-2"><p className="text-sm font-semibold text-primary">Your learning record</p><h1 className="font-heading text-3xl font-bold">Historical progress</h1><p className="max-w-3xl text-sm text-muted-foreground">This page preserves progress from before verified learning records were introduced. These records are shown for your reference, but are marked unverified and do not unlock lessons, award XP, or grant badges.</p></header>
    <Card><CardHeader><CardTitle>Archived overview</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3"><div><p className="text-2xl font-bold">{chapters.length}</p><p className="text-sm text-muted-foreground">Historical chapter records</p></div><div><p className="text-2xl font-bold">{chapters.filter((c) => c.passed).length}</p><p className="text-sm text-muted-foreground">Previously marked passed</p></div><div><p className="text-2xl font-bold">{rows.reduce((n, row) => n + (Array.isArray(row.mock_scores) ? row.mock_scores.length : 0), 0)}</p><p className="text-sm text-muted-foreground">Archived mock scores</p></div></CardContent></Card>
    <div className="flex items-center gap-2 rounded-lg border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-950"><strong>Historical / unverified</strong><span>— retained, not used for current mastery.</span></div>
    <Card><CardHeader><CardTitle>Previous rewards snapshot</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2"><div><p className="text-2xl font-bold">{gamification?.legacy_xp ?? 0} XP</p><p className="text-sm text-muted-foreground">Previously displayed XP (unverified)</p></div><div><p className="text-2xl font-bold">{legacyBadges.length}</p><p className="text-sm text-muted-foreground">Previously displayed badges (unverified)</p></div></CardContent></Card>
    <Card><CardHeader><CardTitle>Previous chapter records</CardTitle></CardHeader><CardContent>{chapters.length ? <div className="divide-y">{chapters.map((chapter) => <div key={`${chapter.company}:${chapter.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-medium">{label(chapter.id)}</p><p className="text-xs text-muted-foreground">{label(chapter.company)} · {chapter.attempts} recorded attempts{chapter.skipped ? " · previously skipped" : ""}</p></div><div className="text-right"><p className="font-semibold">{chapter.score === null ? "No score" : `${chapter.score}%`}</p><p className="text-xs text-muted-foreground">{chapter.passed ? "Previously marked passed" : "Not marked passed"}</p></div></div>)}</div> : <p className="text-sm text-muted-foreground">No archived chapter progress was found for this account.</p>}</CardContent></Card>
    {legacyBadges.length ? <Card><CardHeader><CardTitle>Previously displayed badges</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{legacyBadges.map((badge) => <span key={badge} className="rounded-full border px-3 py-1 text-xs">{label(badge)} · unverified</span>)}</CardContent></Card> : null}
    <p className="text-xs text-muted-foreground">Archive captured {rows[0]?.archived_at ? new Date(rows[0].archived_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "during the progress migration"}. Your new verified progress is available in the learning dashboard.</p>
  </main>
}

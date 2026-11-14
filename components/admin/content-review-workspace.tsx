"use client"

import * as React from "react"
import { CheckCircle2, ClipboardCheck, Loader2, RefreshCw, Search, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

type Status = "draft" | "reviewed" | "live" | "retired"
type ReviewRecord = {
  id: number
  question_id: string
  question_version: number
  reviewer_id: string
  decision: string
  answer_key_checked: boolean
  explanation_checked: boolean
  source_checked: boolean
  difficulty_checked: boolean
  duplicate_checked: boolean
  notes: string | null
  created_at: string
}

type Question = {
  id: string
  section: string
  company_id: string | null
  topic: string
  difficulty: string
  prompt: string
  options: string[]
  answer: number
  explanation: string
  source_id: string | null
  content_kind: string
  source_url: string | null
  source_checked_at: string | null
  author_id: string | null
  reviewer_id: string | null
  reviewed_at: string | null
  review_notes: string | null
  version: number
  tier: string
  status: Status
  published_by: string | null
  published_at: string | null
  updated_at: string
}

const CHECKS = [
  ["answerKey", "Answer key independently solved and verified"],
  ["explanation", "Explanation is correct, complete and understandable"],
  ["source", "Source and content classification are accurate"],
  ["difficulty", "Difficulty matches the intended learner level"],
  ["duplicate", "Checked for duplicates and near-duplicates"],
] as const

type Checks = Record<(typeof CHECKS)[number][0], boolean>

const EMPTY_CHECKS: Checks = {
  answerKey: false,
  explanation: false,
  source: false,
  difficulty: false,
  duplicate: false,
}

export function ContentReviewWorkspace() {
  const [status, setStatus] = React.useState<Status>("draft")
  const [query, setQuery] = React.useState("")
  const [questions, setQuestions] = React.useState<Question[]>([])
  const [reviews, setReviews] = React.useState<ReviewRecord[]>([])
  const [count, setCount] = React.useState(0)
  const [currentAdminId, setCurrentAdminId] = React.useState<string | null>(null)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [checks, setChecks] = React.useState<Checks>(EMPTY_CHECKS)
  const [notes, setNotes] = React.useState("")
  const [decision, setDecision] = React.useState<"approved" | "changes_requested" | "rejected">("approved")
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const selected = questions.find((question) => question.id === selectedId) ?? null

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status, limit: "50" })
      if (query.trim()) params.set("q", query.trim())
      const response = await fetch(`/api/admin/content?${params}`, { cache: "no-store" })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? "Could not load review queue.")
      const next = (payload.questions ?? []) as Question[]
      setQuestions(next)
      setReviews((payload.reviews ?? []) as ReviewRecord[])
      setCount(payload.count ?? next.length)
      setCurrentAdminId(typeof payload.currentAdminId === "string" ? payload.currentAdminId : null)
      setSelectedId((current) => next.some((question) => question.id === current) ? current : next[0]?.id ?? null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load review queue.")
    } finally {
      setLoading(false)
    }
  }, [status, query])

  React.useEffect(() => {
    const task = window.setTimeout(() => { void load() }, 0)
    return () => window.clearTimeout(task)
  }, [load])

  function selectQuestion(id: string) {
    setSelectedId(id)
    setChecks(EMPTY_CHECKS)
    setNotes("")
    setDecision("approved")
  }

  async function assignAuthor() {
    if (!selected) return
    setSaving(true)
    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign_author", questionId: selected.id }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? "Author attribution could not be saved.")
      toast.success("Your account is now recorded as the content author. A different admin must review it.")
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Author attribution could not be saved.")
    } finally {
      setSaving(false)
    }
  }

  async function submit(action: "review" | "publish" | "retire" | "restore") {
    if (!selected) return
    if (action === "review" && decision === "approved" && Object.values(checks).some((value) => !value)) {
      toast.error("Complete all five checks before approving this question.")
      return
    }
    if (action === "review" && decision === "approved" && selected.author_id === currentAdminId) {
      toast.error("You are recorded as the author. A different admin must review this question.")
      return
    }
    setSaving(true)
    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "review"
          ? { action, questionId: selected.id, decision, checks, notes }
          : { action, questionId: selected.id }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? "Action could not be completed.")
      toast.success(action === "publish" ? "Question published." : action === "retire" ? "Question retired." : action === "restore" ? "Question returned to draft." : `Review saved: ${decision.replace("_", " ")}.`)
      const nextStatus = action === "review" && decision === "approved" ? "reviewed"
        : action === "publish" ? "live"
        : action === "retire" ? "retired"
        : action === "restore" ? "draft"
        : null
      if (nextStatus && nextStatus !== status) setStatus(nextStatus)
      else await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action could not be completed.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ShieldCheck className="size-4" /> Admin · Academic quality
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Content review</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Check each practice question for accuracy before making it available to students. Changes to an approved question require another review.
          </p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          Refresh queue
        </Button>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1">
          {(["draft", "reviewed", "live", "retired"] as Status[]).map((value) => (
            <button key={value} type="button" onClick={() => setStatus(value)}
              className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${status === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              {value}
            </button>
          ))}
        </div>
        <div className="relative min-w-0 flex-1 sm:max-w-sm sm:ml-auto">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search prompt, topic or ID"
            className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
        <span className="text-xs text-muted-foreground">{count} matching records · up to 50 shown</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.65fr)]">
        <section className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b px-4 py-3">
            <h2 className="text-sm font-semibold">Question queue</h2>
            <p className="mt-1 text-xs text-muted-foreground">Select a question to review its answer, explanation and source.</p>
          </div>
          <div className="max-h-[720px] overflow-y-auto">
            {loading && questions.length === 0 ? (
              <div className="flex items-center gap-2 p-5 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading questions…</div>
            ) : questions.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No questions in this queue.</p>
            ) : questions.map((question) => (
              <button key={question.id} type="button" onClick={() => selectQuestion(question.id)}
                className={`block w-full border-b px-4 py-3 text-left transition hover:bg-muted/60 ${selectedId === question.id ? "bg-muted" : ""}`}>
                <span className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{question.section} · {question.difficulty}</span>
                  <span className="text-[11px] text-muted-foreground">v{question.version}</span>
                </span>
                <span className="mt-1 block line-clamp-2 text-sm font-medium">{question.prompt}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{question.topic} · {question.content_kind.replaceAll("_", " ")}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="min-w-0 rounded-xl border bg-card">
          {!selected ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Select a question from the queue.</div>
          ) : (
            <div className="space-y-5 p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-muted px-2 py-1">{selected.id}</span>
                    <span className="rounded-md bg-muted px-2 py-1">Version {selected.version}</span>
                    <span className="rounded-md bg-muted px-2 py-1 capitalize">{selected.status}</span>
                  </div>
                  <h2 className="text-lg font-semibold">{selected.topic || "Untitled topic"}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{selected.section} · {selected.difficulty} · {selected.tier} · {selected.content_kind.replaceAll("_", " ")}</p>
                </div>
                <ClipboardCheck className="size-5 text-muted-foreground" />
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-6">{selected.prompt}</p>
                <ol className="mt-3 space-y-2">
                  {(selected.options ?? []).map((option, index) => (
                    <li key={`${index}-${option}`} className={`rounded-md border px-3 py-2 text-sm ${index === selected.answer ? "border-emerald-600/40 bg-emerald-500/5" : "bg-background"}`}>
                      <span className="mr-2 font-semibold text-muted-foreground">{String.fromCharCode(65 + index)}.</span>{option}
                      {index === selected.answer && <span className="ml-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">Answer key</span>}
                    </li>
                  ))}
                </ol>
                <div className="mt-4 border-t pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Explanation</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{selected.explanation}</p>
                </div>
              </div>

              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-xs text-muted-foreground">Source reference</dt><dd className="mt-1 break-all">{selected.source_id || "Not recorded"}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Source URL</dt><dd className="mt-1 break-all">{selected.source_url || "Not recorded"}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Source checked</dt><dd className="mt-1">{selected.source_checked_at ? new Date(selected.source_checked_at).toLocaleString() : "Not recorded"}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Published at</dt><dd className="mt-1">{selected.published_at ? new Date(selected.published_at).toLocaleString() : "Not published"}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Author</dt><dd className="mt-1 break-all">{selected.author_id || "Legacy / not recorded"}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Last reviewed by</dt><dd className="mt-1 break-all">{selected.reviewer_id || "Not reviewed"}</dd></div>
              </dl>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold">Review history</h3>
                {reviews.filter((review) => review.question_id === selected.id).length === 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">This question has not been reviewed yet.</p>
                ) : (
                  <ol className="mt-2 space-y-2">
                    {reviews.filter((review) => review.question_id === selected.id).map((review) => (
                      <li key={review.id} className="rounded-lg border p-3 text-xs">
                        <div className="flex flex-wrap justify-between gap-2">
                          <span className="font-semibold capitalize">{review.decision.replace("_", " ")} · version {review.question_version}</span>
                          <time dateTime={review.created_at} className="text-muted-foreground">{new Date(review.created_at).toLocaleString()}</time>
                        </div>
                        <p className="mt-1 break-all text-muted-foreground">Reviewer: {review.reviewer_id}</p>
                        <p className="mt-1 text-muted-foreground">
                          Checks: {[
                            ["Answer", review.answer_key_checked],
                            ["Explanation", review.explanation_checked],
                            ["Source", review.source_checked],
                            ["Difficulty", review.difficulty_checked],
                            ["Duplicates", review.duplicate_checked],
                          ].map((item) => `${item[0]}: ${item[1] ? "yes" : "no"}`).join(" · ")}
                        </p>
                        {review.notes && <p className="mt-2 whitespace-pre-wrap">{review.notes}</p>}
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {status === "draft" && (
                <div className="space-y-4 border-t pt-5">
                  <div>
                    <h3 className="font-semibold">Independent review checklist</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Only check an item after you have personally verified it. Do not approve from appearance alone.</p>
                  </div>
                  {!selected.author_id ? (
                    <div className="rounded-lg border border-amber-600/30 bg-amber-500/5 p-3">
                      <p className="text-sm font-medium">Author attribution is missing</p>
                      <p className="mt-1 text-xs text-muted-foreground">Record the actual content author before approval. If you authored this question, assign it to yourself; another admin must then review it.</p>
                      <Button className="mt-3" variant="outline" onClick={() => void assignAuthor()} disabled={saving}>Record me as author</Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {selected.author_id} is recorded as the author. {selected.author_id === currentAdminId ? "Your account authored this item; another admin must review it." : "The author cannot approve this question."}
                    </p>
                  )}
                  <div className="space-y-3">
                    {CHECKS.map(([key, label]) => (
                      <label key={key} className="flex cursor-pointer items-start gap-3 text-sm">
                        <input type="checkbox" checked={checks[key]} onChange={(event) => setChecks((current) => ({ ...current, [key]: event.target.checked }))} className="mt-0.5 size-4 accent-primary" />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                  <label className="block text-sm font-medium">
                    Reviewer notes
                    <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} maxLength={4000}
                      placeholder="Record corrections, evidence, source details or rationale…"
                      className="mt-2 w-full rounded-lg border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <select value={decision} onChange={(event) => setDecision(event.target.value as typeof decision)} className="h-10 rounded-lg border bg-background px-3 text-sm">
                      <option value="approved">Approve</option>
                      <option value="changes_requested">Request changes</option>
                      <option value="rejected">Reject</option>
                    </select>
                    <Button onClick={() => void submit("review")} disabled={saving || (decision === "approved" && (!selected.author_id || selected.author_id === currentAdminId))}>
                      {saving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                      Save review decision
                    </Button>
                  </div>
                </div>
              )}

              {status === "reviewed" && (
                <div className="flex flex-col gap-3 rounded-lg border border-emerald-600/20 bg-emerald-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">Review approved</p>
                    <p className="mt-1 text-xs text-muted-foreground">Publishing is allowed only while this exact version remains unchanged.</p>
                  </div>
                  <Button onClick={() => void submit("publish")} disabled={saving}>
                    {saving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                    Publish to students
                  </Button>
                </div>
              )}

              {selected.status === "live" && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">This question is live. Substantive edits automatically return it to draft and invalidate the prior review.</p>
                  <Button variant="outline" onClick={() => void submit("retire")} disabled={saving}>Retire question</Button>
                </div>
              )}
              {selected.status === "reviewed" && (
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => void submit("retire")} disabled={saving}>Retire approved question</Button>
                </div>
              )}
              {selected.status === "retired" && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">This question is retired and is not available to students.</p>
                  <Button variant="outline" onClick={() => void submit("restore")} disabled={saving}>Return to draft</Button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

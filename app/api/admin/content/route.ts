import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isAdminUser } from "@/lib/admin"
import { hasTrustedRequestOrigin } from "@/lib/security/request-origin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function authorizedAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdminUser(user)) return { user: null, response: NextResponse.json({ error: "Admin access required." }, { status: 403 }) }
  const { data: assurance, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (error || assurance.currentLevel !== "aal2") {
    return { user: null, response: NextResponse.json({ error: "Complete MFA verification before managing content." }, { status: 403 }) }
  }
  return { user, response: null }
}

const STATUSES = new Set(["draft", "reviewed", "live", "retired"])

export async function GET(request: Request) {
  const auth = await authorizedAdmin()
  if (!auth.user) return auth.response ?? NextResponse.json({ error: "Admin access required." }, { status: 403 })
  const url = new URL(request.url)
  const status = url.searchParams.get("status") ?? "draft"
  const query = (url.searchParams.get("q") ?? "").trim().slice(0, 120).replace(/[^a-zA-Z0-9 _-]/g, " ").trim()
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? 30)))
  if (!STATUSES.has(status) || !Number.isInteger(limit)) {
    return NextResponse.json({ error: "Invalid content filter." }, { status: 400 })
  }

  const admin = createAdminClient()
  let requestQuery = admin
    .from("content_questions")
    .select("id,section,company_id,topic,difficulty,prompt,options,answer,explanation,option_notes,source_id,content_kind,source_url,source_checked_at,author_id,reviewer_id,reviewed_at,review_notes,version,quality_flags,tier,status,published_by,published_at,updated_at", { count: "exact" })
    .eq("status", status)
    .order("updated_at", { ascending: false })
    .limit(limit)
  if (query) requestQuery = requestQuery.or(`prompt.ilike.%${query}%,topic.ilike.%${query}%,id.ilike.%${query}%`)

  const { data, error, count } = await requestQuery
  if (error) return NextResponse.json({ error: "Could not load the content review queue." }, { status: 500 })

  const ids = (data ?? []).map((question) => question.id)
  const { data: reviews, error: reviewError } = ids.length
    ? await admin.from("content_question_reviews")
        .select("id,question_id,question_version,reviewer_id,decision,answer_key_checked,explanation_checked,source_checked,difficulty_checked,duplicate_checked,notes,created_at")
        .in("question_id", ids)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(250)
    : { data: [], error: null }
  if (reviewError) return NextResponse.json({ error: "Could not load the academic review history." }, { status: 500 })
  return NextResponse.json({ questions: data ?? [], reviews: reviews ?? [], count: count ?? 0, currentAdminId: auth.user.id }, {
    headers: { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" },
  })
}

export async function POST(request: Request) {
  if (!hasTrustedRequestOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 })
  }

  const auth = await authorizedAdmin()
  if (!auth.user) return auth.response ?? NextResponse.json({ error: "Admin access required." }, { status: 403 })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body || typeof body.questionId !== "string" || body.questionId.length > 160) {
    return NextResponse.json({ error: "A valid question ID is required." }, { status: 400 })
  }

  const admin = createAdminClient()
  if (body.action === "assign_author") {
    const { data: current, error: readError } = await admin
      .from("content_questions").select("author_id,status").eq("id", body.questionId).maybeSingle()
    if (readError || !current) return NextResponse.json({ error: "Could not load this question." }, { status: 404 })
    if (current.status !== "draft") return NextResponse.json({ error: "Only draft questions can receive initial author attribution." }, { status: 409 })
    if (current.author_id && current.author_id !== auth.user.id) {
      return NextResponse.json({ error: "An author is already recorded for this question." }, { status: 409 })
    }
    if (!current.author_id) {
      const { data: updated, error } = await admin.from("content_questions")
        .update({ author_id: auth.user.id }).eq("id", body.questionId).is("author_id", null).eq("status", "draft")
        .select("author_id").maybeSingle()
      if (error) return NextResponse.json({ error: "Could not record the content author." }, { status: 500 })
      if (updated?.author_id !== auth.user.id) {
        return NextResponse.json({ error: "Another admin assigned the author first. Refresh the queue." }, { status: 409 })
      }
    }
    return NextResponse.json({ ok: true, author_id: auth.user.id })
  }

  if (body.action === "review") {
    const decision = body.decision
    const checks = body.checks as Record<string, unknown> | undefined
    if (!["approved", "changes_requested", "rejected"].includes(String(decision)) || !checks) {
      return NextResponse.json({ error: "Choose a valid review decision and provide the review checklist." }, { status: 400 })
    }
    const values = ["answerKey", "explanation", "source", "difficulty", "duplicate"].map((key) => checks[key] === true)
    if (decision === "approved" && values.some((value) => !value)) {
      return NextResponse.json({ error: "All five checks must be confirmed before approval." }, { status: 400 })
    }
    const notes = typeof body.notes === "string" ? body.notes.slice(0, 4000) : null
    const { data, error } = await admin.rpc("admin_review_content_question", {
      p_question_id: body.questionId,
      p_reviewer_id: auth.user.id,
      p_decision: decision,
      p_answer_key_checked: values[0],
      p_explanation_checked: values[1],
      p_source_checked: values[2],
      p_difficulty_checked: values[3],
      p_duplicate_checked: values[4],
      p_notes: notes,
    })
    if (error) {
      const known = ["independently review", "content author", "five academic checks"].some((message) => error.message.includes(message))
      return NextResponse.json({ error: known ? error.message : "Review could not be saved. Please refresh and try again." }, { status: 409 })
    }
    return NextResponse.json(data)
  }

  if (body.action === "retire" || body.action === "restore") {
    const targetStatus = body.action === "retire" ? "retired" : "draft"
    const allowedCurrent = body.action === "retire" ? ["live", "reviewed"] : ["retired"]
    const update = body.action === "retire"
      ? { status: targetStatus }
      : { status: targetStatus, reviewer_id: null, reviewed_at: null, review_notes: null, published_by: null, published_at: null }
    const { data, error } = await admin.from("content_questions")
      .update(update)
      .eq("id", body.questionId)
      .in("status", allowedCurrent)
      .select("id,status").maybeSingle()
    if (error) return NextResponse.json({ error: "Could not update publication status." }, { status: 500 })
    if (!data) return NextResponse.json({ error: "The question changed state. Refresh the queue and try again." }, { status: 409 })
    return NextResponse.json({ ok: true, status: data.status })
  }

  if (body.action === "publish") {
    const { data, error } = await admin.rpc("admin_publish_content_question", {
      p_question_id: body.questionId,
      p_publisher_id: auth.user.id,
    })
    if (error) return NextResponse.json({ error: "Publishing was blocked. A current, independent, fully checked approval is required." }, { status: 409 })
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: "Unsupported content action." }, { status: 400 })
}

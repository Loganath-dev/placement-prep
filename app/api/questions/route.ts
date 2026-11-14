import { NextResponse } from "next/server"
import { readEntitlement } from "@/lib/premium-guard"
import { COMPANY_BY_ID } from "@/lib/data/companies"
import { createAdminClient } from "@/lib/supabase/admin"
import { hasTrustedRequestOrigin } from "@/lib/security/request-origin"
import { rateLimit } from "@/lib/rate-limit"

/** Which content tiers a viewer may receive. The server is authoritative. */
export function tiersFor(premium: boolean): ("free" | "premium")[] {
  return premium ? ["free", "premium"] : ["free"]
}

export interface StoredQuestionForDelivery {
  id: string
  section: string
  company_id: string | null
  topic: string
  difficulty: string
  prompt: string
  options: string[]
  answer: number
  explanation: string
  option_notes: string[] | null
  curated: boolean
  tier: "free" | "premium"
}

/** Never send the answer key or rationale before the learner submits. */
export function questionForDelivery(question: StoredQuestionForDelivery) {
  return {
    id: question.id,
    section: question.section,
    company_id: question.company_id,
    topic: question.topic,
    difficulty: question.difficulty,
    prompt: question.prompt,
    options: question.options,
    curated: question.curated,
    tier: question.tier,
  }
}

/**
 * GET delivers only live questions the viewer's plan can access. Answer keys,
 * explanations and per-option notes are deliberately omitted until POST.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const section = url.searchParams.get("section")
  const company = url.searchParams.get("company")
  if (company && company !== "general" && !Object.prototype.hasOwnProperty.call(COMPANY_BY_ID, company)) {
    return NextResponse.json({ error: "Invalid company." }, { status: 400 })
  }
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 20) || 20, 1), 100)
  let ent: Awaited<ReturnType<typeof readEntitlement>>
  try {
    ent = await readEntitlement()
  } catch {
    return NextResponse.json(
      { error: "We could not verify your subscription. Please retry shortly." },
      { status: 503, headers: { "Cache-Control": "private, no-store", "Retry-After": "5" } },
    )
  }
  const premium = ent?.premium ?? false
  const admin = createAdminClient()
  let query = admin
    .from("content_questions")
    .select("id, section, company_id, topic, difficulty, prompt, options, answer, explanation, option_notes, curated, tier")
    .eq("status", "live")
    .in("tier", tiersFor(premium))
    .limit(limit)
  if (section) query = query.eq("section", section)
  if (company && company !== "general") query = query.or(`company_id.eq.${company},company_id.is.null`)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: "Could not load questions." }, { status: 500 })
  return NextResponse.json(
    { premium, questions: ((data ?? []) as StoredQuestionForDelivery[]).map(questionForDelivery) },
    { headers: { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" } },
  )
}

/** Grade a bounded attempt on the server, then reveal teaching feedback. */
export async function POST(request: Request) {
  if (!hasTrustedRequestOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 })
  }

  let ent: Awaited<ReturnType<typeof readEntitlement>>
  try {
    ent = await readEntitlement()
  } catch {
    return NextResponse.json(
      { error: "We could not verify your subscription. Please retry shortly." },
      { status: 503, headers: { "Cache-Control": "private, no-store", "Retry-After": "5" } },
    )
  }
  if (!ent) return NextResponse.json({ error: "Sign in to submit answers." }, { status: 401 })
  const { allowed } = await rateLimit(`question-grade:${ent.userId}`, 30, 10 * 60 * 1000)
  if (!allowed) return NextResponse.json({ error: "Too many submissions. Please wait before trying again." }, { status: 429 })

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }) }
  if (!body || typeof body !== "object" || !Array.isArray((body as { answers?: unknown }).answers)) {
    return NextResponse.json({ error: "Submit an answers array." }, { status: 400 })
  }
  const answers = (body as { answers: unknown[] }).answers
  if (answers.length < 1 || answers.length > 100) return NextResponse.json({ error: "Submit between 1 and 100 answers." }, { status: 400 })
  const valid = answers.every((item) => item && typeof item === "object" &&
    typeof (item as { questionId?: unknown }).questionId === "string" &&
    (item as { questionId: string }).questionId.length <= 160 &&
    Number.isInteger((item as { selected?: unknown }).selected) &&
    (item as { selected: number }).selected >= 0 && (item as { selected: number }).selected <= 20)
  if (!valid) return NextResponse.json({ error: "Each answer needs a questionId and a valid selected option." }, { status: 400 })

  const ids = answers.map((item) => (item as { questionId: string }).questionId)
  if (new Set(ids).size !== ids.length) return NextResponse.json({ error: "Duplicate question IDs are not allowed." }, { status: 400 })
  const admin = createAdminClient()
  const { data, error } = await admin.from("content_questions")
    .select("id, options, answer, explanation, option_notes, tier")
    .in("id", ids).eq("status", "live").in("tier", tiersFor(ent.premium))
  if (error) return NextResponse.json({ error: "Could not grade this attempt." }, { status: 500 })
  const byId = new Map((data ?? []).map((row) => [row.id, row]))
  if (ids.some((id) => !byId.has(id))) return NextResponse.json({ error: "One or more questions are unavailable for this account." }, { status: 404 })

  const results = answers.map((item) => {
    const submitted = item as { questionId: string; selected: number }
    const question = byId.get(submitted.questionId)!
    const options = Array.isArray(question.options) ? question.options : []
    if (submitted.selected >= options.length) return null
    return {
      questionId: submitted.questionId,
      selected: submitted.selected,
      correct: submitted.selected === question.answer,
      answer: question.answer,
      explanation: question.explanation,
      optionNotes: question.option_notes ?? null,
    }
  })
  if (results.some((result) => result === null)) return NextResponse.json({ error: "A selected option is outside its question's range." }, { status: 400 })
  const graded = results.filter((result): result is NonNullable<typeof result> => result !== null)
  return NextResponse.json({ results: graded, correct: graded.filter((result) => result.correct).length, total: graded.length }, {
    headers: { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" },
  })
}

import { NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"
import { hasTrustedRequestOrigin } from "@/lib/security/request-origin"
import { readJsonBody } from "@/lib/security/read-json-body"
import { createHash } from "node:crypto"
import { readEntitlement } from "@/lib/premium-guard"
import { createAdminClient } from "@/lib/supabase/admin"
import { ensureLearningRewards } from "@/lib/server/learning-rewards"
import { verifyRewardSubmission } from "@/lib/server/reward-submission-token"
import { isValidTimeZone, dateKeyInTimeZone, weekStartKeyInTimeZone } from "@/lib/date-keys"

export const runtime = "nodejs"
const noStore = { "Cache-Control": "private, no-store, max-age=0" }

export async function POST(request: Request) {
  if (!hasTrustedRequestOrigin(request)) return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403, headers: noStore })
  let entitlement: Awaited<ReturnType<typeof readEntitlement>>
  try {
    entitlement = await readEntitlement()
  } catch {
    return NextResponse.json(
      { error: "We could not verify your subscription. Please retry shortly." },
      { status: 503, headers: { "Cache-Control": "private, no-store", "Retry-After": "5" } },
    )
  }
  if (!entitlement) return NextResponse.json({ error: "Sign in to submit this activity." }, { status: 401, headers: noStore })
  try {
    const limit = await rateLimit(`learning-reward:${entitlement.userId}`, 12, 10 * 60 * 1000)
    if (!limit.allowed) return NextResponse.json({ error: "Too many activity submissions. Please wait and retry." }, { status: 429, headers: { ...noStore, "Retry-After": "60" } })
  } catch {
    return NextResponse.json({ error: "Learning service is temporarily unavailable. Please retry shortly." }, { status: 503, headers: { ...noStore, "Retry-After": "10" } })
  }
  const body = await readJsonBody<Record<string, unknown>>(request, 64 * 1024)
  if (!body) return NextResponse.json({ error: "Invalid or oversized submission." }, { status: 400, headers: noStore })
  const claims = verifyRewardSubmission(body.submissionToken, entitlement.userId)
  if (!claims) return NextResponse.json({ error: "This attempt has expired or is invalid. Reload the activity and try again." }, { status: 400, headers: noStore })
  if (claims.kind !== "mock") {
    const timeZone = typeof body.timeZone === "string" && isValidTimeZone(body.timeZone) ? body.timeZone : null
    if (!timeZone || timeZone !== claims.timeZone) return NextResponse.json({ error: "The challenge time zone does not match this attempt." }, { status: 400, headers: noStore })
    const expected = claims.kind === "daily" ? dateKeyInTimeZone(new Date(), timeZone) : weekStartKeyInTimeZone(new Date(), timeZone)
    if (claims.periodKey !== expected) return NextResponse.json({ error: "This challenge period has ended. Reload the current challenge." }, { status: 409, headers: noStore })
  }
  const answers = Array.isArray(body.answers) ? body.answers as Array<Record<string, unknown>> : []
  if (answers.length !== claims.questions.length || !answers.length) return NextResponse.json({ error: "Submit every question in this attempt." }, { status: 400, headers: noStore })
  const expectedById = new Map(claims.questions.map((question) => [question.id, question]))
  const seen = new Set<string>()
  let correct = 0
  const selectedAnswers: Record<string, unknown> = {}
  for (const answer of answers) {
    if (typeof answer.questionId !== "string" || seen.has(answer.questionId)) return NextResponse.json({ error: "Invalid or duplicate answer." }, { status: 400, headers: noStore })
    const canonical = expectedById.get(answer.questionId)
    if (!canonical) return NextResponse.json({ error: "A question does not belong to this attempt." }, { status: 400, headers: noStore })
    seen.add(answer.questionId)
    let isCorrect = false
    if (canonical.acceptedAnswers?.length) {
      if (answer.responseText != null && (typeof answer.responseText !== "string" || answer.responseText.length > 500)) return NextResponse.json({ error: "Invalid typed answer." }, { status: 400, headers: noStore })
      const responseText = typeof answer.responseText === "string" ? answer.responseText.trim() : ""
      const normalized = responseText.toLocaleLowerCase().replace(/\s+/g, " ")
      isCorrect = Boolean(responseText) && canonical.acceptedAnswers.some((value) => value.trim().toLocaleLowerCase().replace(/\s+/g, " ") === normalized)
      selectedAnswers[canonical.id] = { responseText }
    } else {
      if (answer.selected !== null && answer.selected !== undefined && (typeof answer.selected !== "number" || !Number.isInteger(answer.selected) || answer.selected < 0 || answer.selected >= canonical.optionCount)) return NextResponse.json({ error: "Invalid selected option." }, { status: 400, headers: noStore })
      isCorrect = typeof answer.selected === "number" && answer.selected === canonical.answer
      selectedAnswers[canonical.id] = { selected: typeof answer.selected === "number" ? answer.selected : null }
    }
    if (isCorrect) correct++
  }
  let score = Math.round((correct / claims.questions.length) * 100)
  let verifiedAnswers = selectedAnswers
  const eventType = claims.kind === "daily" ? "daily_challenge_submitted" : claims.kind === "weekly" ? "weekly_challenge_submitted" : "mock_test_submitted"
  const sectionId = claims.kind === "mock" ? "__mock__" : "__challenge__"
  const admin = createAdminClient()
  const idempotencyKey = (() => {
    const hex = createHash("sha256").update(String(body.submissionToken)).digest("hex").slice(0, 32)
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`
  })()
  const { error: insertError } = await admin.from("learning_progress_events").insert({
    user_id: entitlement.userId,
    company_id: claims.companyId,
    section_id: sectionId,
    chapter_id: claims.subjectId,
    event_type: eventType,
    question_ids: claims.questions.map((question) => question.id),
    selected_answers: { ...selectedAnswers, correct_count: correct, question_count: claims.questions.length },
    score_percent: score,
    passed: true,
    idempotency_key: idempotencyKey,
  })
  if (insertError && insertError.code !== "23505") return NextResponse.json({ error: "Could not save your verified result. Please retry." }, { status: 503, headers: noStore })
  let { data: savedEvent, error: savedEventError } = await admin.from("learning_progress_events")
    .select("id,score_percent,selected_answers")
    .eq("user_id", entitlement.userId).eq("idempotency_key", idempotencyKey).maybeSingle()
  // Daily/weekly period uniqueness can reject a refreshed token with a new
  // idempotency key. Return the already-committed period result in that case.
  if (!savedEvent && !savedEventError && insertError?.code === "23505" && claims.kind !== "mock") {
    const fallback = await admin.from("learning_progress_events")
      .select("id,score_percent,selected_answers")
      .eq("user_id", entitlement.userId).eq("event_type", eventType)
      .eq("chapter_id", claims.subjectId).eq("company_id", claims.companyId).maybeSingle()
    savedEvent = fallback.data
    savedEventError = fallback.error
  }
  if (savedEventError || !savedEvent) return NextResponse.json({ error: "The result may be saved, but its status could not be confirmed. Retry safely." }, { status: 503, headers: noStore })
  if (insertError?.code === "23505") {
    score = Number(savedEvent.score_percent ?? 0)
    verifiedAnswers = (savedEvent.selected_answers ?? {}) as Record<string, unknown>
    correct = Number(verifiedAnswers.correct_count ?? 0)
  }
  let rewards: { xp: number; badges: string[] }
  try { rewards = await ensureLearningRewards(entitlement.userId, savedEvent.id) } catch {
    return NextResponse.json({ error: "Your result was saved, but rewards could not be refreshed yet. Reload to retry." }, { status: 503, headers: noStore })
  }
  const questionResults = claims.questions.map((question) => ({ questionId: question.id, correct: (() => {
    const selected = verifiedAnswers[question.id] as { selected?: number | null; responseText?: string } | undefined
    if (!selected) return false
    if (question.acceptedAnswers?.length) {
      const normalized = (selected.responseText ?? "").trim().toLocaleLowerCase().replace(/\s+/g, " ")
      return question.acceptedAnswers.some((value) => value.trim().toLocaleLowerCase().replace(/\s+/g, " ") === normalized)
    }
    return selected.selected === question.answer
  })() }))
  const reviewQuestions = claims.questions.map((question) => ({ id: question.id, answer: question.answer, acceptedAnswers: question.acceptedAnswers ?? [] }))
  return NextResponse.json({ ok: true, duplicate: insertError?.code === "23505", score, correct, total: claims.questions.length, questionResults, reviewQuestions, rewards }, { headers: noStore })
}

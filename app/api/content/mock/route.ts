import { NextResponse } from "next/server"
import { readEntitlement } from "@/lib/premium-guard"
import { COMPANY_BY_ID } from "@/lib/data/companies"
import { buildMockQuestions, publishedMocksForCompany } from "@/lib/data/mocks"
import { FREE_MOCK_LIMIT } from "@/lib/access"
import type { CompanyId } from "@/lib/types"
import { signRewardSubmission } from "@/lib/server/reward-submission-token"

export const runtime = "nodejs"

export async function GET(request: Request) {
  let entitlement: Awaited<ReturnType<typeof readEntitlement>>
  try {
    entitlement = await readEntitlement()
  } catch {
    return NextResponse.json(
      { error: "We could not verify your subscription. Please retry shortly." },
      { status: 503, headers: { "Cache-Control": "private, no-store", "Retry-After": "5" } },
    )
  }
  if (!entitlement) return NextResponse.json({ error: "Sign in to access mock tests." }, { status: 401 })
  const url = new URL(request.url)
  const companyId = (url.searchParams.get("company") ?? "general") as CompanyId
  const index = Number(url.searchParams.get("index") ?? 0)
  if (!Object.prototype.hasOwnProperty.call(COMPANY_BY_ID, companyId) || !Number.isInteger(index) || index < 0) {
    return NextResponse.json({ error: "Choose a valid mock test." }, { status: 400 })
  }
  const allMocks = publishedMocksForCompany(companyId)
  if (allMocks.length === 0) {
    return NextResponse.json({ unavailable: true, mockCount: 0, message: "No mock tests have completed academic review and publication for this company yet." }, { headers: { "Cache-Control": "private, no-store, max-age=0" } })
  }
  const companyMocks = allMocks
  const allowed = entitlement.premium || index < FREE_MOCK_LIMIT
  const selected = companyMocks[index]
  if (!selected) return NextResponse.json({ error: "Mock test not found." }, { status: 404 })
  if (!allowed) {
    return NextResponse.json({
      locked: true,
      mock: { id: selected.id, companyId: selected.companyId, title: selected.title, description: selected.description, sections: selected.sections, cutoffPercent: selected.cutoffPercent },
      mockCount: companyMocks.length,
    }, { status: 402, headers: { "Cache-Control": "private, no-store, max-age=0" } })
  }
  const safeMock = {
    id: selected.id,
    companyId: selected.companyId,
    title: selected.title,
    description: selected.description,
    sections: selected.sections,
    cutoffPercent: selected.cutoffPercent,
  }
  const questions = buildMockQuestions(selected)
  const submissionToken = signRewardSubmission({
    userId: entitlement.userId,
    kind: "mock",
    subjectId: selected.id,
    companyId,
    questions: questions.map((question) => ({ id: question.id, answer: question.answer, optionCount: question.options.length, acceptedAnswers: question.acceptedAnswers })),
    issuedAt: Date.now(),
  })
  return NextResponse.json({
    locked: false,
    mock: safeMock,
    submissionToken,
    questions: questions.map(({ answer: _answer, acceptedAnswers: _acceptedAnswers, ...safeQuestion }) => safeQuestion),
    mockCount: companyMocks.length,
  }, { headers: { "Cache-Control": "private, no-store, max-age=0" } })
}

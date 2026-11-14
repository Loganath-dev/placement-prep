import { NextResponse } from "next/server"
import { readEntitlement } from "@/lib/premium-guard"
import { pyqsForCompany } from "@/lib/data/pyqs"
import { FREE_PYQ_LIMIT } from "@/lib/access"
import { COMPANY_BY_ID } from "@/lib/data/companies"
import type { CompanyId } from "@/lib/types"

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
  if (!entitlement) return NextResponse.json({ error: "Sign in to access practice questions." }, { status: 401 })
  const url = new URL(request.url)
  const companyId = (url.searchParams.get("company") ?? "general") as CompanyId
  if (!COMPANY_BY_ID[companyId]) return NextResponse.json({ error: "Choose a valid company." }, { status: 400 })
  let questions = pyqsForCompany(companyId)
  const section = url.searchParams.get("section")
  const difficulty = url.searchParams.get("difficulty")
  const kind = url.searchParams.get("kind")
  if (section && section !== "all") questions = questions.filter((question) => question.section === section)
  if (difficulty && difficulty !== "all") questions = questions.filter((question) => question.difficulty === difficulty)
  if (kind && kind !== "all") questions = questions.filter((question) => question.contentKind === kind)
  const totalCount = questions.length
  const availableKinds = [...new Set(pyqsForCompany(companyId).map((question) => question.contentKind))]
  const visible = entitlement.premium ? questions : questions.slice(0, FREE_PYQ_LIMIT)
  return NextResponse.json({ questions: visible, totalCount, availableKinds, premium: entitlement.premium }, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  })
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdminUser } from "@/lib/admin"
import { buildMockQuestions, MOCK_TESTS } from "@/lib/data/mocks"
import type { MockPublicationStatus } from "@/lib/types"

export const runtime = "nodejs"

/**
 * Reviewer-only preview endpoint. Student routes must use /api/content/mock,
 * which returns published content only. Admins can inspect every state after
 * MFA; reviewers can inspect only items explicitly assigned to in_review.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user?.email_confirmed_at) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 })
  }

  const admin = isAdminUser(user)
  const reviewer = user.app_metadata?.role === "reviewer"
  if (!admin && !reviewer) {
    return NextResponse.json({ error: "Content review access required." }, { status: 403 })
  }

  if (admin) {
    const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (assurance?.currentLevel !== "aal2") {
      return NextResponse.json({ error: "Admin preview requires an authenticated second factor." }, { status: 403 })
    }
  }

  const allowedStatuses: MockPublicationStatus[] = admin
    ? ["draft", "in_review", "approved", "published", "archived"]
    : ["in_review"]
  const mocks = MOCK_TESTS
    .filter((mock) => allowedStatuses.includes(mock.publicationStatus))
    .map((mock) => ({
      id: mock.id,
      companyId: mock.companyId,
      title: mock.title,
      description: mock.description,
      publicationStatus: mock.publicationStatus,
      sections: mock.sections,
      questions: buildMockQuestions(mock),
    }))

  return NextResponse.json({ mocks }, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  })
}

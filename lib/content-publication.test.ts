import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  buildMockQuestions,
  isMockPublishedForStudents,
  MOCK_TESTS,
  publishedMocksForCompany,
} from "@/lib/data/mocks"
import {
  CORE_PREP_MOCK,
  CORE_PREP_MOCK_QUESTIONS,
} from "@/lib/data/core-prep-mock"
import { COMPANIES } from "@/lib/data/companies"

describe("mock publication gate", () => {
  it("does not expose draft, in-review, approved or archived mocks to students", () => {
    for (const status of [
      "draft",
      "in_review",
      "approved",
      "archived",
    ] as const) {
      expect(isMockPublishedForStudents({ publicationStatus: status })).toBe(
        false
      )
    }
    expect(isMockPublishedForStudents({ publicationStatus: "published" })).toBe(
      true
    )
    for (const company of COMPANIES.filter((item) => item.id !== "general")) {
      expect(publishedMocksForCompany(company.id)).toHaveLength(10)
    }
  })

  it("publishes the Core Prep mock with a complete, stable answer key", () => {
    expect(publishedMocksForCompany("general")).toEqual([CORE_PREP_MOCK])
    expect(buildMockQuestions(CORE_PREP_MOCK)).toEqual(CORE_PREP_MOCK_QUESTIONS)
    expect(
      CORE_PREP_MOCK.sections.reduce(
        (sum, section) => sum + section.questionCount,
        0
      )
    ).toBe(CORE_PREP_MOCK_QUESTIONS.length)
    expect(CORE_PREP_MOCK_QUESTIONS).toHaveLength(20)
    expect(
      new Set(CORE_PREP_MOCK_QUESTIONS.map((question) => question.id)).size
    ).toBe(20)
    expect(CORE_PREP_MOCK_QUESTIONS.map((question) => question.answer)).toEqual(
      [1, 2, 1, 1, 2, 2, 1, 2, 0, 2, 1, 2, 0, 1, 0, 1, 1, 1, 0, 1]
    )
    for (const question of CORE_PREP_MOCK_QUESTIONS) {
      expect(question.options).toHaveLength(4)
      expect(question.answer).toBeGreaterThanOrEqual(0)
      expect(question.answer).toBeLessThan(question.options.length)
      expect(question.explanation.trim()).not.toBe("")
    }
  })

  it("exposes only explicitly published mocks and keeps general simulations in review", () => {
    const sample = MOCK_TESTS.find((mock) => mock.companyId === "general" && mock.id !== CORE_PREP_MOCK.id)!
    const published = { ...sample, publicationStatus: "published" as const }
    expect(isMockPublishedForStudents(published)).toBe(true)
    expect(sample.publicationStatus).toBe("draft")
    expect(MOCK_TESTS.filter((mock) => mock.companyId === "general" && mock.id !== CORE_PREP_MOCK.id).every((mock) => mock.publicationStatus === "draft")).toBe(true)
  })
})

describe("content seed publication safety", () => {
  it("inserts missing questions as drafts without overwriting existing review state", () => {
    const seedScript = readFileSync(
      new URL("../scripts/seed-content.mjs", import.meta.url),
      "utf8"
    )
    expect(seedScript).toContain('status: "draft"')
    expect(seedScript).toContain(".insert(rows)")
    expect(seedScript).not.toContain(".upsert(rows")
  })

  it("unpublishes legacy live rows without independent review evidence in migration 0034", () => {
    const migration = readFileSync(
      new URL(
        "../supabase/migrations/0034_content_quality_workflow.sql",
        import.meta.url
      ),
      "utf8"
    )
    expect(migration).toContain("set status = 'draft'")
    expect(migration).toContain("reviewed_at is null")
    expect(migration).toContain("reviewer_id is null")
  })
})

describe("V11.6 independent academic review workflow", () => {
  it("requires MFA-backed admin routes and uses service-side review RPCs", () => {
    const route = readFileSync(
      new URL("../app/api/admin/content/route.ts", import.meta.url),
      "utf8"
    )
    expect(route).toContain("getAuthenticatorAssuranceLevel")
    expect(route).toContain('assurance.currentLevel !== "aal2"')
    expect(route).toContain('admin.rpc("admin_review_content_question"')
    expect(route).toContain('admin.rpc("admin_publish_content_question"')
    expect(route).toContain('body.action === "assign_author"')
  })

  it("requires five checks for approval and a current review version for publishing", () => {
    const migration = readFileSync(
      new URL(
        "../supabase/migrations/0035_content_review_workflow.sql",
        import.meta.url
      ),
      "utf8"
    )
    expect(migration).toContain(
      "p_answer_key_checked and p_explanation_checked and p_source_checked"
    )
    expect(migration).toContain(
      "Only draft questions can enter academic review"
    )
    expect(migration).toContain(
      "Only an approved reviewed question can be published"
    )
    expect(migration).toContain("latest_review.question_version <> q.version")
    expect(migration).toContain("latest_review.decision <> 'approved'")
    expect(migration).toContain(
      "Record the content author before requesting independent approval"
    )
    expect(migration).toContain(
      "The author cannot independently review their own question"
    )
    expect(migration).toContain(
      "grant execute on function public.admin_review_content_question"
    )
    expect(migration).toContain(
      "grant execute on function public.admin_publish_content_question"
    )
  })

  it("invalidates approval and publication when question content changes", () => {
    const migration = readFileSync(
      new URL(
        "../supabase/migrations/0035_content_review_workflow.sql",
        import.meta.url
      ),
      "utf8"
    )
    expect(migration).toContain("new.version := old.version + 1")
    expect(migration).toContain("new.status := 'draft'")
    expect(migration).toContain("new.reviewer_id := null")
    expect(migration).toContain("new.published_at := null")
  })

  it("keeps the review workspace behind the admin page guard", () => {
    const page = readFileSync(
      new URL("../app/(app)/admin/content/page.tsx", import.meta.url),
      "utf8"
    )
    expect(page).toContain("await requireAdminMfa()")
    expect(page).toContain("ContentReviewWorkspace")
  })
})

import { describe, expect, it } from "vitest"
import { COMPANIES } from "@/lib/data/companies"
import { getSections } from "@/lib/data/content-catalog"

describe("student learning catalogue scope", () => {
  it("does not expose interview or communication practice in any learning roadmap", () => {
    for (const company of COMPANIES) {
      expect(getSections(company.id).some((section) => section.id === "comm-interview")).toBe(false)
    }
  })

  it("keeps the approved learning areas available", () => {
    for (const company of COMPANIES) {
      const ids = getSections(company.id).map((section) => section.id)
      expect(ids).toContain("quant")
      expect(ids).toContain("reasoning")
      expect(ids).toContain("verbal")
      expect(ids).toContain("cs-core")
    }
  })
  it("exposes only substantive lessons in each chapter roadmap", () => {
    for (const company of COMPANIES) {
      for (const section of getSections(company.id)) {
        for (const chapter of section.chapters) {
          expect(chapter.lessons.length, `${company.id}/${chapter.id} needs at least one lesson`).toBeGreaterThan(0)
          expect(chapter.lessons.every((lesson) => !lesson.id.startsWith("boost-"))).toBe(true)
        }
      }
    }
  })

})

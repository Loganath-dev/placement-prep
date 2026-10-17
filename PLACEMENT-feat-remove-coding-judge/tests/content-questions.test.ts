import { describe, expect, it } from "vitest"
import { tiersFor } from "@/app/api/questions/route"
import { CONTENT_SEED } from "@/lib/data/content-seed"

describe("tiersFor (the content gate)", () => {
  it("serves only free content to non-premium viewers", () => {
    expect(tiersFor(false)).toEqual(["free"])
  })

  it("serves free + premium to premium viewers", () => {
    expect(tiersFor(true)).toEqual(["free", "premium"])
  })

  it("never lets a non-premium viewer reach the premium tier", () => {
    expect(tiersFor(false)).not.toContain("premium")
  })
})

describe("CONTENT_SEED integrity", () => {
  it("has unique ids", () => {
    const ids = CONTENT_SEED.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("every question is well-formed with parallel per-option rationale", () => {
    for (const q of CONTENT_SEED) {
      expect(q.options.length, `${q.id} needs >= 2 options`).toBeGreaterThanOrEqual(2)
      expect(q.optionNotes.length, `${q.id} optionNotes must be parallel to options`).toBe(
        q.options.length,
      )
      expect(q.answer, `${q.id} answer index in range`).toBeGreaterThanOrEqual(0)
      expect(q.answer).toBeLessThan(q.options.length)
      expect(q.prompt.trim().length, `${q.id} prompt non-empty`).toBeGreaterThan(0)
      expect(q.explanation.trim().length, `${q.id} explanation non-empty`).toBeGreaterThan(0)
      expect(["free", "premium"]).toContain(q.tier)
      // No empty rationale strings.
      for (const note of q.optionNotes) {
        expect(note.trim().length, `${q.id} has an empty optionNote`).toBeGreaterThan(0)
      }
    }
  })

  it("is a genuine mix of free and premium tiers", () => {
    expect(CONTENT_SEED.some((q) => q.tier === "free")).toBe(true)
    expect(CONTENT_SEED.some((q) => q.tier === "premium")).toBe(true)
  })

  it("covers every section at a real starter scale", () => {
    expect(CONTENT_SEED.length).toBeGreaterThanOrEqual(45)
    const sections = new Set(CONTENT_SEED.map((q) => q.section))
    for (const s of ["quant", "reasoning", "verbal", "cs-core", "coding", "comm-interview"]) {
      expect(sections, `seed should cover ${s}`).toContain(s)
    }
  })

  it("includes company-specific questions across multiple tracks", () => {
    const tagged = CONTENT_SEED.filter((q) => q.companyId)
    expect(tagged.length, "should have company-tagged questions").toBeGreaterThanOrEqual(8)
    const companies = new Set(tagged.map((q) => q.companyId))
    // Differentiation comes from covering several real tracks, not just one.
    expect(companies.size, "company-specific content should span several tracks").toBeGreaterThanOrEqual(4)
  })
})

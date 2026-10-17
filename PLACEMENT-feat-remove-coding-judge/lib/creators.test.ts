import { describe, expect, it } from "vitest"
import { CREATOR_EMAILS, isCreatorEmail } from "@/lib/creators"

describe("creator access", () => {
  it("recognizes every configured creator", () => {
    for (const email of CREATOR_EMAILS) expect(isCreatorEmail(email)).toBe(true)
  })

  it("normalizes casing and harmless whitespace", () => {
    expect(isCreatorEmail(`  ${CREATOR_EMAILS[0].toUpperCase()}  `)).toBe(true)
  })

  it("rejects missing and non-creator identities", () => {
    expect(isCreatorEmail(null)).toBe(false)
    expect(isCreatorEmail(undefined)).toBe(false)
    expect(isCreatorEmail("student@example.com")).toBe(false)
  })
})

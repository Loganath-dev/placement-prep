import { afterEach, describe, expect, it } from "vitest"
import { isCreatorUser } from "@/lib/creators"

describe("creator access", () => {
  const previous = process.env.STUDYBENCH_CREATOR_EMAILS
  afterEach(() => {
    if (previous === undefined) delete process.env.STUDYBENCH_CREATOR_EMAILS
    else process.env.STUDYBENCH_CREATOR_EMAILS = previous
  })

  it("accepts trusted creator/admin app metadata", () => {
    expect(isCreatorUser({ email_confirmed_at: "2026-01-01T00:00:00Z", app_metadata: { role: "creator" } })).toBe(true)
    expect(isCreatorUser({ email_confirmed_at: "2026-01-01T00:00:00Z", app_metadata: { role: "admin" } })).toBe(true)
  })

  it("supports a server-only allowlist", () => {
    process.env.STUDYBENCH_CREATOR_EMAILS = "operator@example.com"
    expect(isCreatorUser({ email: " OPERATOR@example.com ", email_confirmed_at: "2026-01-01T00:00:00Z" })).toBe(true)
  })

  it("never trusts user-editable metadata", () => {
    expect(isCreatorUser({ email: "student@example.com", email_confirmed_at: "2026-01-01T00:00:00Z", app_metadata: { role: "student" } })).toBe(false)
  })
})


describe("creator access verification", () => {
  it("requires a verified email even when trusted app metadata is present", () => {
    expect(isCreatorUser({ app_metadata: { role: "creator" } })).toBe(false)
  })
})

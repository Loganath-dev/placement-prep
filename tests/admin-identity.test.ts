import { afterEach, describe, expect, it } from "vitest"
import { isAdminUser } from "@/lib/admin"

describe("admin identity", () => {
  const previous = process.env.STUDYBENCH_ADMIN_EMAILS
  afterEach(() => {
    if (previous === undefined) delete process.env.STUDYBENCH_ADMIN_EMAILS
    else process.env.STUDYBENCH_ADMIN_EMAILS = previous
  })

  it("accepts a verified user with trusted admin app metadata", () => {
    expect(isAdminUser({ email_confirmed_at: "2026-01-01T00:00:00Z", app_metadata: { role: "admin" } })).toBe(true)
  })

  it("requires a verified email even when trusted role metadata is present", () => {
    expect(isAdminUser({ app_metadata: { role: "admin" } })).toBe(false)
  })

  it("supports a server-only allowlist but never user-editable metadata", () => {
    process.env.STUDYBENCH_ADMIN_EMAILS = "operator@example.com"
    expect(isAdminUser({ email: " OPERATOR@example.com ", email_confirmed_at: "2026-01-01T00:00:00Z" })).toBe(true)
    expect(isAdminUser({ email: "student@example.com", email_confirmed_at: "2026-01-01T00:00:00Z", app_metadata: { role: "student" } })).toBe(false)
  })
})

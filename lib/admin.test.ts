import { afterEach, describe, expect, it } from "vitest"
import { isAdminUser } from "@/lib/admin"

describe("admin identity", () => {
  const previous = process.env.STUDYBENCH_ADMIN_EMAILS
  afterEach(() => {
    if (previous === undefined) delete process.env.STUDYBENCH_ADMIN_EMAILS
    else process.env.STUDYBENCH_ADMIN_EMAILS = previous
  })

  it("accepts only the verified owner email", () => {
    expect(isAdminUser({ email: " LNATH6630@gmail.com ", email_confirmed_at: "2026-01-01T00:00:00Z" })).toBe(true)
  })

  it("rejects other emails even if env configuration or auth metadata grants admin", () => {
    process.env.STUDYBENCH_ADMIN_EMAILS = "operator@example.com"
    expect(isAdminUser({ email: "operator@example.com", email_confirmed_at: "2026-01-01T00:00:00Z" })).toBe(false)
    expect(isAdminUser({ email: "student@example.com", email_confirmed_at: "2026-01-01T00:00:00Z" })).toBe(false)
  })

  it("requires a confirmed owner email", () => {
    expect(isAdminUser({ email: "lnath6630@gmail.com" })).toBe(false)
  })
})

import { describe, expect, it } from "vitest"
import { safeInternalRedirectPath } from "@/lib/security/redirect"

const ORIGIN = "https://studybench.in"

describe("safeInternalRedirectPath", () => {
  it("preserves a same-origin path, query and hash", () => {
    expect(safeInternalRedirectPath("/learn?track=tcs#chapter-1", ORIGIN))
      .toBe("/learn?track=tcs#chapter-1")
  })

  it.each([
    "//attacker.example",
    "/\\attacker.example",
    "https://attacker.example/path",
    "javascript:alert(1)",
    "",
    null,
    undefined,
  ])("falls back for an unsafe or missing destination: %s", (value) => {
    expect(safeInternalRedirectPath(value, ORIGIN)).toBe("/dashboard")
  })

  it("falls back when the supplied origin is malformed", () => {
    expect(safeInternalRedirectPath("/learn", "not-an-origin")).toBe("/dashboard")
  })

  it("supports a caller-provided safe fallback", () => {
    expect(safeInternalRedirectPath("//attacker.example", ORIGIN, "/onboarding"))
      .toBe("/onboarding")
  })
})

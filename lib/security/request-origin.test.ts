import { describe, expect, it } from "vitest"
import { hasTrustedRequestOrigin } from "@/lib/security/request-origin"

describe("hasTrustedRequestOrigin", () => {
  it("accepts a same-origin browser mutation", () => {
    expect(hasTrustedRequestOrigin(new Request("https://studybench.in/api/settings", {
      method: "POST", headers: { origin: "https://studybench.in", "sec-fetch-site": "same-origin" },
    }))).toBe(true)
  })

  it("rejects a cross-origin Origin header", () => {
    expect(hasTrustedRequestOrigin(new Request("https://studybench.in/api/settings", {
      method: "POST", headers: { origin: "https://attacker.example" },
    }))).toBe(false)
  })

  it("rejects a cross-site fetch even when Origin is absent", () => {
    expect(hasTrustedRequestOrigin(new Request("https://studybench.in/api/settings", {
      method: "POST", headers: { "sec-fetch-site": "cross-site" },
    }))).toBe(false)
  })

  it("allows non-browser clients that omit browser provenance headers", () => {
    expect(hasTrustedRequestOrigin(new Request("https://studybench.in/api/settings", { method: "POST" }))).toBe(true)
  })
})

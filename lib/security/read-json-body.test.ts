import { describe, expect, it } from "vitest"
import { readJsonBody } from "@/lib/security/read-json-body"

describe("readJsonBody", () => {
  it("parses a valid JSON body under the byte limit", async () => {
    const request = new Request("https://studybench.in/api/test", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true }),
    })
    await expect(readJsonBody(request, 128)).resolves.toEqual({ ok: true })
  })

  it("rejects a body whose declared content length exceeds the limit", async () => {
    const request = new Request("https://studybench.in/api/test", {
      method: "POST", headers: { "Content-Length": "999" }, body: "{}",
    })
    await expect(readJsonBody(request, 8)).resolves.toBeNull()
  })

  it("rejects invalid JSON", async () => {
    const request = new Request("https://studybench.in/api/test", { method: "POST", body: "not-json" })
    await expect(readJsonBody(request, 128)).resolves.toBeNull()
  })
})

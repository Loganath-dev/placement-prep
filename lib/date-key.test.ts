import { describe, expect, it } from "vitest"
import { localDateKey, previousLocalDateKey } from "@/lib/date-key"

describe("local calendar dates", () => {
  it("uses the local calendar date", () => {
    expect(localDateKey(new Date(2026, 10, 9, 0, 15))).toBe("2026-11-09")
  })
  it("handles month and year boundaries", () => {
    expect(previousLocalDateKey("2026-11-01")).toBe("2026-10-31")
    expect(previousLocalDateKey("2026-01-01")).toBe("2025-12-31")
  })
  it("rejects invalid date keys", () => {
    expect(() => previousLocalDateKey("2026-02-30")).toThrow(RangeError)
    expect(() => previousLocalDateKey("not-a-date")).toThrow(RangeError)
  })
})

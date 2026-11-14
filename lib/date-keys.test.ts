import { describe, expect, it } from "vitest"
import {
  addDaysToDateKey,
  dateKeyInTimeZone,
  isValidTimeZone,
  weekStartKeyInTimeZone,
} from "./date-keys"

describe("calendar date keys", () => {
  it("uses the student's timezone rather than UTC for the calendar day", () => {
    const instant = new Date("2026-11-12T19:00:00.000Z")

    expect(dateKeyInTimeZone(instant, "Asia/Kolkata")).toBe("2026-11-13")
    expect(dateKeyInTimeZone(instant, "America/Los_Angeles")).toBe("2026-11-12")
  })

  it("calculates Monday week keys in the student's timezone", () => {
    const instant = new Date("2026-11-15T10:00:00.000Z")

    expect(weekStartKeyInTimeZone(instant, "Asia/Kolkata")).toBe("2026-11-09")
    expect(weekStartKeyInTimeZone(instant, "America/Los_Angeles")).toBe("2026-11-09")
  })

  it("handles month, year and leap-day boundaries", () => {
    expect(addDaysToDateKey("2026-01-01", -1)).toBe("2025-12-31")
    expect(addDaysToDateKey("2024-03-01", -1)).toBe("2024-02-29")
    expect(addDaysToDateKey("2026-12-31", 1)).toBe("2027-01-01")
  })

  it("rejects malformed date keys and invalid timezones", () => {
    expect(() => addDaysToDateKey("13-11-2026", 1)).toThrow(RangeError)
    expect(isValidTimeZone("Asia/Kolkata")).toBe(true)
    expect(isValidTimeZone("Not/A-Timezone")).toBe(false)
  })
})

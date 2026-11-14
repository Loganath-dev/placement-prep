/** Calendar-day helpers. Persist date-only keys in YYYY-MM-DD form. */

const DATE_KEY_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>()

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  const cached = DATE_KEY_FORMATTER_CACHE.get(timeZone)
  if (cached) return cached

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  if (DATE_KEY_FORMATTER_CACHE.size >= 32) {
    const oldestKey = DATE_KEY_FORMATTER_CACHE.keys().next().value
    if (oldestKey) DATE_KEY_FORMATTER_CACHE.delete(oldestKey)
  }
  DATE_KEY_FORMATTER_CACHE.set(timeZone, formatter)
  return formatter
}

/** Returns a YYYY-MM-DD calendar date in the supplied IANA time zone. */
export function dateKeyInTimeZone(date: Date, timeZone: string): string {
  if (!Number.isFinite(date.getTime())) throw new RangeError("Invalid date")
  const parts = formatterFor(timeZone).formatToParts(date)
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  const year = values.year
  const month = values.month
  const day = values.day
  if (!year || !month || !day) throw new RangeError("Could not calculate calendar date")
  return `${year}-${month}-${day}`
}

export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
}

export function localDateKey(date = new Date()): string {
  return dateKeyInTimeZone(date, browserTimeZone())
}

/** Adds calendar days without relying on the machine's local timezone. */
export function addDaysToDateKey(dateKey: string, amount: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || !Number.isInteger(amount)) {
    throw new RangeError("Expected a YYYY-MM-DD date and an integer day offset")
  }
  const [year, month, day] = dateKey.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + amount))
  return date.toISOString().slice(0, 10)
}

/** Monday date key for the week containing the supplied instant in a timezone. */
export function weekStartKeyInTimeZone(date: Date, timeZone: string): string {
  const dateKey = dateKeyInTimeZone(date, timeZone)
  const [year, month, day] = dateKey.split("-").map(Number)
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  const daysSinceMonday = (weekday + 6) % 7
  return addDaysToDateKey(dateKey, -daysSinceMonday)
}

export function localWeekStartKey(date = new Date()): string {
  return weekStartKeyInTimeZone(date, browserTimeZone())
}

export function isValidTimeZone(timeZone: string): boolean {
  if (!timeZone || timeZone.length > 100) return false
  try {
    formatterFor(timeZone)
    return true
  } catch {
    return false
  }
}

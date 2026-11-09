/** Local calendar-day keys for streaks and daily learning. */
export function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function previousLocalDateKey(dayKey: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayKey)
  if (!match) throw new RangeError("Expected a YYYY-MM-DD local date key.")
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  if (localDateKey(date) !== dayKey) throw new RangeError("Invalid calendar date.")
  date.setDate(date.getDate() - 1)
  return localDateKey(date)
}

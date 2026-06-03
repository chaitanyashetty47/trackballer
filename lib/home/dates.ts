const DAY_MS = 24 * 60 * 60 * 1000

export function sevenDaysAgoIso(now = new Date()): string {
  return new Date(now.getTime() - 7 * DAY_MS).toISOString()
}

/** UTC midnight bounds for fixture kickoff filtering. */
export function utcDayBounds(now = new Date()): { start: string; end: string } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const end = new Date(start.getTime() + DAY_MS)
  return { start: start.toISOString(), end: end.toISOString() }
}

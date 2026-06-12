/**
 * API-Football goal event detail strings (type is always "Goal" for scored goals).
 * See GET /fixtures/events — detail e.g. Normal Goal, Penalty, Own Goal, Missed Penalty.
 */

export function isOwnGoalDetail(detail: string | null | undefined): boolean {
  if (!detail) return false
  return detail.toLowerCase().includes("own goal")
}

/** In-game penalty scored — not missed, not shootout. */
export function isInGamePenaltyDetail(detail: string | null | undefined): boolean {
  if (!detail) return false
  const normalized = detail.toLowerCase()
  return normalized.includes("penalty") && !normalized.includes("missed")
}

/** Scorecard suffix after minute, e.g. (P) or (OG). */
export function goalDetailSuffix(
  detail: string | null | undefined,
): "" | " (P)" | " (OG)" {
  if (isOwnGoalDetail(detail)) return " (OG)"
  if (isInGamePenaltyDetail(detail)) return " (P)"
  return ""
}

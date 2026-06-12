import { filterVarCancelledGoals } from "@/lib/match/var-goal-events"

export type GoalEventRow = {
  player_id: number | null
  assist_player_id: number | null
  type: string
  detail: string | null
  minute: number
  extra_minute: number | null
}

export type PlayerContributionCounts = {
  goals: number
  assists: number
}

function countsForPlayer(
  map: Map<number, PlayerContributionCounts>,
  playerId: number,
): PlayerContributionCounts {
  return map.get(playerId) ?? { goals: 0, assists: 0 }
}

/** API-Football logs shootout goals at 120' with extra_minute 1, 2, 3… */
export function isPenaltyShootoutGoal(
  minute: number,
  extraMinute: number | null,
  detail: string | null,
): boolean {
  if (!detail?.toLowerCase().includes("penalty")) return false
  return minute >= 120 && extraMinute != null && extraMinute > 0
}

/** Match goals for pitch badges: open play + in-game PKs; not shootout / OG / misses. */
export function isCountedMatchGoal(
  detail: string | null,
  minute: number,
  extraMinute: number | null,
): boolean {
  if (!detail) return false
  const normalized = detail.toLowerCase()
  if (normalized.includes("missed")) return false
  if (normalized.includes("own goal")) return false
  if (isPenaltyShootoutGoal(minute, extraMinute, detail)) return false
  if (normalized.includes("normal goal")) return true
  if (normalized.includes("penalty")) return true
  return false
}

/** Goals and assists per player from synced fixture_events. */
export function buildGoalAssistCountsMap(
  events: GoalEventRow[],
): Map<number, PlayerContributionCounts> {
  const map = new Map<number, PlayerContributionCounts>()

  for (const event of filterVarCancelledGoals(events)) {
    if (event.type !== "Goal") continue
    if (!isCountedMatchGoal(event.detail, event.minute, event.extra_minute)) continue

    if (event.player_id != null) {
      const current = countsForPlayer(map, event.player_id)
      current.goals += 1
      map.set(event.player_id, current)
    }

    if (event.assist_player_id != null) {
      const current = countsForPlayer(map, event.assist_player_id)
      current.assists += 1
      map.set(event.assist_player_id, current)
    }
  }

  return map
}

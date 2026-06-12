import { isCountedMatchGoal, isPenaltyShootoutGoal } from "@/lib/match/goal-assist-counts"
import {
  isInGamePenaltyDetail,
  isOwnGoalDetail,
} from "@/lib/match/goal-event-detail"
import { filterVarCancelledGoals } from "@/lib/match/var-goal-events"
import type { MatchGoalEntry, MatchGoalScorers, MatchGroupedScorer } from "@/lib/match/types"

export type MatchGoalEventRow = {
  player_id: number | null
  team_id: number | null
  type: string
  detail: string | null
  minute: number
  extra_minute: number | null
}

function shortDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) return name
  const last = parts[parts.length - 1] ?? name
  const first = parts[0]
  if (!first) return last
  return `${first[0]}. ${last}`
}

function isInGamePenalty(detail: string | null): boolean {
  return isInGamePenaltyDetail(detail)
}

function isOwnGoal(detail: string | null): boolean {
  return isOwnGoalDetail(detail)
}

/** Hero scorers row: open play, in-game PKs, and own goals — not shootout or misses. */
function isHeroMatchGoal(
  detail: string | null,
  minute: number,
  extraMinute: number | null,
): boolean {
  if (!detail) return false
  const normalized = detail.toLowerCase()
  if (normalized.includes("missed")) return false
  if (isPenaltyShootoutGoal(minute, extraMinute, detail)) return false
  if (normalized.includes("own goal")) return true
  return isCountedMatchGoal(detail, minute, extraMinute)
}

/** Football-style minute label, e.g. 90+7' or 108'. */
export function formatGoalMinuteLabel(minute: number, extraMinute: number | null): string {
  if (extraMinute != null && extraMinute > 0) {
    return `${minute}+${extraMinute}'`
  }
  return `${minute}'`
}

function goalAnnotation(entry: MatchGoalEntry): string {
  if (entry.isOwnGoal) return " (OG)"
  if (entry.isPenalty) return " (P)"
  return ""
}

/** Match goals for hero scorers row; excludes shootout pens. */
export function buildMatchGoalScorers(
  events: MatchGoalEventRow[],
  homeTeamId: number,
  playerNames: Map<number, string>,
): MatchGoalScorers {
  const home: MatchGoalEntry[] = []
  const away: MatchGoalEntry[] = []

  const sorted = [...filterVarCancelledGoals(events)].sort((a, b) => {
    if (a.minute !== b.minute) return a.minute - b.minute
    return (a.extra_minute ?? 0) - (b.extra_minute ?? 0)
  })

  for (const event of sorted) {
    if (event.type !== "Goal") continue
    if (!isHeroMatchGoal(event.detail, event.minute, event.extra_minute)) continue
    if (event.player_id == null || event.team_id == null) continue

    const rawName = playerNames.get(event.player_id) ?? `Player ${event.player_id}`
    const entry: MatchGoalEntry = {
      playerId: event.player_id,
      displayName: shortDisplayName(rawName),
      minute: event.minute,
      extraMinute: event.extra_minute,
      isPenalty: isInGamePenalty(event.detail),
      isOwnGoal: isOwnGoal(event.detail),
    }

    if (event.team_id === homeTeamId) {
      home.push(entry)
    } else {
      away.push(entry)
    }
  }

  return { home, away }
}

/** One row per player, in order of their first goal. */
export function groupScorersByPlayer(goals: MatchGoalEntry[]): MatchGroupedScorer[] {
  const grouped = new Map<number, MatchGroupedScorer>()
  const order: number[] = []

  for (const goal of goals) {
    const existing = grouped.get(goal.playerId)
    if (existing) {
      existing.goals.push(goal)
      continue
    }

    order.push(goal.playerId)
    grouped.set(goal.playerId, {
      playerId: goal.playerId,
      displayName: goal.displayName,
      goals: [goal],
    })
  }

  return order.map((playerId) => grouped.get(playerId)!)
}

/** "Bryan Mbeumo 61', 90+7'" or "Casemiro 34' (OG)". */
export function formatGroupedScorerLine(group: MatchGroupedScorer): string {
  const minutes = group.goals
    .map((goal) => `${formatGoalMinuteLabel(goal.minute, goal.extraMinute)}${goalAnnotation(goal)}`)
    .join(", ")

  return `${group.displayName} ${minutes}`
}

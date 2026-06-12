import { isRedCardDetail } from "@/lib/match/card-event-detail"
import { filterDisplayFixtureEvents } from "@/lib/match/fixture-event-filters"
import { formatGoalMinuteLabel } from "@/lib/match/match-goals"
import type { MatchRedCardEntry, MatchRedCards } from "@/lib/match/types"

export type MatchCardEventRow = {
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

/** Red cards for the hero scorecard row (direct red + second yellow). */
export function buildMatchRedCards(
  events: MatchCardEventRow[],
  homeTeamId: number,
  playerNames: Map<number, string>,
): MatchRedCards {
  const home: MatchRedCardEntry[] = []
  const away: MatchRedCardEntry[] = []

  const sorted = [...filterDisplayFixtureEvents(events)].sort((a, b) => {
    if (a.minute !== b.minute) return a.minute - b.minute
    return (a.extra_minute ?? 0) - (b.extra_minute ?? 0)
  })

  for (const event of sorted) {
    if (event.type !== "Card") continue
    if (!isRedCardDetail(event.detail)) continue
    if (event.player_id == null || event.team_id == null) continue

    const rawName = playerNames.get(event.player_id) ?? `Player ${event.player_id}`
    const entry: MatchRedCardEntry = {
      playerId: event.player_id,
      displayName: shortDisplayName(rawName),
      minute: event.minute,
      extraMinute: event.extra_minute,
    }

    if (event.team_id === homeTeamId) {
      home.push(entry)
    } else {
      away.push(entry)
    }
  }

  return { home, away }
}

export function formatRedCardLine(entry: MatchRedCardEntry): string {
  return `${entry.displayName} ${formatGoalMinuteLabel(entry.minute, entry.extraMinute)}`
}

import { isRedCardDetail, isYellowCardDetail } from "@/lib/match/card-event-detail"
import { filterDisplayFixtureEvents } from "@/lib/match/fixture-event-filters"

export type CardEventRow = {
  player_id: number | null
  type: string
  detail: string | null
  minute: number
  extra_minute: number | null
}

export type PlayerCardCounts = {
  yellowCards: number
  redCards: number
}

function countsForPlayer(
  map: Map<number, PlayerCardCounts>,
  playerId: number,
): PlayerCardCounts {
  return map.get(playerId) ?? { yellowCards: 0, redCards: 0 }
}

/** Yellow and red cards per player from synced fixture_events. */
export function buildCardCountsMap(
  events: CardEventRow[],
): Map<number, PlayerCardCounts> {
  const map = new Map<number, PlayerCardCounts>()

  for (const event of filterDisplayFixtureEvents(events)) {
    if (event.type !== "Card") continue
    if (event.player_id == null) continue

    const current = countsForPlayer(map, event.player_id)

    if (isYellowCardDetail(event.detail)) {
      current.yellowCards += 1
    } else if (isRedCardDetail(event.detail)) {
      current.redCards += 1
    }

    map.set(event.player_id, current)
  }

  return map
}

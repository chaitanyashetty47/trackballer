import { mapPlayerBrowseRow, type PlayerBrowseRow } from "./player-map"
import type { PlayerListItem } from "./types"

export function sortByHighestRated(players: PlayerListItem[]): PlayerListItem[] {
  return [...players].sort(
    (a, b) =>
      b.displayScore - a.displayScore ||
      a.displayName.localeCompare(b.displayName),
  )
}

export function mapAndSortPlayerRows(rows: unknown[]): PlayerListItem[] {
  const byId = new Map<number, PlayerListItem>()

  for (const row of rows) {
    const mapped = mapPlayerBrowseRow(row as PlayerBrowseRow)
    const existing = byId.get(mapped.id)
    if (!existing || mapped.displayScore > existing.displayScore) {
      byId.set(mapped.id, mapped)
    }
  }

  return sortByHighestRated([...byId.values()])
}

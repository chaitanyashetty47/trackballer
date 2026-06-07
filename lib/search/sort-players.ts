import { mapPlayerBrowseRow, type PlayerBrowseRow } from "./player-map"
import type { PlayerBrowseSort, PlayerListItem } from "./types"

export function sortPlayers(
  players: PlayerListItem[],
  sort: PlayerBrowseSort = "rating-desc",
): PlayerListItem[] {
  const ratingOrder = sort === "rating-asc" ? 1 : -1

  return [...players].sort(
    (a, b) =>
      ratingOrder * (a.displayScore - b.displayScore) ||
      a.displayName.localeCompare(b.displayName),
  )
}

/** @deprecated Use sortPlayers with an explicit sort option. */
export function sortByHighestRated(players: PlayerListItem[]): PlayerListItem[] {
  return sortPlayers(players, "rating-desc")
}

export function mapAndSortPlayerRows(
  rows: unknown[],
  sort: PlayerBrowseSort = "rating-desc",
): PlayerListItem[] {
  const byId = new Map<number, PlayerListItem>()

  for (const row of rows) {
    const mapped = mapPlayerBrowseRow(row as PlayerBrowseRow)
    const existing = byId.get(mapped.id)
    if (!existing || mapped.displayScore > existing.displayScore) {
      byId.set(mapped.id, mapped)
    }
  }

  return sortPlayers([...byId.values()], sort)
}

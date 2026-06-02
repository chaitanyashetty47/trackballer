import type { MatchLineupPlayer } from "@/lib/match/types"

export type FormationRow = {
  row: number
  players: MatchLineupPlayer[]
}

/** Groups starters into formation lines (GK first), sorted left to right within each line. */
export function buildFormationRows(players: MatchLineupPlayer[]): FormationRow[] {
  const byRow = new Map<number, MatchLineupPlayer[]>()
  for (const player of players) {
    const line = byRow.get(player.gridRow) ?? []
    line.push(player)
    byRow.set(player.gridRow, line)
  }

  return [...byRow.entries()]
    .sort(([a], [b]) => a - b)
    .map(([row, line]) => ({
      row,
      players: [...line].sort((a, b) => a.gridCol - b.gridCol),
    }))
}

/** Builds a "4-2-3-1" style label from the outfield lines (excludes the keeper line). */
export function formationLabel(rows: FormationRow[]): string | null {
  const outfield = rows.filter((r) => r.row > 1)
  if (outfield.length === 0) return null
  return outfield.map((r) => r.players.length).join("-")
}

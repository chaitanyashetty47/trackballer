export type PitchSide = "home" | "away"

export type GridSlot = {
  /** Formation line: 1 = goalkeeper, 2 = first defensive line, increasing toward attack. */
  row: number
  /** Position within the line (1-based, left to right from API-Football). */
  col: number
}

const UNKNOWN_ROW = 99

/**
 * Parses an API-Football "row:col" grid string into a formation slot.
 * Players without a usable grid fall into a single shared row so they
 * still render in one tidy line instead of stacking on each other.
 */
export function parseGridSlot(grid: string | null, fallbackIndex: number): GridSlot {
  if (grid) {
    const parts = grid.split(":")
    if (parts.length === 2) {
      const row = Number(parts[0])
      const col = Number(parts[1])
      if (Number.isFinite(row) && Number.isFinite(col) && row >= 1 && col >= 1) {
        return { row, col }
      }
    }
  }
  return { row: UNKNOWN_ROW, col: fallbackIndex + 1 }
}

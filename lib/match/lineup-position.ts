export type PitchSide = "home" | "away"

export type PitchPosition = {
  leftPct: number
  topPct: number
}

/**
 * Maps API-Football grid "row:col" to vertical pitch percentages.
 * Home occupies the top half; away the bottom half.
 */
export function gridToPitchPosition(
  grid: string | null,
  side: PitchSide,
  fallbackIndex: number,
): PitchPosition {
  const parsed = grid ? parseGrid(grid) : null
  if (parsed) {
    const rowSpan = 4
    const colSpan = 4
    const rowNorm = (parsed.row - 1) / rowSpan
    const colNorm = (parsed.col - 1) / colSpan

    if (side === "home") {
      return {
        leftPct: 12 + colNorm * 76,
        topPct: 8 + rowNorm * 38,
      }
    }
    return {
      leftPct: 12 + colNorm * 76,
      topPct: 92 - rowNorm * 38,
    }
  }

  const col = fallbackIndex % 4
  const row = Math.floor(fallbackIndex / 4)
  if (side === "home") {
    return { leftPct: 15 + col * 22, topPct: 12 + row * 10 }
  }
  return { leftPct: 15 + col * 22, topPct: 78 - row * 10 }
}

function parseGrid(grid: string): { row: number; col: number } | null {
  const parts = grid.split(":")
  if (parts.length !== 2) return null
  const row = Number(parts[0])
  const col = Number(parts[1])
  if (!Number.isFinite(row) || !Number.isFinite(col) || row < 1 || col < 1) {
    return null
  }
  return { row, col }
}

/** API-Football Card row: detail "Yellow Card". */
export function isYellowCardDetail(detail: string | null | undefined): boolean {
  if (!detail) return false
  return detail.toLowerCase() === "yellow card"
}

/** Direct red or second-yellow sending off ("Yellow-Red Card"). */
export function isRedCardDetail(detail: string | null | undefined): boolean {
  if (!detail) return false
  const normalized = detail.toLowerCase()
  if (normalized === "red card") return true
  return normalized.includes("yellow-red")
}

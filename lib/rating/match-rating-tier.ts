export type MatchRatingTier =
  | "empty"
  | "maroon"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"

/** FotMob-style band for a match rating (1–10). */
export function getMatchRatingTier(value: number | null | undefined): MatchRatingTier {
  if (value == null || Number.isNaN(value)) return "empty"
  if (value >= 9) return "blue"
  if (value >= 7) return "green"
  if (value >= 6) return "yellow"
  if (value >= 5) return "orange"
  if (value >= 3) return "red"
  if (value >= 1) return "maroon"
  return "empty"
}

const TIER_CHIP_CLASS: Record<MatchRatingTier, string> = {
  empty: "border-border bg-card text-foreground",
  maroon: "border-red-950/50 bg-red-950 text-white",
  red: "border-red-600/40 bg-red-500 text-white",
  orange: "border-orange-600/40 bg-orange-500 text-white",
  yellow: "border-yellow-500/50 bg-yellow-400 text-yellow-950",
  green: "border-emerald-600/40 bg-emerald-500 text-white",
  blue: "border-sky-600/40 bg-sky-500 text-white",
}

export function matchRatingTierChipClass(value: number | null | undefined): string {
  return TIER_CHIP_CLASS[getMatchRatingTier(value)]
}

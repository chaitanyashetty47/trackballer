/** DB tier slugs from player_career_aggregates.tier */
export type CareerTierSlug =
  | "provisional"
  | "elite"
  | "world_class"
  | "great"
  | "good"
  | "average"
  | "below_average"
  | "bad"
  | "unwatchable"

const TIER_LABELS: Record<CareerTierSlug, string> = {
  provisional: "Provisional",
  elite: "Elite",
  world_class: "World Class",
  great: "Great",
  good: "Good",
  average: "Average",
  below_average: "Below Average",
  bad: "Bad",
  unwatchable: "Unwatchable",
}

/** CSS custom property names (--rating-elite, etc.) */
const TIER_CSS_VARS: Record<CareerTierSlug, string> = {
  provisional: "--rating-provisional",
  elite: "--rating-elite",
  world_class: "--rating-world-class",
  great: "--rating-great",
  good: "--rating-good",
  average: "--rating-average",
  below_average: "--rating-below-average",
  bad: "--rating-bad",
  unwatchable: "--rating-unwatchable",
}

export function normalizeCareerTierSlug(tier: string | null | undefined): CareerTierSlug {
  const key = tier?.trim().toLowerCase()
  if (key && key in TIER_LABELS) return key as CareerTierSlug
  return "provisional"
}

export function careerTierLabel(tier: string | null | undefined): string {
  return TIER_LABELS[normalizeCareerTierSlug(tier)]
}

export function careerTierCssVar(tier: string | null | undefined): string {
  return TIER_CSS_VARS[normalizeCareerTierSlug(tier)]
}

/** Locked thresholds from DATABASE.md — used when blending kicks in (Slice 8). */
export function tierForScore(score: number): CareerTierSlug {
  if (score >= 9) return "elite"
  if (score >= 8) return "world_class"
  if (score >= 7) return "great"
  if (score >= 6) return "good"
  if (score >= 5) return "average"
  if (score >= 4) return "below_average"
  if (score >= 3) return "bad"
  return "unwatchable"
}

/**
 * Public career score switches from FM-only to blended once votes reach 10.
 * Blend formula: 20% community mean + 80% FM base.
 */
export function careerBlend(
  meanUserRating: number | null | undefined,
  fmBase: number | null | undefined,
  voteCount: number,
): number {
  const fm = fmBase ?? 5
  if (voteCount < 10 || meanUserRating == null) return fm
  return Math.round((meanUserRating * 0.2 + fm * 0.8) * 100) / 100
}

/** One decimal on the career ring card (wireframe). */
export function formatCareerScore(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—"
  return value.toFixed(1)
}

export const PROVISIONAL_CAREER_COPY =
  "Provisional · Base Rating until 10 community ratings"

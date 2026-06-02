/** Mean of match rating values; null when empty. */
export function matchAverage(values: number[]): number | null {
  if (values.length === 0) return null
  const sum = values.reduce((acc, v) => acc + v, 0)
  return Math.round((sum / values.length) * 100) / 100
}

/** True when value is 1–10 in 0.5 steps. */
export function isValidRatingValue(value: number): boolean {
  if (value < 1 || value > 10) return false
  return Math.abs(value * 2 - Math.round(value * 2)) < 1e-9
}

/** Display string for aggregate chips (e.g. 8.17). */
export function formatMatchAggregate(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—"
  return value.toFixed(2)
}

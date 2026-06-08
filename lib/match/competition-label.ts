/** e.g. "World Cup · Final 2022" */
export function buildCompetitionLabel(
  leagueName: string | null | undefined,
  roundName: string | null | undefined,
  seasonYear: number | null | undefined,
): string | null {
  const parts: string[] = []
  if (leagueName?.trim()) parts.push(leagueName.trim())
  if (roundName?.trim()) parts.push(roundName.trim())

  let label = parts.join(" · ")
  if (seasonYear != null) {
    label = label ? `${label} ${seasonYear}` : String(seasonYear)
  }

  return label || null
}

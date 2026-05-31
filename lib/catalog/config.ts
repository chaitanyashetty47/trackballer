import { DEFAULT_LEAGUE_ID, DEFAULT_SEASON_YEAR } from "@/lib/catalog-sync/constants"

export function getCatalogLeagueId(): number {
  const raw = process.env.API_FOOTBALL_LEAGUE_ID
  if (!raw) return DEFAULT_LEAGUE_ID
  const id = Number(raw)
  return Number.isFinite(id) ? id : DEFAULT_LEAGUE_ID
}

export function getCatalogSeasonYear(): number {
  const raw = process.env.API_FOOTBALL_SEASON
  if (!raw) return DEFAULT_SEASON_YEAR
  const year = Number(raw)
  return Number.isFinite(year) ? year : DEFAULT_SEASON_YEAR
}

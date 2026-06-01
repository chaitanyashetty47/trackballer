import { cache } from "react"

import { TERMINAL_STATUSES } from "@/lib/catalog-sync/constants"
import { getCatalogLeagueId, getCatalogSeasonYear } from "@/lib/catalog/config"
import type {
  FixtureWithTeams,
  GetFixturesOptions,
  RoundRow,
  SeasonRow,
} from "@/lib/catalog/types"
import { createClient } from "@/lib/supabase/server"

export const FIXTURE_TEAM_SELECT = `
  id,
  season_id,
  round_id,
  round_name,
  home_team_id,
  away_team_id,
  venue,
  kickoff_at,
  status_short,
  status_long,
  home_goals_ft,
  away_goals_ft,
  home_goals_et,
  away_goals_et,
  home_goals_pen,
  away_goals_pen,
  winner_team_id,
  ratings_unlocked_at,
  lineups_synced_at,
  appearances_synced_at,
  home_team:teams!fixtures_home_team_id_fkey(id, name, logo_url, code),
  away_team:teams!fixtures_away_team_id_fkey(id, name, logo_url, code)
`

const TERMINAL_LIST = [...TERMINAL_STATUSES]

export function mapFixtureRow(row: unknown): FixtureWithTeams | null {
  if (!row || typeof row !== "object") return null
  const r = row as Record<string, unknown>
  const home = r.home_team
  const away = r.away_team
  if (!home || !away || typeof home !== "object" || typeof away !== "object") {
    return null
  }
  return row as FixtureWithTeams
}

async function fetchFixtures(
  options: GetFixturesOptions & {
    kickoffOrder: "asc" | "desc"
    terminalOnly?: boolean
    upcomingOnly?: boolean
  },
): Promise<FixtureWithTeams[]> {
  const supabase = await createClient()
  let query = supabase
    .from("fixtures")
    .select(FIXTURE_TEAM_SELECT)
    .eq("season_id", options.seasonId)

  if (options.roundName) {
    query = query.eq("round_name", options.roundName)
  }
  if (options.statusShort) {
    query = query.eq("status_short", options.statusShort)
  }
  if (options.terminalOnly) {
    query = query.in("status_short", TERMINAL_LIST)
  }
  if (options.upcomingOnly) {
    const quoted = TERMINAL_LIST.map((s) => `"${s}"`).join(",")
    query = query.not("status_short", "in", `(${quoted})`)
  }

  query = query.order("kickoff_at", { ascending: options.kickoffOrder === "asc" })

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("fetchFixtures failed:", error.message)
    return []
  }

  return (data ?? [])
    .map(mapFixtureRow)
    .filter((row): row is FixtureWithTeams => row !== null)
}

export const getWorldCupSeason = cache(async (): Promise<SeasonRow | null> => {
  const supabase = await createClient()
  const leagueId = getCatalogLeagueId()
  const year = getCatalogSeasonYear()

  const { data, error } = await supabase
    .from("seasons")
    .select("id, league_id, year, is_current")
    .eq("league_id", leagueId)
    .eq("year", year)
    .maybeSingle()

  if (error) {
    console.error("getWorldCupSeason failed:", error.message)
    return null
  }

  return data
})

export const getRounds = cache(async (seasonId: number): Promise<RoundRow[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("rounds")
    .select("id, season_id, name, sort_order")
    .eq("season_id", seasonId)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true })

  if (error) {
    console.error("getRounds failed:", error.message)
    return []
  }

  return data ?? []
})

export const getFixtures = cache(
  async (options: GetFixturesOptions): Promise<FixtureWithTeams[]> => {
    return fetchFixtures({
      ...options,
      kickoffOrder: "asc",
    })
  },
)

export const getUpcomingFixtures = cache(
  async (
    seasonId: number,
    options?: { roundName?: string; limit?: number },
  ): Promise<FixtureWithTeams[]> => {
    return fetchFixtures({
      seasonId,
      roundName: options?.roundName,
      limit: options?.limit ?? 20,
      kickoffOrder: "asc",
      upcomingOnly: true,
    })
  },
)

export const getLatestResults = cache(
  async (
    seasonId: number,
    options?: { roundName?: string; limit?: number },
  ): Promise<FixtureWithTeams[]> => {
    return fetchFixtures({
      seasonId,
      roundName: options?.roundName,
      limit: options?.limit ?? 20,
      kickoffOrder: "desc",
      terminalOnly: true,
    })
  },
)

export const getFixtureCount = cache(
  async (seasonId?: number): Promise<number | null> => {
    const supabase = await createClient()
    let query = supabase
      .from("fixtures")
      .select("*", { count: "exact", head: true })

    if (seasonId !== undefined) {
      query = query.eq("season_id", seasonId)
    }

    const { count, error } = await query

    if (error) {
      console.error("getFixtureCount failed:", error.message)
      return null
    }

    return count
  },
)

/** Loads season + rounds in one pass for hub pages. */
export const getWorldCupCatalogContext = cache(async () => {
  const season = await getWorldCupSeason()
  if (!season) {
    return { season: null, rounds: [], fixtureCount: null as number | null }
  }

  const [rounds, fixtureCount] = await Promise.all([
    getRounds(season.id),
    getFixtureCount(season.id),
  ])

  return { season, rounds, fixtureCount }
})

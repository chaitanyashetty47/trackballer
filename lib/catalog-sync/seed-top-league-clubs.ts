import type { SupabaseClient } from "@supabase/supabase-js"

import type { ApiFootballClient } from "@/lib/api-football/client"
import type { Database } from "@/lib/database.types"
import { mapClubFromLeague } from "@/lib/catalog-sync/mappers"

type Db = SupabaseClient<Database>

export type TopLeagueDefinition = {
  id: number
  name: string
  slug: string
  country: string
}

/** API-Football league ids for onboarding club pickers (stable in v3). */
export const TOP_LEAGUE_CLUBS: TopLeagueDefinition[] = [
  { id: 39, name: "Premier League", slug: "premier-league", country: "England" },
  { id: 140, name: "La Liga", slug: "la-liga", country: "Spain" },
  { id: 135, name: "Serie A", slug: "serie-a", country: "Italy" },
  { id: 78, name: "Bundesliga", slug: "bundesliga", country: "Germany" },
  { id: 61, name: "Ligue 1", slug: "ligue-1", country: "France" },
]

export type TopLeagueClubsSeedResult = {
  seasonYear: number
  leaguesUpserted: number
  teamsUpserted: number
  byLeague: Array<{
    leagueId: number
    slug: string
    teamsFromApi: number
  }>
}

function dedupeById<T extends { id: number }>(rows: T[]): T[] {
  const map = new Map<number, T>()
  for (const row of rows) {
    map.set(row.id, row)
  }
  return [...map.values()]
}

export async function seedTopLeagueClubs(
  db: Db,
  api: ApiFootballClient,
  seasonYear: number,
): Promise<TopLeagueClubsSeedResult> {
  const leagueRows: Database["public"]["Tables"]["leagues"]["Insert"][] =
    TOP_LEAGUE_CLUBS.map((league) => ({
      id: league.id,
      name: league.name,
      slug: league.slug,
      country: league.country,
      logo_url: null,
      is_active: false,
    }))

  const { error: leagueError } = await db.from("leagues").upsert(leagueRows, {
    onConflict: "id",
  })
  if (leagueError) throw leagueError

  const byLeague: TopLeagueClubsSeedResult["byLeague"] = []
  const allTeams: Database["public"]["Tables"]["teams"]["Insert"][] = []

  for (const league of TOP_LEAGUE_CLUBS) {
    const teamsRes = await api.getTeams(league.id, seasonYear)
    const teamRows = teamsRes.response.map(mapClubFromLeague)
    allTeams.push(...teamRows)
    byLeague.push({
      leagueId: league.id,
      slug: league.slug,
      teamsFromApi: teamRows.length,
    })
  }

  const uniqueTeams = dedupeById(allTeams)
  if (uniqueTeams.length > 0) {
    const { error: teamError } = await db.from("teams").upsert(uniqueTeams, {
      onConflict: "id",
    })
    if (teamError) throw teamError
  }

  return {
    seasonYear,
    leaguesUpserted: leagueRows.length,
    teamsUpserted: uniqueTeams.length,
    byLeague,
  }
}

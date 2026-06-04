import { cache } from "react"

import { getWorldCupSeason } from "@/lib/catalog/fixtures"
import { createClient } from "@/lib/supabase/server"

import type {
  BrowseClubOption,
  BrowseFilterOptions,
  BrowseNationalTeamOption,
} from "./types"

const POSITION_OPTIONS = ["GK", "DEF", "MID", "FWD"] as const
const ROW_PAGE = 1000

export const browsePositions = [...POSITION_OPTIONS]

export const getBrowseFilterOptions = cache(async (): Promise<BrowseFilterOptions> => {
  const supabase = await createClient()
  const season = await getWorldCupSeason()

  const [clubs, nationalTeams] = await Promise.all([
    loadClubOptions(supabase),
    loadNationalTeamOptions(supabase),
  ])

  return {
    nationalTeams,
    positions: [...POSITION_OPTIONS],
    clubs,
    leagueLabel: season ? `World Cup ${season.year}` : "World Cup",
    seasonId: season?.id ?? null,
  }
})

async function loadClubOptions(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<BrowseClubOption[]> {
  const byId = new Map<number, BrowseClubOption>()

  const { data: seededClubs, error: seededError } = await supabase
    .from("teams")
    .select("id, name, logo_url, code")
    .eq("is_national", false)
    .order("name", { ascending: true })

  if (seededError) {
    console.error("loadClubOptions seeded:", seededError.message)
  } else {
    for (const row of seededClubs ?? []) {
      byId.set(row.id, row)
    }
  }

  let from = 0
  while (true) {
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select(
        "club_team_id, club_team:teams!players_club_team_id_fkey(id, name, logo_url, code)",
      )
      .not("club_team_id", "is", null)
      .range(from, from + ROW_PAGE - 1)

    if (playersError) {
      console.error("loadClubOptions players:", playersError.message)
      break
    }

    for (const row of players ?? []) {
      const club = row.club_team as BrowseClubOption | null
      if (club?.id) byId.set(club.id, club)
    }

    if (!players || players.length < ROW_PAGE) break
    from += ROW_PAGE
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
}

async function loadNationalTeamOptions(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<BrowseNationalTeamOption[]> {
  const byId = new Map<number, BrowseNationalTeamOption>()

  const { data: seededNations, error: seededError } = await supabase
    .from("teams")
    .select("id, name, logo_url, code")
    .eq("is_national", true)
    .order("name", { ascending: true })

  if (seededError) {
    console.error("loadNationalTeamOptions seeded:", seededError.message)
  } else {
    for (const row of seededNations ?? []) {
      byId.set(row.id, row)
    }
  }

  let from = 0
  while (true) {
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select(
        "national_team_id, national_team:teams!players_national_team_id_fkey(id, name, logo_url, code)",
      )
      .not("national_team_id", "is", null)
      .range(from, from + ROW_PAGE - 1)

    if (playersError) {
      console.error("loadNationalTeamOptions players:", playersError.message)
      break
    }

    for (const row of players ?? []) {
      const team = row.national_team as BrowseNationalTeamOption | null
      if (team?.id) byId.set(team.id, team)
    }

    if (!players || players.length < ROW_PAGE) break
    from += ROW_PAGE
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
}

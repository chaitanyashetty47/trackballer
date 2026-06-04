import { cache } from "react"

import { createClient } from "@/lib/supabase/server"

const FIXTURE_ID_CHUNK = 80
const ROW_PAGE = 1000

/** Squads plus anyone who appeared in a season fixture (lineups / minutes). */
export function mergeSeasonPlayerIds(...lists: number[][]): number[] {
  return [...new Set(lists.flat())]
}

async function fetchFixtureIdsForSeason(
  supabase: Awaited<ReturnType<typeof createClient>>,
  seasonId: number,
): Promise<number[]> {
  const { data, error } = await supabase
    .from("fixtures")
    .select("id")
    .eq("season_id", seasonId)

  if (error) {
    console.error("fetchFixtureIdsForSeason failed:", error.message)
    return []
  }

  return (data ?? []).map((row) => row.id)
}

async function fetchPlayerIdsFromFixtureTable(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "fixture_appearances" | "fixture_lineups",
  fixtureIds: number[],
): Promise<number[]> {
  if (fixtureIds.length === 0) return []

  const ids = new Set<number>()

  for (let i = 0; i < fixtureIds.length; i += FIXTURE_ID_CHUNK) {
    const fixtureChunk = fixtureIds.slice(i, i + FIXTURE_ID_CHUNK)
    let from = 0

    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select("player_id")
        .in("fixture_id", fixtureChunk)
        .range(from, from + ROW_PAGE - 1)

      if (error) {
        console.error(`fetchPlayerIdsFromFixtureTable ${table}:`, error.message)
        break
      }

      for (const row of data ?? []) {
        ids.add(row.player_id)
      }

      if (!data || data.length < ROW_PAGE) break
      from += ROW_PAGE
    }
  }

  return [...ids]
}

export const getSeasonPlayerIds = cache(async (seasonId: number): Promise<number[]> => {
  const supabase = await createClient()

  const [squadRes, fixtureIds] = await Promise.all([
    supabase.from("player_season_squads").select("player_id").eq("season_id", seasonId),
    fetchFixtureIdsForSeason(supabase, seasonId),
  ])

  if (squadRes.error) {
    console.error("getSeasonPlayerIds squads failed:", squadRes.error.message)
  }

  const squadIds = [...new Set((squadRes.data ?? []).map((row) => row.player_id))]

  const [appearanceIds, lineupIds] = await Promise.all([
    fetchPlayerIdsFromFixtureTable(supabase, "fixture_appearances", fixtureIds),
    fetchPlayerIdsFromFixtureTable(supabase, "fixture_lineups", fixtureIds),
  ])

  return mergeSeasonPlayerIds(squadIds, appearanceIds, lineupIds)
})

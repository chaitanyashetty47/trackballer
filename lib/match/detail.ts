import { cache } from "react"

import { FIXTURE_TEAM_SELECT, mapFixtureRow } from "@/lib/catalog/fixtures"
import type { FixtureWithTeams } from "@/lib/catalog/types"
import { gridToPitchPosition } from "@/lib/match/lineup-position"
import type { MatchDetail, MatchLineupPlayer } from "@/lib/match/types"
import { createClient } from "@/lib/supabase/server"

type LineupRow = {
  player_id: number
  team_id: number
  is_starter: boolean
  shirt_number: number | null
  grid: string | null
  players: { id: number; name: string } | null
}

type AppearanceRow = {
  player_id: number
  is_rateable: boolean | null
  is_starter: boolean
  minutes_played: number
}

type AggregateRow = {
  player_id: number
  avg_rating: number | null
  rating_count: number
}

type UserRatingRow = {
  player_id: number
  value: number
}

export const getMatchDetail = cache(
  async (fixtureId: number): Promise<MatchDetail | null> => {
    const supabase = await createClient()

    const { data: fixtureRow, error: fixtureError } = await supabase
      .from("fixtures")
      .select(FIXTURE_TEAM_SELECT)
      .eq("id", fixtureId)
      .maybeSingle()

    if (fixtureError || !fixtureRow) {
      if (fixtureError) console.error("getMatchDetail fixture:", fixtureError.message)
      return null
    }

    const fixture = mapFixtureRow(fixtureRow)
    if (!fixture) return null

    const [
      { data: lineupRows },
      { data: appearanceRows },
      { data: aggregateRows },
      userRatingsResult,
    ] = await Promise.all([
      supabase
        .from("fixture_lineups")
        .select(
          "player_id, team_id, is_starter, shirt_number, grid, players(id, name)",
        )
        .eq("fixture_id", fixtureId),
      supabase
        .from("fixture_appearances")
        .select("player_id, is_rateable, is_starter, minutes_played")
        .eq("fixture_id", fixtureId),
      supabase
        .from("player_match_aggregates")
        .select("player_id, avg_rating, rating_count")
        .eq("fixture_id", fixtureId),
      loadUserRatings(supabase, fixtureId),
    ])

    const appearanceByPlayer = new Map<number, AppearanceRow>()
    for (const row of appearanceRows ?? []) {
      appearanceByPlayer.set(row.player_id, row)
    }

    const aggregateByPlayer = new Map<number, AggregateRow>()
    for (const row of aggregateRows ?? []) {
      aggregateByPlayer.set(row.player_id, row)
    }

    const userRatingByPlayer = userRatingsResult

    const starters: MatchLineupPlayer[] = []
    const substitutes: MatchLineupPlayer[] = []
    const rateableQueue: MatchLineupPlayer[] = []

    const sortedLineups = [...(lineupRows ?? [])].sort((a, b) => {
      if (a.is_starter !== b.is_starter) return a.is_starter ? -1 : 1
      return (a.shirt_number ?? 99) - (b.shirt_number ?? 99)
    })

    let homeStarterIdx = 0
    let awayStarterIdx = 0
    let homeSubIdx = 0
    let awaySubIdx = 0

    for (const row of sortedLineups) {
      const lineupRow = row as LineupRow
      const side =
        lineupRow.team_id === fixture.home_team_id
          ? "home"
          : lineupRow.team_id === fixture.away_team_id
            ? "away"
            : null
      if (!side) continue

      const fallbackIndex = lineupRow.is_starter
        ? side === "home"
          ? homeStarterIdx++
          : awayStarterIdx++
        : side === "home"
          ? homeSubIdx++
          : awaySubIdx++

      const mapped = mapLineupPlayer(
        lineupRow,
        side,
        fallbackIndex,
        appearanceByPlayer,
        aggregateByPlayer,
        userRatingByPlayer,
      )
      if (!mapped) continue

      if (mapped.isStarter) {
        starters.push(mapped)
      } else {
        substitutes.push(mapped)
      }
      if (mapped.isRateable) {
        rateableQueue.push(mapped)
      }
    }

    rateableQueue.sort((a, b) => {
      if (a.isStarter !== b.isStarter) return a.isStarter ? -1 : 1
      if (a.side !== b.side) return a.side === "home" ? -1 : 1
      return (a.shirtNumber ?? 99) - (b.shirtNumber ?? 99)
    })

    return {
      fixture,
      ratingsUnlocked: fixture.ratings_unlocked_at != null,
      hasLineups: starters.length > 0,
      starters,
      substitutes,
      rateableQueue,
    }
  },
)

async function loadUserRatings(
  supabase: Awaited<ReturnType<typeof createClient>>,
  fixtureId: number,
): Promise<Map<number, number>> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const map = new Map<number, number>()
  if (!user) return map

  const { data } = await supabase
    .from("match_ratings")
    .select("player_id, value")
    .eq("fixture_id", fixtureId)
    .eq("user_id", user.id)

  for (const row of (data ?? []) as UserRatingRow[]) {
    map.set(row.player_id, Number(row.value))
  }
  return map
}

function mapLineupPlayer(
  row: LineupRow,
  side: "home" | "away",
  fallbackIndex: number,
  appearanceByPlayer: Map<number, AppearanceRow>,
  aggregateByPlayer: Map<number, AggregateRow>,
  userRatingByPlayer: Map<number, number>,
): MatchLineupPlayer | null {
  const player = row.players
  if (!player) return null

  const appearance = appearanceByPlayer.get(row.player_id)
  const isRateable = appearance?.is_rateable === true
  const aggregate = aggregateByPlayer.get(row.player_id)

  return {
    playerId: row.player_id,
    name: player.name,
    shirtNumber: row.shirt_number,
    side,
    teamId: row.team_id,
    isStarter: row.is_starter,
    isRateable,
    position: gridToPitchPosition(row.grid, side, fallbackIndex),
    communityAvg: aggregate?.avg_rating != null ? Number(aggregate.avg_rating) : null,
    ratingCount: aggregate?.rating_count ?? 0,
    userRating: userRatingByPlayer.get(row.player_id) ?? null,
  }
}

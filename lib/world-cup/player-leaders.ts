import { cache } from "react"

import { getLatestResults } from "@/lib/catalog/fixtures"
import { getTrendingPlayers } from "@/lib/home/trending-players"
import { createClient } from "@/lib/supabase/server"

import type { WcPlayerLeaderRow, WcPlayerLeaders } from "./player-leader-types"

const RECENT_FIXTURE_LIMIT = 5
const MIN_RATING_COUNT = 3
const MIN_QUALIFYING_PLAYERS = 3
const LEADER_LIMIT = 5

type AggregateRow = {
  player_id: number
  avg_rating: number | null
  rating_count: number
}

type PlayerMetaRow = {
  id: number
  name: string
  photo_url: string | null
  nationality: string | null
}

export function rankRecentMatchLeaders(
  rows: AggregateRow[],
): { playerId: number; score: number; totalVotes: number }[] {
  const byPlayer = new Map<number, { weightedSum: number; totalVotes: number }>()

  for (const row of rows) {
    if (row.rating_count < MIN_RATING_COUNT || row.avg_rating == null) continue

    const bucket = byPlayer.get(row.player_id) ?? { weightedSum: 0, totalVotes: 0 }
    bucket.weightedSum += Number(row.avg_rating) * row.rating_count
    bucket.totalVotes += row.rating_count
    byPlayer.set(row.player_id, bucket)
  }

  return [...byPlayer.entries()]
    .map(([playerId, { weightedSum, totalVotes }]) => ({
      playerId,
      score: Math.round((weightedSum / totalVotes) * 100) / 100,
      totalVotes,
    }))
    .sort((a, b) => b.score - a.score || b.totalVotes - a.totalVotes)
}

async function loadPlayerMeta(playerIds: number[]): Promise<Map<number, PlayerMetaRow>> {
  if (playerIds.length === 0) return new Map()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("players")
    .select("id, name, photo_url, nationality")
    .in("id", playerIds)

  if (error) {
    console.error("loadPlayerMeta failed:", error.message)
    return new Map()
  }

  return new Map((data ?? []).map((row) => [row.id, row as PlayerMetaRow]))
}

async function fetchRecentMatchLeaders(seasonId: number): Promise<WcPlayerLeaderRow[]> {
  const fixtures = await getLatestResults(seasonId, { limit: RECENT_FIXTURE_LIMIT })
  if (fixtures.length === 0) return []

  const fixtureIds = fixtures.map((f) => f.id)
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("player_match_aggregates")
    .select("player_id, avg_rating, rating_count")
    .in("fixture_id", fixtureIds)

  if (error) {
    console.error("fetchRecentMatchLeaders aggregates failed:", error.message)
    return []
  }

  const ranked = rankRecentMatchLeaders((data ?? []) as AggregateRow[]).slice(0, LEADER_LIMIT)
  if (ranked.length < MIN_QUALIFYING_PLAYERS) return []

  const meta = await loadPlayerMeta(ranked.map((r) => r.playerId))

  const leaders: WcPlayerLeaderRow[] = []
  for (const row of ranked) {
    const player = meta.get(row.playerId)
    if (!player) continue
    leaders.push({
      id: player.id,
      name: player.name,
      photoUrl: player.photo_url,
      nationality: player.nationality,
      score: row.score,
      careerTier: null,
    })
  }

  return leaders.length >= MIN_QUALIFYING_PLAYERS ? leaders : []
}

async function fetchTrendingLeaders(): Promise<WcPlayerLeaderRow[]> {
  const trending = await getTrendingPlayers()
  const picks = trending.slice(0, LEADER_LIMIT)
  if (picks.length === 0) return []

  const ids = picks.map((p) => p.id)
  const meta = await loadPlayerMeta(ids)

  return picks.map((p) => {
    const player = meta.get(p.id)
    return {
      id: p.id,
      name: player?.name ?? p.name,
      photoUrl: player?.photo_url ?? p.photoUrl,
      nationality: player?.nationality ?? null,
      score: p.displayScore,
      careerTier: p.tier,
    }
  })
}

export const getWorldCupPlayerLeaders = cache(
  async (seasonId: number): Promise<WcPlayerLeaders> => {
    const recent = await fetchRecentMatchLeaders(seasonId)
    if (recent.length >= MIN_QUALIFYING_PLAYERS) {
      return { mode: "recent", players: recent }
    }

    const trending = await fetchTrendingLeaders()
    return { mode: "trending", players: trending }
  },
)

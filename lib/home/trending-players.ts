import { cache } from "react"

import { formatPlayerDisplayName } from "@/lib/player/display-name"
import { createClient } from "@/lib/supabase/server"

import { sevenDaysAgoIso } from "./dates"
import type { TrendingPlayerCard } from "./types"

const TRENDING_LIMIT = 8

const PLAYER_SELECT = `
  id,
  name,
  firstname,
  lastname,
  photo_url,
  career:player_career_aggregates(display_score, tier, is_provisional, vote_count)
`

type PlayerRow = {
  id: number
  name: string
  firstname: string | null
  lastname: string | null
  photo_url: string | null
  career: {
    display_score: number
    tier: string
    is_provisional: boolean
    vote_count: number
  } | null
}

function mapPlayerRow(row: PlayerRow): TrendingPlayerCard {
  return {
    id: row.id,
    displayName: formatPlayerDisplayName(row.firstname, row.lastname, row.name),
    photoUrl: row.photo_url,
    tier: row.career?.tier ?? "provisional",
    displayScore: row.career ? Number(row.career.display_score) : 0,
    isProvisional: row.career?.is_provisional ?? true,
  }
}

function isPinnedActive(startsAt: string | null, endsAt: string | null, now: Date): boolean {
  if (startsAt && new Date(startsAt) > now) return false
  if (endsAt && new Date(endsAt) <= now) return false
  return true
}

async function fetchPinnedPlayers(now: Date): Promise<TrendingPlayerCard[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("featured_trending_players")
    .select(`sort_order, starts_at, ends_at, player:players!featured_trending_players_player_id_fkey(${PLAYER_SELECT})`)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("fetchPinnedPlayers failed:", error.message)
    return []
  }

  return (data ?? [])
    .filter((row) => isPinnedActive(row.starts_at, row.ends_at, now))
    .map((row) => row.player as PlayerRow | null)
    .filter((player): player is PlayerRow => player != null)
    .map(mapPlayerRow)
}

async function fetchCommentCountFallback(
  excludeIds: number[],
  limit: number,
): Promise<TrendingPlayerCard[]> {
  if (limit <= 0) return []

  const supabase = await createClient()
  const since = sevenDaysAgoIso()

  const { data, error } = await supabase
    .from("comments")
    .select("player_id")
    .eq("target_type", "player")
    .eq("is_deleted", false)
    .is("parent_id", null)
    .gte("created_at", since)
    .not("player_id", "is", null)

  if (error) {
    console.error("fetchCommentCountFallback failed:", error.message)
    return []
  }

  const counts = new Map<number, number>()
  for (const row of data ?? []) {
    if (row.player_id == null || excludeIds.includes(row.player_id)) continue
    counts.set(row.player_id, (counts.get(row.player_id) ?? 0) + 1)
  }

  const rankedIds = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([playerId]) => playerId)

  if (rankedIds.length === 0) return []

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select(PLAYER_SELECT)
    .in("id", rankedIds)

  if (playersError) {
    console.error("fetchCommentCountFallback players failed:", playersError.message)
    return []
  }

  const byId = new Map((players ?? []).map((row) => [row.id, row as PlayerRow]))
  return rankedIds
    .map((id) => byId.get(id))
    .filter((row): row is PlayerRow => row != null)
    .map(mapPlayerRow)
}

export const getTrendingPlayers = cache(async (): Promise<TrendingPlayerCard[]> => {
  const now = new Date()
  const pinned = await fetchPinnedPlayers(now)
  const excludeIds = pinned.map((player) => player.id)
  const fallback = await fetchCommentCountFallback(excludeIds, TRENDING_LIMIT - pinned.length)

  return [...pinned, ...fallback].slice(0, TRENDING_LIMIT)
})

import { cache } from "react"

import { formatPlayerDisplayName } from "@/lib/player/display-name"
import { createClient } from "@/lib/supabase/server"

import { sevenDaysAgoIso } from "./dates"
import type { TrendingCommentCard } from "./types"

const TRENDING_COMMENT_LIMIT = 3

const COMMENT_SELECT = `
  id,
  body,
  score,
  upvote_count,
  created_at,
  profile:profiles!comments_user_id_fkey(
    display_name,
    favourite_club:teams!profiles_favourite_club_id_fkey(logo_url)
  ),
  player:players!comments_player_id_fkey(id, name, firstname, lastname)
`

type CommentRow = {
  id: number
  body: string
  score: number
  upvote_count: number
  created_at: string
  profile: {
    display_name: string
    favourite_club: { logo_url: string | null } | null
  } | null
  player: {
    id: number
    name: string
    firstname: string | null
    lastname: string | null
  } | null
}

function mapCommentRow(row: CommentRow): TrendingCommentCard | null {
  if (!row.player) return null

  return {
    id: row.id,
    body: row.body,
    score: row.score,
    upvoteCount: row.upvote_count,
    createdAt: row.created_at,
    authorName: row.profile?.display_name ?? "user",
    authorClubLogoUrl: row.profile?.favourite_club?.logo_url ?? null,
    playerId: row.player.id,
    playerName: formatPlayerDisplayName(row.player.firstname, row.player.lastname, row.player.name),
  }
}

export const getTrendingComments = cache(async (): Promise<TrendingCommentCard[]> => {
  const supabase = await createClient()
  const since = sevenDaysAgoIso()

  const { data, error } = await supabase
    .from("comments")
    .select(COMMENT_SELECT)
    .eq("target_type", "player")
    .eq("is_deleted", false)
    .is("parent_id", null)
    .gte("created_at", since)
    .order("score", { ascending: false })
    .limit(TRENDING_COMMENT_LIMIT)

  if (error) {
    console.error("getTrendingComments failed:", error.message)
    return []
  }

  return (data ?? [])
    .map((row) => mapCommentRow(row as CommentRow))
    .filter((row): row is TrendingCommentCard => row != null)
})

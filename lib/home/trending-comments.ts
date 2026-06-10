import { cache } from "react"

import { COMMENT_PROFILE_SELECT } from "@/lib/comment/profile-select"
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
  user_id,
  profile:profiles!comments_user_id_fkey(${COMMENT_PROFILE_SELECT}),
  player:players!comments_player_id_fkey(id, name, photo_url)
`

type CommentRow = {
  id: number
  body: string
  score: number
  upvote_count: number
  created_at: string
  user_id: string
  profile: {
    username: string | null
    display_name: string
    avatar_url: string | null
    favourite_club: { id: number; name: string; logo_url: string | null } | null
    favourite_national_team: { id: number; name: string; logo_url: string | null } | null
  } | null
  player: {
    id: number
    name: string
    photo_url: string | null
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
    authorUserId: row.user_id,
    authorUsername: row.profile?.username ?? null,
    authorDisplayName: row.profile?.display_name ?? "user",
    authorAvatarUrl: row.profile?.avatar_url ?? null,
    authorClub: row.profile?.favourite_club ?? null,
    authorNationalTeam: row.profile?.favourite_national_team ?? null,
    playerId: row.player.id,
    playerName: row.player.name,
    playerPhotoUrl: row.player.photo_url,
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

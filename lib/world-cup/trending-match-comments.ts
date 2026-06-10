import { cache } from "react"

import { sevenDaysAgoIso } from "@/lib/home/dates"
import { createClient } from "@/lib/supabase/server"

import type { TrendingMatchCommentCard } from "./trending-match-comment-types"

const TRENDING_MATCH_COMMENT_LIMIT = 3

const COMMENT_SELECT = `
  id,
  body,
  score,
  upvote_count,
  created_at,
  user_id,
  profile:profiles!comments_user_id_fkey(
    username,
    display_name,
    favourite_club:teams!profiles_favourite_club_id_fkey(id, name, logo_url),
    favourite_national_team:teams!profiles_favourite_national_team_id_fkey(id, name, logo_url)
  ),
  fixture:fixtures!comments_fixture_id_fkey(
    id,
    season_id,
    home_team:teams!fixtures_home_team_id_fkey(id, name, logo_url, code),
    away_team:teams!fixtures_away_team_id_fkey(id, name, logo_url, code)
  )
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
    favourite_club: { id: number; name: string; logo_url: string | null } | null
    favourite_national_team: { id: number; name: string; logo_url: string | null } | null
  } | null
  fixture: {
    id: number
    season_id: number
    home_team: {
      id: number
      name: string
      logo_url: string | null
      code: string | null
    } | null
    away_team: {
      id: number
      name: string
      logo_url: string | null
      code: string | null
    } | null
  } | null
}

export function mapTrendingMatchCommentRow(
  row: CommentRow,
  seasonId: number,
): TrendingMatchCommentCard | null {
  const fixture = row.fixture
  if (!fixture || fixture.season_id !== seasonId) return null
  if (!fixture.home_team || !fixture.away_team) return null

  return {
    id: row.id,
    body: row.body,
    score: row.score,
    upvoteCount: row.upvote_count,
    createdAt: row.created_at,
    authorUserId: row.user_id,
    authorUsername: row.profile?.username ?? null,
    authorDisplayName: row.profile?.display_name ?? "user",
    authorClub: row.profile?.favourite_club ?? null,
    authorNationalTeam: row.profile?.favourite_national_team ?? null,
    fixtureId: fixture.id,
    homeTeam: fixture.home_team,
    awayTeam: fixture.away_team,
  }
}

export const getTrendingMatchComments = cache(
  async (seasonId: number): Promise<TrendingMatchCommentCard[]> => {
    const supabase = await createClient()
    const since = sevenDaysAgoIso()

    const { data, error } = await supabase
      .from("comments")
      .select(COMMENT_SELECT)
      .eq("target_type", "match")
      .eq("is_deleted", false)
      .is("parent_id", null)
      .gte("created_at", since)
      .order("score", { ascending: false })
      .limit(TRENDING_MATCH_COMMENT_LIMIT * 3)

    if (error) {
      console.error("getTrendingMatchComments failed:", error.message)
      return []
    }

    return (data ?? [])
      .map((row) => mapTrendingMatchCommentRow(row as CommentRow, seasonId))
      .filter((row): row is TrendingMatchCommentCard => row != null)
      .slice(0, TRENDING_MATCH_COMMENT_LIMIT)
  },
)

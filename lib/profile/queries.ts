import { formatPlayerDisplayName } from "@/lib/player/display-name"
import { getOnboardingOptions } from "@/lib/onboarding/options"
import { createClient } from "@/lib/supabase/server"

import type {
  ProfileStats,
  ProfileTeam,
  ProfileView,
  RecentCommentItem,
  RecentRatingItem,
} from "./types"

const PROFILE_SELECT = `
  id,
  display_name,
  avatar_url,
  location,
  created_at,
  twitter_handle,
  instagram_handle,
  tiktok_handle,
  reddit_handle,
  favourite_club:teams!profiles_favourite_club_id_fkey(id, name, logo_url, code),
  favourite_national:teams!profiles_favourite_national_team_id_fkey(id, name, logo_url, code)
`

const PLAYER_NAME_SELECT = "id, name, firstname, lastname"

function mapTeam(raw: unknown): ProfileTeam | null {
  if (!raw || typeof raw !== "object") return null
  const t = raw as Record<string, unknown>
  if (typeof t.id !== "number" || typeof t.name !== "string") return null
  return {
    id: t.id,
    name: t.name,
    logoUrl: typeof t.logo_url === "string" ? t.logo_url : null,
    code: typeof t.code === "string" ? t.code : null,
  }
}

function mapProfileRow(row: Record<string, unknown>): ProfileView {
  return {
    id: String(row.id),
    displayName: String(row.display_name),
    avatarUrl: typeof row.avatar_url === "string" ? row.avatar_url : null,
    location: typeof row.location === "string" ? row.location : null,
    memberSince: String(row.created_at),
    favouriteClub: mapTeam(row.favourite_club),
    favouriteNationalTeam: mapTeam(row.favourite_national),
    twitterHandle: typeof row.twitter_handle === "string" ? row.twitter_handle : null,
    instagramHandle:
      typeof row.instagram_handle === "string" ? row.instagram_handle : null,
    tiktokHandle: typeof row.tiktok_handle === "string" ? row.tiktok_handle : null,
    redditHandle: typeof row.reddit_handle === "string" ? row.reddit_handle : null,
  }
}

export async function getProfileById(userId: string): Promise<ProfileView | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle()

  if (error || !data) {
    if (error) console.error("getProfileById failed:", error.message)
    return null
  }

  return mapProfileRow(data as Record<string, unknown>)
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const supabase = await createClient()

  const [matchRes, careerRes, commentsRes, upvotesRes] = await Promise.all([
    supabase
      .from("match_ratings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("career_ratings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_deleted", false),
    supabase
      .from("comments")
      .select("upvote_count")
      .eq("user_id", userId)
      .eq("is_deleted", false),
  ])

  const ratingsGiven = (matchRes.count ?? 0) + (careerRes.count ?? 0)
  const commentsCount = commentsRes.count ?? 0
  const upvotesReceived = (upvotesRes.data ?? []).reduce(
    (sum, row) => sum + (row.upvote_count ?? 0),
    0,
  )

  return { ratingsGiven, commentsCount, upvotesReceived }
}

type RatingRow = {
  value: number
  updated_at: string
  player: {
    id: number
    name: string
    firstname: string | null
    lastname: string | null
  } | null
}

function mapRatingRow(kind: "match" | "career", row: RatingRow): RecentRatingItem | null {
  if (!row.player) return null
  return {
    kind,
    playerId: row.player.id,
    playerName: formatPlayerDisplayName(
      row.player.firstname,
      row.player.lastname,
      row.player.name,
    ),
    value: row.value,
    ratedAt: row.updated_at,
  }
}

export async function getRecentRatings(userId: string): Promise<RecentRatingItem[]> {
  const supabase = await createClient()

  const [matchRes, careerRes] = await Promise.all([
    supabase
      .from("match_ratings")
      .select(`value, updated_at, player:players!match_ratings_player_id_fkey(${PLAYER_NAME_SELECT})`)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(3),
    supabase
      .from("career_ratings")
      .select(`value, updated_at, player:players!career_ratings_player_id_fkey(${PLAYER_NAME_SELECT})`)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(3),
  ])

  const combined: RecentRatingItem[] = []
  for (const row of matchRes.data ?? []) {
    const item = mapRatingRow("match", row as RatingRow)
    if (item) combined.push(item)
  }
  for (const row of careerRes.data ?? []) {
    const item = mapRatingRow("career", row as RatingRow)
    if (item) combined.push(item)
  }

  combined.sort(
    (a, b) => new Date(b.ratedAt).getTime() - new Date(a.ratedAt).getTime(),
  )

  return combined.slice(0, 3)
}

export async function getRecentComments(userId: string): Promise<RecentCommentItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      id,
      body,
      score,
      created_at,
      player_id,
      fixture_id,
      player:players!comments_player_id_fkey(id, name, firstname, lastname)
    `,
    )
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(3)

  if (error) {
    console.error("getRecentComments failed:", error.message)
    return []
  }

  return (data ?? []).map((row) => {
    const player = row.player as RatingRow["player"]
    return {
      id: row.id,
      body: row.body,
      score: row.score,
      createdAt: row.created_at,
      playerId: row.player_id,
      fixtureId: row.fixture_id,
      playerName: player
        ? formatPlayerDisplayName(player.firstname, player.lastname, player.name)
        : null,
    }
  })
}

export async function getProfileTeamOptions() {
  return getOnboardingOptions()
}

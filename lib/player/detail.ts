import { cache } from "react"

import type { TeamSummary } from "@/lib/catalog/types"
import type { PlayerCareerAggregate, PlayerProfile } from "@/lib/player/types"
import { createClient } from "@/lib/supabase/server"

const TEAM_SELECT = "id, name, logo_url, code"

type TeamRow = TeamSummary | null

type PlayerRow = {
  id: number
  name: string
  photo_url: string | null
  age: number | null
  primary_position: string | null
  nationality: string | null
  club_team: TeamRow
  national_team: TeamRow
}

type AggregateRow = {
  vote_count: number
  display_score: number
  is_provisional: boolean
  tier: string
}

const DEFAULT_CAREER: PlayerCareerAggregate = {
  voteCount: 0,
  displayScore: 5,
  isProvisional: true,
  tier: "provisional",
}

function mapTeam(row: TeamRow): TeamSummary | null {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    logo_url: row.logo_url,
    code: row.code,
  }
}

function mapCareer(row: AggregateRow | null): PlayerCareerAggregate {
  if (!row) return DEFAULT_CAREER
  return {
    voteCount: row.vote_count,
    displayScore: Number(row.display_score),
    isProvisional: row.is_provisional,
    tier: row.tier,
  }
}

export const getPlayerProfile = cache(
  async (playerId: number): Promise<PlayerProfile | null> => {
    const supabase = await createClient()

    const [{ data: playerRow, error: playerError }, { data: careerRow }] =
      await Promise.all([
        supabase
          .from("players")
          .select(
            `
            id,
            name,
            photo_url,
            age,
            primary_position,
            nationality,
            club_team:teams!players_club_team_id_fkey(${TEAM_SELECT}),
            national_team:teams!players_national_team_id_fkey(${TEAM_SELECT})
          `,
          )
          .eq("id", playerId)
          .maybeSingle(),
        supabase
          .from("player_career_aggregates")
          .select("vote_count, display_score, is_provisional, tier")
          .eq("player_id", playerId)
          .maybeSingle(),
      ])

    if (playerError) {
      console.error("getPlayerProfile player:", playerError.message)
      return null
    }
    if (!playerRow) return null

    const row = playerRow as PlayerRow

    return {
      id: row.id,
      name: row.name,
      photoUrl: row.photo_url,
      age: row.age,
      primaryPosition: row.primary_position,
      nationality: row.nationality,
      clubTeam: mapTeam(row.club_team),
      nationalTeam: mapTeam(row.national_team),
      career: mapCareer(careerRow as AggregateRow | null),
    }
  },
)

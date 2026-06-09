import { formatPlayerDisplayName } from "@/lib/player/display-name"

export type ShufflePlayerCard = {
  id: number
  displayName: string
  photoUrl: string
  position: string | null
  clubName: string | null
  displayScore: number
  tier: string
}

export type ShuffleCareerPlayerRow = {
  id: number
  name: string
  firstname: string | null
  lastname: string | null
  photo_url: string
  primary_position: string | null
  club_name: string | null
  display_score: number
  tier: string
}

export function mapShuffleCareerPlayerRow(row: ShuffleCareerPlayerRow): ShufflePlayerCard {
  return {
    id: row.id,
    displayName: formatPlayerDisplayName(row.firstname, row.lastname, row.name),
    photoUrl: row.photo_url,
    position: row.primary_position,
    clubName: row.club_name,
    displayScore: Number(row.display_score),
    tier: row.tier,
  }
}

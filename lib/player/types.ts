import type { TeamSummary } from "@/lib/catalog/types"

export type PlayerCareerAggregate = {
  voteCount: number
  displayScore: number
  isProvisional: boolean
  tier: string
}

export type PlayerProfile = {
  id: number
  name: string
  photoUrl: string | null
  age: number | null
  primaryPosition: string | null
  nationality: string | null
  clubTeam: TeamSummary | null
  nationalTeam: TeamSummary | null
  career: PlayerCareerAggregate
}

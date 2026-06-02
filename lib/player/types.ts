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
  displayName: string
  firstname: string | null
  lastname: string | null
  photoUrl: string | null
  age: number | null
  birthDate: string | null
  primaryPosition: string | null
  nationality: string | null
  clubTeam: TeamSummary | null
  nationalTeam: TeamSummary | null
  career: PlayerCareerAggregate
  userCareerRating: number | null
  form: PlayerFormSnapshot
  tournament: PlayerTournamentAggregate
  recentMatches: PlayerRecentMatch[]
}

export type PlayerFormSnapshot = {
  last5Avg: number | null
  last5FixtureIds: number[]
}

export type PlayerTournamentAggregate = {
  avgRating: number | null
  appearancesRated: number
  seasonId: number | null
}

export type PlayerRecentMatch = {
  fixtureId: number
  kickoffAt: string
  statusShort: string
  homeGoalsFt: number | null
  awayGoalsFt: number | null
  homeGoalsEt: number | null
  awayGoalsEt: number | null
  homeGoalsPen: number | null
  awayGoalsPen: number | null
  roundName: string | null
  homeTeam: TeamSummary
  awayTeam: TeamSummary
  playerAvgRating: number | null
}

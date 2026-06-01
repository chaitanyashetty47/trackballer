import type { FixtureWithTeams } from "@/lib/catalog/types"
import type { PitchPosition, PitchSide } from "@/lib/match/lineup-position"

export type MatchLineupPlayer = {
  playerId: number
  name: string
  shirtNumber: number | null
  side: PitchSide
  teamId: number
  isStarter: boolean
  isRateable: boolean
  position: PitchPosition
  communityAvg: number | null
  ratingCount: number
  userRating: number | null
}

export type MatchDetail = {
  fixture: FixtureWithTeams
  ratingsUnlocked: boolean
  hasLineups: boolean
  starters: MatchLineupPlayer[]
  substitutes: MatchLineupPlayer[]
  /** Rateable players in guided-flow order (starters then subs). */
  rateableQueue: MatchLineupPlayer[]
}

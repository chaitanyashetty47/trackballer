import type { FixtureWithTeams } from "@/lib/catalog/types"
import type { PitchSide } from "@/lib/match/lineup-position"

export type MatchLineupPlayer = {
  playerId: number
  name: string
  photoUrl: string | null
  shirtNumber: number | null
  side: PitchSide
  teamId: number
  isStarter: boolean
  isRateable: boolean
  /** Normalized GK/DEF/MID/FWD when known. */
  position: string | null
  minutesPlayed: number
  /** Set when a sub entered from the bench; null for starters and unused bench. */
  subOnMinute: number | null
  /** Starter subbed off when this player came on; null if unknown. */
  subReplacedPlayerName: string | null
  /** Formation line: 1 = goalkeeper, increasing toward attack. */
  gridRow: number
  /** Position within the line, left to right. */
  gridCol: number
  communityAvg: number | null
  ratingCount: number
  userRating: number | null
  /** Scored goals in this match (from fixture_events). */
  goalCount: number
  /** Assists in this match (from fixture_events). */
  assistCount: number
}

export type MatchCoach = {
  side: PitchSide
  teamId: number
  name: string
  photoUrl: string | null
}

export type MatchDetail = {
  fixture: FixtureWithTeams
  ratingsUnlocked: boolean
  hasLineups: boolean
  starters: MatchLineupPlayer[]
  /** Bench players who came on (minutes > 0). */
  substitutesOn: MatchLineupPlayer[]
  /** Named subs who did not play. */
  benchUnused: MatchLineupPlayer[]
  coaches: MatchCoach[]
  /** Rateable players in guided-flow order (starters then subs). */
  rateableQueue: MatchLineupPlayer[]
  /** e.g. "4-2-3-1" derived from the starting grid; null when unknown. */
  homeFormation: string | null
  awayFormation: string | null
}

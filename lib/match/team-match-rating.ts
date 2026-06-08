import type { MatchLineupPlayer } from "@/lib/match/types"

/** Mean community match rating for players who have one; null when none rated yet. */
export function teamCommunityAvg(players: MatchLineupPlayer[]): number | null {
  const rated = players
    .map((p) => p.communityAvg)
    .filter((v): v is number => v != null && Number.isFinite(v))

  if (rated.length === 0) return null

  const sum = rated.reduce((acc, v) => acc + v, 0)
  return Math.round((sum / rated.length) * 100) / 100
}

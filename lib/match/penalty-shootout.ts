import type { PitchSide } from "@/lib/match/lineup-position"
import type { PenaltyKick, PenaltyShootout } from "@/lib/match/types"

export type PenaltyEventRow = {
  player_id: number | null
  team_id: number | null
  type: string
  detail: string | null
  minute: number
  extra_minute: number | null
}

const SUMMARY_SLOTS = 5

function isShootoutPenaltyEvent(detail: string | null, minute: number, extraMinute: number | null): boolean {
  if (!detail?.toLowerCase().includes("penalty")) return false
  return minute >= 120 && extraMinute != null && extraMinute > 0
}

function kickScored(detail: string | null): boolean {
  return !detail?.toLowerCase().includes("missed")
}

/** Parse shootout kicks from fixture_events (120'+extra_minute). */
export function buildPenaltyShootout(
  events: PenaltyEventRow[],
  homeTeamId: number,
  playerNames: Map<number, string>,
): PenaltyShootout | null {
  const kicks = events
    .filter(
      (e) =>
        e.type === "Goal" &&
        isShootoutPenaltyEvent(e.detail, e.minute, e.extra_minute) &&
        e.team_id != null &&
        e.player_id != null,
    )
    .sort((a, b) => (a.extra_minute ?? 0) - (b.extra_minute ?? 0))

  if (kicks.length === 0) return null

  let homeScore = 0
  let awayScore = 0
  const sequence: PenaltyKick[] = []
  const homeTaken: boolean[] = []
  const awayTaken: boolean[] = []

  for (const event of kicks) {
    const side: PitchSide = event.team_id === homeTeamId ? "home" : "away"
    const scored = kickScored(event.detail)
    const rawName = playerNames.get(event.player_id!) ?? `Player ${event.player_id}`
    const teamKickNumber = side === "home" ? homeTaken.length + 1 : awayTaken.length + 1

    if (scored) {
      if (side === "home") homeScore += 1
      else awayScore += 1
    }

    if (side === "home") homeTaken.push(scored)
    else awayTaken.push(scored)

    sequence.push({
      side,
      playerId: event.player_id!,
      playerName: rawName,
      kickNumber: teamKickNumber,
      sequenceOrder: event.extra_minute ?? sequence.length + 1,
      scored,
      homeScoreAfter: homeScore,
      awayScoreAfter: awayScore,
    })
  }

  const homePenScore = homeScore
  const awayPenScore = awayScore

  return {
    homePenScore,
    awayPenScore,
    homeKicks: padKickSummary(homeTaken),
    awayKicks: padKickSummary(awayTaken),
    sequence,
  }
}

/** true = scored, false = missed, null = not taken */
function padKickSummary(taken: boolean[]): (boolean | null)[] {
  const slots: (boolean | null)[] = taken.map((scored) => scored)
  while (slots.length < SUMMARY_SLOTS) {
    slots.push(null)
  }
  return slots.slice(0, SUMMARY_SLOTS)
}

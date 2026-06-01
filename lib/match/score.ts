import type { FixtureRow } from "@/lib/catalog/types"

export type MatchScoreFixture = Pick<
  FixtureRow,
  | "status_short"
  | "kickoff_at"
  | "home_goals_ft"
  | "away_goals_ft"
  | "home_goals_et"
  | "away_goals_et"
  | "home_goals_pen"
  | "away_goals_pen"
>

export type MatchScoreDisplay = {
  /** Main score line, e.g. "2–1", "0–0", or "18:00" for upcoming */
  scoreline: string
  /** Badge under score: FT, AET, PEN (4-2), LIVE, NS, … */
  statusLabel: string
  isLive: boolean
}

const TERMINAL = new Set(["FT", "AET", "PEN"])
const UPCOMING = new Set(["NS", "TBD"])
const INTERRUPTED = new Set(["PST", "CANC", "SUSP", "ABD", "AWD", "WO"])

function isLiveStatus(status: string): boolean {
  return !TERMINAL.has(status) && !UPCOMING.has(status) && !INTERRUPTED.has(status)
}

function formatGoals(home: number, away: number): string {
  return `${home} - ${away}`
}

function afterExtraTimeGoals(fixture: MatchScoreFixture): [number | null, number | null] {
  if (fixture.home_goals_et != null && fixture.away_goals_et != null) {
    return [fixture.home_goals_et, fixture.away_goals_et]
  }
  return [fixture.home_goals_ft, fixture.away_goals_ft]
}

function formatKickoffTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso))
}

export function formatMatchScore(fixture: MatchScoreFixture): MatchScoreDisplay {
  const { status_short: status } = fixture

  if (UPCOMING.has(status)) {
    return {
      scoreline: formatKickoffTime(fixture.kickoff_at),
      statusLabel: status,
      isLive: false,
    }
  }

  if (INTERRUPTED.has(status)) {
    return {
      scoreline: "–",
      statusLabel: status,
      isLive: false,
    }
  }

  if (status === "PEN") {
    const [home, away] = afterExtraTimeGoals(fixture)
    const homePen = fixture.home_goals_pen
    const awayPen = fixture.away_goals_pen

    if (home != null && away != null && homePen != null && awayPen != null) {
      return {
        scoreline: formatGoals(home, away),
        statusLabel: `PEN (${homePen}-${awayPen})`,
        isLive: false,
      }
    }
  }

  if (status === "AET") {
    const [home, away] = afterExtraTimeGoals(fixture)
    if (home != null && away != null) {
      return {
        scoreline: formatGoals(home, away),
        statusLabel: "AET",
        isLive: false,
      }
    }
  }

  if (status === "FT" || TERMINAL.has(status)) {
    const home = fixture.home_goals_ft
    const away = fixture.away_goals_ft
    if (home != null && away != null) {
      return {
        scoreline: formatGoals(home, away),
        statusLabel: status,
        isLive: false,
      }
    }
  }

  if (isLiveStatus(status)) {
    const home = fixture.home_goals_ft ?? 0
    const away = fixture.away_goals_ft ?? 0
    return {
      scoreline: formatGoals(home, away),
      statusLabel: status === "HT" ? "HT" : "LIVE",
      isLive: true,
    }
  }

  return {
    scoreline: "–",
    statusLabel: status,
    isLive: false,
  }
}

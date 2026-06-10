import { getCatalogLeagueId, getCatalogSeasonYear } from "@/lib/catalog/config"
import type { StandingsGroup, StandingsPayload } from "@/lib/catalog/standings-types"

const REVALIDATE_SECONDS = 600

type ApiStandingsTeam = {
  rank: number
  team: { id: number; name: string; logo: string | null }
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } }
  goalsDiff: number
  points: number
  form: string | null
  group?: string
}

function mapTeamRow(row: ApiStandingsTeam): StandingsGroup["teams"][number] {
  return {
    rank: row.rank,
    teamId: row.team.id,
    teamName: row.team.name,
    logoUrl: row.team.logo,
    played: row.all.played,
    win: row.all.win,
    draw: row.all.draw,
    lose: row.all.lose,
    goalsFor: row.all.goals.for,
    goalsAgainst: row.all.goals.against,
    goalsDiff: row.goalsDiff,
    points: row.points,
    form: row.form,
  }
}

function parseStandingsResponse(
  data: unknown,
  season: number,
): StandingsPayload | null {
  if (!data || typeof data !== "object") return null
  const root = data as { response?: unknown[] }
  const block = root.response?.[0]
  if (!block || typeof block !== "object") return null

  const league = (block as { league?: { name?: string; standings?: unknown[] } }).league
  const tables = league?.standings
  if (!Array.isArray(tables) || tables.length === 0) return null

  const groups: StandingsGroup[] = tables.map((table, index) => {
    const rows = Array.isArray(table) ? (table as ApiStandingsTeam[]) : []
    const first = rows[0]
    const name = first?.group ?? `Group ${String.fromCharCode(65 + index)}`
    return {
      name,
      teams: rows.map(mapTeamRow),
    }
  })

  return {
    leagueName: league?.name ?? "World Cup",
    season,
    groups,
  }
}

/** Server-only fetch — cached 10 minutes. */
export async function getStandingsPayload(
  leagueId = getCatalogLeagueId(),
  seasonYear = getCatalogSeasonYear(),
): Promise<StandingsPayload | null> {
  const baseUrl =
    process.env.API_FOOTBALL_BASE_URL ?? "https://v3.football.api-sports.io"
  const apiKey = process.env.API_FOOTBALL_KEY
  if (!apiKey) {
    console.error("getStandingsPayload: API_FOOTBALL_KEY is not set")
    return null
  }

  const url = `${baseUrl}/standings?league=${leagueId}&season=${seasonYear}`
  const res = await fetch(url, {
    headers: {
      "x-apisports-key": apiKey,
      Accept: "application/json",
    },
    next: { revalidate: REVALIDATE_SECONDS },
  })

  if (!res.ok) {
    console.error("getStandingsPayload failed:", res.status, await res.text())
    return null
  }

  const json: unknown = await res.json()
  return parseStandingsResponse(json, seasonYear)
}

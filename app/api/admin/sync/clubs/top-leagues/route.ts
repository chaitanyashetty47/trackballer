import { NextRequest } from "next/server"

import { assertSyncAuthorized } from "@/lib/admin/sync-auth"
import { jsonError, runSync } from "@/lib/admin/sync-handler"
import { seedTopLeagueClubs } from "@/lib/catalog-sync/seed-top-league-clubs"
import { ApiFootballClient } from "@/lib/api-football/client"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"
/** Five sequential /teams calls at ~10 req/min. */
export const maxDuration = 300

type SeedBody = {
  seasonYear?: number
}

/**
 * POST /api/admin/sync/clubs/top-leagues
 * Upserts top-5 league rows and club teams from API-Football GET /teams.
 */
export async function POST(request: NextRequest) {
  const unauthorized = assertSyncAuthorized(request)
  if (unauthorized) return unauthorized

  let body: SeedBody = {}
  try {
    const text = await request.text()
    if (text) body = JSON.parse(text) as SeedBody
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const seasonYear =
    body.seasonYear ??
    Number(process.env.API_FOOTBALL_CLUBS_SEASON ?? process.env.API_FOOTBALL_SEASON ?? 2024)

  if (!Number.isFinite(seasonYear) || seasonYear < 2000) {
    return jsonError("seasonYear must be a valid year", 400)
  }

  const api = new ApiFootballClient()
  const db = createAdminClient()

  return runSync(() => seedTopLeagueClubs(db, api, seasonYear), {
    rateLimit: api.rateLimit,
  })
}

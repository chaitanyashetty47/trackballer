import { NextRequest } from "next/server";

import { assertSyncAuthorized } from "@/lib/admin/sync-auth";
import { jsonError, runSync } from "@/lib/admin/sync-handler";
import { seedTopLeaguePlayers } from "@/lib/catalog-sync/seed-top-league-players";
import { ApiFootballClient } from "@/lib/api-football/client";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
/** One squad call per club at ~10 req/min — chunk with body limit on Vercel Hobby. */
export const maxDuration = 300;

type SeedBody = {
  seasonYear?: number;
  leagueIds?: number[];
  limit?: number;
  offset?: number;
};

/**
 * POST /api/admin/sync/players/top-leagues
 * Ingest club squads for PL, La Liga, Serie A, Bundesliga, Ligue 1.
 * Merges with existing WC players — preserves national_team_id and profile fields.
 */
export async function POST(request: NextRequest) {
  const unauthorized = assertSyncAuthorized(request);
  if (unauthorized) return unauthorized;

  let body: SeedBody = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text) as SeedBody;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const seasonYear =
    body.seasonYear ??
    Number(process.env.API_FOOTBALL_CLUBS_SEASON ?? process.env.API_FOOTBALL_SEASON ?? 2025);

  if (!Number.isFinite(seasonYear) || seasonYear < 2000) {
    return jsonError("seasonYear must be a valid year", 400);
  }

  if (body.offset != null && (!Number.isFinite(body.offset) || body.offset < 0)) {
    return jsonError("offset must be a non-negative number", 400);
  }

  if (body.limit != null && (!Number.isFinite(body.limit) || body.limit < 1)) {
    return jsonError("limit must be a positive number", 400);
  }

  const api = new ApiFootballClient();
  const db = createAdminClient();

  return runSync(
    () =>
      seedTopLeaguePlayers(db, api, {
        seasonYear,
        leagueIds: body.leagueIds,
        limit: body.limit,
        offset: body.offset,
      }),
    { rateLimit: api.rateLimit },
  );
}

import { NextRequest } from "next/server";

import { assertSyncAuthorized } from "@/lib/admin/sync-auth";
import { jsonError, runSync } from "@/lib/admin/sync-handler";
import { syncCoachesBackfill } from "@/lib/catalog-sync/coaches-backfill";
import { ApiFootballClient } from "@/lib/api-football/client";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
/** Use body `limit` on Hobby (300s cap); re-run until no pending fixtures. */
export const maxDuration = 300;

type BackfillBody = {
  leagueId?: number;
  seasonYear?: number;
  limit?: number;
  force?: boolean;
};

/**
 * POST /api/admin/sync/coaches/backfill
 * Upsert fixture_coaches from API lineups only (1 call per match).
 * Skips fixtures that already have coach rows unless force=true.
 */
export async function POST(request: NextRequest) {
  const unauthorized = assertSyncAuthorized(request);
  if (unauthorized) return unauthorized;

  let body: BackfillBody = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text) as BackfillBody;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  console.log("[catalog-sync]", "POST /coaches/backfill", {
    leagueId: body.leagueId ?? null,
    seasonYear: body.seasonYear ?? null,
    limit: body.limit ?? null,
    force: body.force ?? false,
  });

  const api = new ApiFootballClient();
  const db = createAdminClient();

  return runSync(
    () =>
      syncCoachesBackfill(db, api, {
        leagueId: body.leagueId,
        seasonYear: body.seasonYear,
        limit: body.limit,
        force: body.force,
      }),
    { rateLimit: api.rateLimit },
  );
}

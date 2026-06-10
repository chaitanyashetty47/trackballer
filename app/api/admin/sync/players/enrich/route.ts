import { NextRequest } from "next/server";

import { assertSyncAuthorized } from "@/lib/admin/sync-auth";
import { jsonError, runSync } from "@/lib/admin/sync-handler";
import { enrichPlayerProfiles } from "@/lib/catalog-sync/player-enrich";
import { ApiFootballClient } from "@/lib/api-football/client";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
/** Vercel Hobby cap — chunk with body `limit` / `offset` for large squads. */
export const maxDuration = 300;

type EnrichBody = {
  /** API season for current club + profile (e.g. 2025). */
  profileSeasonYear?: number;
  /** Only players on this WC squad (e.g. 2026) — skips non-squad rows like Curacao. */
  squadSeasonYear?: number;
  leagueId?: number;
  syncNationalTeam?: boolean;
  nationalTeamIds?: number[];
  limit?: number;
  offset?: number;
};

/**
 * POST /api/admin/sync/players/enrich
 * Sync current club + full profile for incomplete players already in our DB.
 */
export async function POST(request: NextRequest) {
  const unauthorized = assertSyncAuthorized(request);
  if (unauthorized) return unauthorized;

  let body: EnrichBody = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text) as EnrichBody;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const api = new ApiFootballClient();
  const db = createAdminClient();

  return runSync(
    () =>
      enrichPlayerProfiles(db, api, {
        profileSeasonYear: body.profileSeasonYear,
        squadSeasonYear: body.squadSeasonYear,
        leagueId: body.leagueId,
        syncNationalTeam: body.syncNationalTeam,
        nationalTeamIds: body.nationalTeamIds,
        limit: body.limit,
        offset: body.offset,
      }),
    { rateLimit: api.rateLimit },
  );
}

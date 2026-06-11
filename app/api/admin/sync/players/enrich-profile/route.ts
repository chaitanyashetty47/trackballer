import { NextRequest } from "next/server";

import { assertSyncAuthorized } from "@/lib/admin/sync-auth";
import { jsonError, runSync } from "@/lib/admin/sync-handler";
import { enrichPlayerIdentityFields } from "@/lib/catalog-sync/player-profile-fields";
import { ApiFootballClient } from "@/lib/api-football/client";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
/** One API call per incomplete player at ~10 req/min — chunk with limit on Vercel Hobby. */
export const maxDuration = 3000000000000000000000000000000000;

type EnrichBody = {
  profileSeasonYear?: number;
  limit?: number;
  offset?: number;
};

/**
 * POST /api/admin/sync/players/enrich-profile
 * Fills firstname, lastname, nationality, and birth_date when any are missing.
 * Does not change club_team_id or national_team_id (use top-leagues sync for clubs).
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
      enrichPlayerIdentityFields(db, api, {
        profileSeasonYear: body.profileSeasonYear,
        limit: body.limit,
        offset: body.offset,
      }),
    { rateLimit: api.rateLimit },
  );
}

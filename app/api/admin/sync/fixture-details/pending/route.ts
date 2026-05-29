import { NextRequest } from "next/server";
import { assertSyncAuthorized } from "@/lib/admin/sync-auth";
import { createCatalogSync, jsonError, runSync } from "@/lib/admin/sync-handler";

export const runtime = "nodejs";
/** 56 fixtures × 3 calls ≈ 18+ min at 10 req/min; optional limit in body */
export const maxDuration = 600;

type PendingBody = {
  leagueId?: number;
  seasonYear?: number;
  /** Cap fixtures per request (e.g. 10 ≈ 30 API calls ≈ 3 min) */
  limit?: number;
};

/**
 * POST /api/admin/sync/fixture-details/pending
 * Sync lineups + appearances + events only where lineups_synced_at IS NULL.
 * Skips fixtures already detail-synced (unlike bootstrap + syncFixtureDetails).
 */
export async function POST(request: NextRequest) {
  const unauthorized = assertSyncAuthorized(request);
  if (unauthorized) return unauthorized;

  let body: PendingBody = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text) as PendingBody;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const sync = createCatalogSync();
  return runSync(
    () =>
      sync.syncPendingFixtureDetails({
        leagueId: body.leagueId,
        seasonYear: body.seasonYear,
        limit: body.limit,
      }),
    { rateLimit: sync.rateLimitInfo },
  );
}

import { NextRequest } from "next/server";
import { assertSyncAuthorized } from "@/lib/admin/sync-auth";
import {
  createCatalogSync,
  jsonError,
  runSync,
  SYNC_ROUTE_MAX_DURATION,
} from "@/lib/admin/sync-handler";

export const runtime = "nodejs";
/** Use body `limit` to stay within Hobby 300s; full backfill needs multiple runs or Pro plan. */
export const maxDuration = SYNC_ROUTE_MAX_DURATION;

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

  console.log("[catalog-sync]", "POST /fixture-details/pending", {
    leagueId: body.leagueId ?? null,
    seasonYear: body.seasonYear ?? null,
    limit: body.limit ?? null,
  });

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

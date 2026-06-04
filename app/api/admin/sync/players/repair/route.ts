import { NextRequest } from "next/server";
import { assertSyncAuthorized } from "@/lib/admin/sync-auth";
import {
  createCatalogSync,
  jsonError,
  runSync,
  SYNC_ROUTE_MAX_DURATION,
} from "@/lib/admin/sync-handler";

export const runtime = "nodejs";
/** Default 30 players × ~6.5s ≈ 3+ min; capped for Vercel Hobby. */
export const maxDuration = SYNC_ROUTE_MAX_DURATION;

type RepairBody = {
  seasonYear?: number;
  /** Max players to repair this run (default 30). Re-run until candidates: 0. */
  limit?: number;
};

/**
 * POST /api/admin/sync/players/repair
 * Profile sync for placeholder names and appearance players missing national_team_id.
 */
export async function POST(request: NextRequest) {
  const unauthorized = assertSyncAuthorized(request);
  if (unauthorized) return unauthorized;

  let body: RepairBody = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text) as RepairBody;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const sync = createCatalogSync();
  return runSync(
    () =>
      sync.repairPlayers({
        seasonYear: body.seasonYear,
        limit: body.limit,
      }),
    { rateLimit: sync.rateLimitInfo },
  );
}

import { NextRequest } from "next/server";
import { assertSyncAuthorized } from "@/lib/admin/sync-auth";
import { createCatalogSync, runSync, SYNC_ROUTE_MAX_DURATION } from "@/lib/admin/sync-handler";

export const runtime = "nodejs";
/** WC bootstrap is many API calls; Hobby plan max is 300s — run catalog-only or split jobs if it times out. */
export const maxDuration = SYNC_ROUTE_MAX_DURATION;

type BootstrapBody = {
  leagueId?: number;
  seasonYear?: number;
  syncFixtureDetails?: boolean;
};

/**
 * POST /api/admin/sync/bootstrap
 * Job 0 — ingest rounds, fixtures, teams, and WC squads from API-Football.
 */
export async function POST(request: NextRequest) {
  const unauthorized = assertSyncAuthorized(request);
  if (unauthorized) return unauthorized;

  let body: BootstrapBody = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text) as BootstrapBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sync = createCatalogSync();

  return runSync(
    () =>
      sync.bootstrapSeason({
        leagueId: body.leagueId,
        seasonYear: body.seasonYear,
        syncFixtureDetails: body.syncFixtureDetails ?? false,
      }),
    { rateLimit: sync.rateLimitInfo },
  );
}

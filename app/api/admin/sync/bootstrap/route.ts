import { NextRequest } from "next/server";
import { assertSyncAuthorized } from "@/lib/admin/sync-auth";
import { createCatalogSync, runSync } from "@/lib/admin/sync-handler";

export const runtime = "nodejs";
/** WC bootstrap is ~45+ API calls; at 10/min this can exceed 5 minutes. */
export const maxDuration = 600;

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

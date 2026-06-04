import { NextRequest } from "next/server";

import { assertSyncAuthorized } from "@/lib/admin/sync-auth";
import { createCatalogSync, runSync } from "@/lib/admin/sync-handler";
import { parseCronSyncBody } from "@/lib/cron/parse-sync-body";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * POST /api/cron/sync/daily
 * Scheduled via cron-job.org — refreshes fixtures from today through +7 days (UTC).
 */
export async function POST(request: NextRequest) {
  const unauthorized = assertSyncAuthorized(request);
  if (unauthorized) return unauthorized;

  const body = await parseCronSyncBody(request);
  if (body instanceof Response) return body;

  console.log("[catalog-sync]", "POST /api/cron/sync/daily", {
    leagueId: body.leagueId ?? null,
    seasonYear: body.seasonYear ?? null,
    daysAhead: body.daysAhead ?? null,
  });

  const sync = createCatalogSync();
  return runSync(
    () =>
      sync.syncDailyWindow({
        leagueId: body.leagueId,
        seasonYear: body.seasonYear,
        daysAhead: body.daysAhead,
      }),
    { rateLimit: sync.rateLimitInfo },
  );
}

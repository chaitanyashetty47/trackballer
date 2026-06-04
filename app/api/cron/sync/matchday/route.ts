import { NextRequest } from "next/server";

import { assertSyncAuthorized } from "@/lib/admin/sync-auth";
import { createCatalogSync, runSync } from "@/lib/admin/sync-handler";
import { parseCronSyncBody } from "@/lib/cron/parse-sync-body";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * POST /api/cron/sync/matchday
 * Scheduled via cron-job.org — refreshes today/yesterday fixtures, then detail-syncs terminals.
 */
export async function POST(request: NextRequest) {
  const unauthorized = assertSyncAuthorized(request);
  if (unauthorized) return unauthorized;

  const body = await parseCronSyncBody(request);
  if (body instanceof Response) return body;

  console.log("[catalog-sync]", "POST /api/cron/sync/matchday", {
    leagueId: body.leagueId ?? null,
    seasonYear: body.seasonYear ?? null,
    limit: body.limit ?? null,
  });

  const sync = createCatalogSync();
  return runSync(
    () =>
      sync.syncMatchdayBatch({
        leagueId: body.leagueId,
        seasonYear: body.seasonYear,
        limit: body.limit,
      }),
    { rateLimit: sync.rateLimitInfo },
  );
}

import { NextRequest } from "next/server";

import { assertSyncAuthorized } from "@/lib/admin/sync-auth";
import { acceptDeferredSync } from "@/lib/cron/deferred-sync";
import { parseCronSyncBody } from "@/lib/cron/parse-sync-body";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * POST /api/cron/sync/matchday
 * Returns immediately (cron-job.org 30s timeout); sync runs via after().
 */
export async function POST(request: NextRequest) {
  const unauthorized = assertSyncAuthorized(request);
  if (unauthorized) return unauthorized;

  const body = await parseCronSyncBody(request);
  if (body instanceof Response) return body;

  console.log("[catalog-sync]", "POST /api/cron/sync/matchday accepted", {
    leagueId: body.leagueId ?? null,
    seasonYear: body.seasonYear ?? null,
    limit: body.limit ?? null,
  });

  return acceptDeferredSync("matchday", body, (sync) =>
    sync.syncMatchdayBatch({
      leagueId: body.leagueId,
      seasonYear: body.seasonYear,
      limit: body.limit,
    }),
  );
}

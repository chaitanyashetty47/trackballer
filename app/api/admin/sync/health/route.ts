import { NextRequest } from "next/server";
import { assertSyncAuthorized } from "@/lib/admin/sync-auth";
import { createCatalogSync, runSync } from "@/lib/admin/sync-handler";

export const runtime = "nodejs";

/**
 * GET /api/admin/sync/health?seasonYear=2022
 * Per-fixture sync state: pending | partial | complete (DB is source of truth).
 */
export async function GET(request: NextRequest) {
  const unauthorized = assertSyncAuthorized(request);
  if (unauthorized) return unauthorized;

  const seasonYear = request.nextUrl.searchParams.get("seasonYear");
  const parsed = seasonYear ? Number(seasonYear) : undefined;
  if (seasonYear && !Number.isFinite(parsed)) {
    return Response.json({ error: "Invalid seasonYear" }, { status: 400 });
  }

  const sync = createCatalogSync();
  return runSync(() => sync.getFixtureSyncHealth(parsed));
}

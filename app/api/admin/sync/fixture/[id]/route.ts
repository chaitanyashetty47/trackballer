import { NextRequest } from "next/server";
import { assertSyncAuthorized } from "@/lib/admin/sync-auth";
import { createCatalogSync, jsonError, runSync } from "@/lib/admin/sync-handler";

export const runtime = "nodejs";
export const maxDuration = 60;

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/sync/fixture/:id
 * Sync lineups, appearances, and events for one fixture.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const unauthorized = assertSyncAuthorized(request);
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const fixtureId = Number(id);
  if (!Number.isFinite(fixtureId) || fixtureId <= 0) {
    return jsonError("Invalid fixture id", 400);
  }

  const sync = createCatalogSync();
  return runSync(() => sync.syncFixtureDetail(fixtureId));
}

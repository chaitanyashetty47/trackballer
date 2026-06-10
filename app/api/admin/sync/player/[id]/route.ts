import { NextRequest } from "next/server";
import { assertSyncAuthorized } from "@/lib/admin/sync-auth";
import { createCatalogSync, jsonError, runSync } from "@/lib/admin/sync-handler";

export const runtime = "nodejs";
export const maxDuration = 300;

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/sync/player/:id
 * Full profile from GET /players?id&season (name, firstname, lastname, nationality, birth_date).
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const unauthorized = assertSyncAuthorized(request);
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const playerId = Number(id);
  if (!Number.isFinite(playerId) || playerId <= 0) {
    return jsonError("Invalid player id", 400);
  }

  let seasonYear: number | undefined;
  try {
    const text = await request.text();
    if (text) {
      const body = JSON.parse(text) as { seasonYear?: number };
      seasonYear = body.seasonYear;
    }
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const sync = createCatalogSync();
  return runSync(
    () => sync.syncPlayerProfile(playerId, seasonYear),
    { rateLimit: sync.rateLimitInfo },
  );
}

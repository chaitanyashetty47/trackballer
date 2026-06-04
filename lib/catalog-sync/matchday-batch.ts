import type { CatalogSync } from "@/lib/catalog-sync/catalog-sync";
import { DEFAULT_LEAGUE_ID, DEFAULT_SEASON_YEAR, TERMINAL_STATUSES } from "@/lib/catalog-sync/constants";
import { upsertApiFixtureBatch } from "@/lib/catalog-sync/upsert-api-fixtures";

export type MatchdayBatchOptions = {
  leagueId?: number;
  seasonYear?: number;
  /** Max terminal fixtures to run full detail sync this run (3 API calls each). */
  limit?: number;
};

export type MatchdayBatchStats = {
  leagueId: number;
  seasonYear: number;
  windowFrom: string;
  windowTo: string;
  candidatesInWindow: number;
  batchRefreshed: number;
  detailSynced: number;
  detailFailed: number;
  detailRemaining: number;
  syncedFixtureIds: number[];
  failures: Array<{ fixtureId: number; error: string }>;
};

/** UTC bounds: start of yesterday through end of today. */
export function matchdayKickoffWindow(): { from: string; to: string } {
  const now = new Date();
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
  return {
    from: yesterdayStart.toISOString(),
    to: tomorrowStart.toISOString(),
  };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

/**
 * Job 2 — refresh today/yesterday fixtures from API, then detail-sync terminals still pending.
 */
export async function syncMatchdayBatch(
  sync: CatalogSync,
  options: MatchdayBatchOptions = {},
): Promise<MatchdayBatchStats> {
  const leagueId = options.leagueId ?? Number(process.env.API_FOOTBALL_LEAGUE_ID ?? DEFAULT_LEAGUE_ID);
  const seasonYear =
    options.seasonYear ?? Number(process.env.API_FOOTBALL_SEASON ?? DEFAULT_SEASON_YEAR);
  const limit = options.limit ?? 15;

  const { from, to } = matchdayKickoffWindow();
  const seasonId = await sync.ensureSeason(leagueId, seasonYear);

  const { data: candidates, error: listError } = await sync.db
    .from("fixtures")
    .select("id, status_short, lineups_synced_at, appearances_synced_at")
    .eq("season_id", seasonId)
    .gte("kickoff_at", from)
    .lt("kickoff_at", to)
    .order("kickoff_at", { ascending: true });

  if (listError) throw listError;

  const candidateIds = (candidates ?? []).map((f) => f.id);
  let batchRefreshed = 0;

  for (const idChunk of chunk(candidateIds, 20)) {
    const res = await sync.api.getFixturesByIds(idChunk);
    const items = res.response;
    if (items.length > 0) {
      await upsertApiFixtureBatch(sync.db, seasonId, items, {
        isNational: leagueId === 1,
      });
      batchRefreshed += items.length;
    }
  }

  const { data: afterRefresh, error: refreshError } = await sync.db
    .from("fixtures")
    .select("id, status_short, lineups_synced_at, appearances_synced_at")
    .eq("season_id", seasonId)
    .gte("kickoff_at", from)
    .lt("kickoff_at", to);

  if (refreshError) throw refreshError;

  const needsDetail: number[] = [];
  for (const fx of afterRefresh ?? []) {
    if (!TERMINAL_STATUSES.has(fx.status_short)) continue;
    if (!fx.lineups_synced_at || !fx.appearances_synced_at) {
      needsDetail.push(fx.id);
    }
  }

  const batch = needsDetail.slice(0, limit);
  const stats: MatchdayBatchStats = {
    leagueId,
    seasonYear,
    windowFrom: from,
    windowTo: to,
    candidatesInWindow: candidateIds.length,
    batchRefreshed,
    detailSynced: 0,
    detailFailed: 0,
    detailRemaining: Math.max(0, needsDetail.length - batch.length),
    syncedFixtureIds: [],
    failures: [],
  };

  for (const fixtureId of batch) {
    try {
      await sync.syncFixtureDetail(fixtureId);
      stats.detailSynced += 1;
      stats.syncedFixtureIds.push(fixtureId);
    } catch (err) {
      stats.detailFailed += 1;
      stats.failures.push({
        fixtureId,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return stats;
}

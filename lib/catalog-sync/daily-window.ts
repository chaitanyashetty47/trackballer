import type { CatalogSync } from "@/lib/catalog-sync/catalog-sync";
import { DEFAULT_LEAGUE_ID, DEFAULT_SEASON_YEAR } from "@/lib/catalog-sync/constants";
import { upsertApiFixtureBatch } from "@/lib/catalog-sync/upsert-api-fixtures";

export type DailyWindowOptions = {
  leagueId?: number;
  seasonYear?: number;
  /** Days ahead from today (UTC). Default 7. */
  daysAhead?: number;
};

export type DailyWindowStats = {
  leagueId: number;
  seasonYear: number;
  from: string;
  to: string;
  apiFixtures: number;
  fixturesUpserted: number;
  teamsUpserted: number;
};

function formatUtcDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Job 1 — refresh kickoff, status, and scores for fixtures in a forward date window.
 */
export async function syncDailyWindow(
  sync: CatalogSync,
  options: DailyWindowOptions = {},
): Promise<DailyWindowStats> {
  const leagueId = options.leagueId ?? Number(process.env.API_FOOTBALL_LEAGUE_ID ?? DEFAULT_LEAGUE_ID);
  const seasonYear =
    options.seasonYear ?? Number(process.env.API_FOOTBALL_SEASON ?? DEFAULT_SEASON_YEAR);
  const daysAhead = options.daysAhead ?? 7;

  const today = new Date();
  const from = formatUtcDate(
    new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())),
  );
  const toDate = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + daysAhead),
  );
  const to = formatUtcDate(toDate);

  const seasonId = await sync.ensureSeason(leagueId, seasonYear);
  const res = await sync.api.getFixturesByDateWindow(leagueId, seasonYear, from, to);
  const items = res.response;

  const { fixtures, teams } = await upsertApiFixtureBatch(sync.db, seasonId, items, {
    isNational: leagueId === 1,
  });

  return {
    leagueId,
    seasonYear,
    from,
    to,
    apiFixtures: items.length,
    fixturesUpserted: fixtures,
    teamsUpserted: teams,
  };
}

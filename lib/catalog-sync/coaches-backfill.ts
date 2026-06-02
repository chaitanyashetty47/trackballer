import type { SupabaseClient } from "@supabase/supabase-js";

import { ApiFootballClient } from "@/lib/api-football/client";
import type { Database } from "@/lib/database.types";
import { mapCoaches } from "@/lib/catalog-sync/mappers";
import { TERMINAL_STATUSES } from "@/lib/catalog-sync/constants";

type Db = SupabaseClient<Database>;

export type CoachesBackfillOptions = {
  leagueId?: number;
  seasonYear?: number;
  /** Cap fixtures per request (1 API call each). */
  limit?: number;
  /** Re-fetch even when coach rows already exist. */
  force?: boolean;
};

export type FixtureCoachesSyncResult = {
  fixtureId: number;
  coachCount: number;
  skippedEmptyLineups: boolean;
};

export type CoachesBackfillStats = {
  seasonYear: number;
  missingTotal: number;
  skippedAlreadyHaveCoaches: number;
  synced: number;
  failed: number;
  skippedEmptyLineups: number;
  syncedFixtureIds: number[];
  failures: Array<{ fixtureId: number; error: string }>;
};

/**
 * Fetch lineups from API-Football and upsert fixture_coaches only.
 * Does not touch lineups, appearances, or events.
 */
export async function syncFixtureCoaches(
  db: Db,
  api: ApiFootballClient,
  fixtureId: number,
): Promise<FixtureCoachesSyncResult> {
  const lineupsRes = await api.getLineups(fixtureId);
  const lineups = lineupsRes.response;

  if (lineups.length === 0) {
    return { fixtureId, coachCount: 0, skippedEmptyLineups: true };
  }

  const coachRows = mapCoaches(fixtureId, lineups);
  const { error: deleteError } = await db
    .from("fixture_coaches")
    .delete()
    .eq("fixture_id", fixtureId);
  if (deleteError) throw deleteError;

  if (coachRows.length > 0) {
    const { error: insertError } = await db
      .from("fixture_coaches")
      .insert(coachRows);
    if (insertError) throw insertError;
  }

  return {
    fixtureId,
    coachCount: coachRows.length,
    skippedEmptyLineups: false,
  };
}

export async function syncCoachesBackfill(
  db: Db,
  api: ApiFootballClient,
  options: CoachesBackfillOptions = {},
): Promise<CoachesBackfillStats> {
  const leagueId =
    options.leagueId ?? Number(process.env.API_FOOTBALL_LEAGUE_ID ?? 1);
  const seasonYear =
    options.seasonYear ?? Number(process.env.API_FOOTBALL_SEASON ?? 2022);

  const { data: season, error: seasonError } = await db
    .from("seasons")
    .select("id")
    .eq("league_id", leagueId)
    .eq("year", seasonYear)
    .maybeSingle();

  if (seasonError) throw seasonError;
  if (!season) {
    throw new Error(
      `Season ${seasonYear} not found — run POST /api/admin/sync/bootstrap first`,
    );
  }

  const { data: fixtures, error: fixturesError } = await db
    .from("fixtures")
    .select("id")
    .eq("season_id", season.id)
    .in("status_short", [...TERMINAL_STATUSES])
    .not("lineups_synced_at", "is", null)
    .order("kickoff_at", { ascending: true });

  if (fixturesError) throw fixturesError;

  const fixtureIds = (fixtures ?? []).map((f) => f.id);
  const coachFixtureIds = new Set<number>();

  if (!options.force && fixtureIds.length > 0) {
    const { data: coachRows, error: coachError } = await db
      .from("fixture_coaches")
      .select("fixture_id")
      .in("fixture_id", fixtureIds);

    if (coachError) throw coachError;
    for (const row of coachRows ?? []) {
      coachFixtureIds.add(row.fixture_id);
    }
  }

  const missingIds: number[] = [];
  let skippedAlreadyHaveCoaches = 0;

  for (const id of fixtureIds) {
    if (!options.force && coachFixtureIds.has(id)) {
      skippedAlreadyHaveCoaches += 1;
    } else {
      missingIds.push(id);
    }
  }

  const batch =
    options.limit != null ? missingIds.slice(0, options.limit) : missingIds;

  const stats: CoachesBackfillStats = {
    seasonYear,
    missingTotal: missingIds.length,
    skippedAlreadyHaveCoaches,
    synced: 0,
    failed: 0,
    skippedEmptyLineups: 0,
    syncedFixtureIds: [],
    failures: [],
  };

  console.log("[catalog-sync]", "coaches backfill batch start", {
    seasonYear,
    missingTotal: missingIds.length,
    skippedAlreadyHaveCoaches,
    batchSize: batch.length,
    force: options.force ?? false,
  });

  for (const fixtureId of batch) {
    try {
      const result = await syncFixtureCoaches(db, api, fixtureId);
      if (result.skippedEmptyLineups) {
        stats.skippedEmptyLineups += 1;
      } else {
        stats.synced += 1;
        stats.syncedFixtureIds.push(fixtureId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      stats.failed += 1;
      stats.failures.push({ fixtureId, error: message });
      console.error("[catalog-sync]", `coaches ${fixtureId} failed`, message);
    }
  }

  console.log("[catalog-sync]", "coaches backfill batch complete", {
    synced: stats.synced,
    failed: stats.failed,
    skippedEmptyLineups: stats.skippedEmptyLineups,
    remaining: missingIds.length - batch.length + stats.failed,
  });

  return stats;
}

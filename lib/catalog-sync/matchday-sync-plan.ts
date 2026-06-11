import { isLiveMatchStatus, TERMINAL_STATUSES } from "@/lib/catalog-sync/constants";

export type MatchdayFixtureRow = {
  id: number;
  status_short: string;
  lineups_synced_at: string | null;
  appearances_synced_at: string | null;
};

export type MatchdaySyncPlan = {
  /** Lineups + events (2 API calls). NS or in-play when lineups not yet in DB. */
  liveSnapshotIds: number[];
  /** Events only (1 API call). In-play once lineups are already synced. */
  eventsOnlyIds: number[];
  /** Full detail (3 API calls each). Terminal fixtures still missing lineups or appearances. */
  fullDetailIds: number[];
  fullDetailRemaining: number;
};

export function planMatchdaySync(
  fixtures: MatchdayFixtureRow[],
  limit: number,
): MatchdaySyncPlan {
  const liveSnapshotIds: number[] = [];
  const eventsOnlyIds: number[] = [];
  const needsFullDetail: number[] = [];

  for (const fx of fixtures) {
    if (TERMINAL_STATUSES.has(fx.status_short)) {
      if (!fx.lineups_synced_at || !fx.appearances_synced_at) {
        needsFullDetail.push(fx.id);
      }
      continue;
    }

    if (isLiveMatchStatus(fx.status_short)) {
      if (fx.lineups_synced_at) {
        eventsOnlyIds.push(fx.id);
      } else {
        liveSnapshotIds.push(fx.id);
      }
      continue;
    }

    if (fx.status_short === "NS" && !fx.lineups_synced_at) {
      liveSnapshotIds.push(fx.id);
    }
  }

  const fullDetailIds = needsFullDetail.slice(0, limit);

  return {
    liveSnapshotIds,
    eventsOnlyIds,
    fullDetailIds,
    fullDetailRemaining: Math.max(0, needsFullDetail.length - fullDetailIds.length),
  };
}

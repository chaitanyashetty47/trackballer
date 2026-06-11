import { describe, expect, it } from "vitest";

import { planMatchdaySync } from "@/lib/catalog-sync/matchday-sync-plan";

describe("planMatchdaySync", () => {
  it("queues lineups for first live sync, events-only after, and full detail for FT", () => {
    const plan = planMatchdaySync(
      [
        {
          id: 1,
          status_short: "1H",
          lineups_synced_at: null,
          appearances_synced_at: null,
        },
        {
          id: 5,
          status_short: "2H",
          lineups_synced_at: "2026-06-12T00:00:00.000Z",
          appearances_synced_at: null,
        },
        {
          id: 2,
          status_short: "FT",
          lineups_synced_at: null,
          appearances_synced_at: null,
        },
        {
          id: 3,
          status_short: "NS",
          lineups_synced_at: null,
          appearances_synced_at: null,
        },
        {
          id: 4,
          status_short: "NS",
          lineups_synced_at: "2026-06-12T00:00:00.000Z",
          appearances_synced_at: null,
        },
      ],
      15,
    );

    expect(plan.liveSnapshotIds).toEqual([1, 3]);
    expect(plan.eventsOnlyIds).toEqual([5]);
    expect(plan.fullDetailIds).toEqual([2]);
    expect(plan.fullDetailRemaining).toBe(0);
  });

  it("caps terminal full-detail sync by limit", () => {
    const plan = planMatchdaySync(
      [
        {
          id: 10,
          status_short: "FT",
          lineups_synced_at: null,
          appearances_synced_at: null,
        },
        {
          id: 11,
          status_short: "FT",
          lineups_synced_at: null,
          appearances_synced_at: null,
        },
      ],
      1,
    );

    expect(plan.liveSnapshotIds).toEqual([]);
    expect(plan.fullDetailIds).toEqual([10]);
    expect(plan.fullDetailRemaining).toBe(1);
  });
});

import { describe, expect, it } from "vitest";

import {
  planMatchdaySync,
  shouldBatchRefreshFixture,
} from "@/lib/catalog-sync/matchday-sync-plan";

const KICKOFF_FUTURE = "2099-01-01T18:00:00.000Z";
const KICKOFF_PAST = "2020-01-01T18:00:00.000Z";

describe("planMatchdaySync", () => {
  it("queues lineups for first live sync, events-only after, and full detail for FT", () => {
    const plan = planMatchdaySync(
      [
        {
          id: 1,
          status_short: "1H",
          kickoff_at: KICKOFF_PAST,
          lineups_synced_at: null,
          appearances_synced_at: null,
        },
        {
          id: 5,
          status_short: "2H",
          kickoff_at: KICKOFF_PAST,
          lineups_synced_at: "2026-06-12T00:00:00.000Z",
          appearances_synced_at: null,
        },
        {
          id: 2,
          status_short: "FT",
          kickoff_at: KICKOFF_PAST,
          lineups_synced_at: null,
          appearances_synced_at: null,
        },
        {
          id: 3,
          status_short: "NS",
          kickoff_at: KICKOFF_FUTURE,
          lineups_synced_at: null,
          appearances_synced_at: null,
        },
      ],
      15,
    );

    expect(plan.liveSnapshotIds).toEqual([1]);
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
          kickoff_at: KICKOFF_PAST,
          lineups_synced_at: null,
          appearances_synced_at: null,
        },
        {
          id: 11,
          status_short: "FT",
          kickoff_at: KICKOFF_PAST,
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

describe("shouldBatchRefreshFixture", () => {
  const now = new Date("2026-06-12T12:00:00.000Z");

  it("refreshes in-play fixtures only", () => {
    expect(
      shouldBatchRefreshFixture(
        { status_short: "2H", kickoff_at: KICKOFF_PAST },
        now,
      ),
    ).toBe(true);
    expect(
      shouldBatchRefreshFixture(
        { status_short: "FT", kickoff_at: KICKOFF_PAST },
        now,
      ),
    ).toBe(false);
  });

  it("skips upcoming NS but refreshes NS after kickoff (stale status)", () => {
    expect(
      shouldBatchRefreshFixture(
        { status_short: "NS", kickoff_at: "2026-06-12T20:00:00.000Z" },
        now,
      ),
    ).toBe(false);
    expect(
      shouldBatchRefreshFixture(
        { status_short: "NS", kickoff_at: "2026-06-12T10:00:00.000Z" },
        now,
      ),
    ).toBe(true);
  });
});

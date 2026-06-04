import { describe, expect, it } from "vitest";

import { matchdayKickoffWindow } from "@/lib/catalog-sync/matchday-batch";

describe("matchdayKickoffWindow", () => {
  it("spans from start of yesterday UTC to start of tomorrow UTC", () => {
    const { from, to } = matchdayKickoffWindow();
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffHours = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBe(48);
    expect(fromDate.getUTCHours()).toBe(0);
    expect(toDate.getUTCHours()).toBe(0);
  });
});

import { describe, expect, it } from "vitest"

import {
  goalDetailSuffix,
  isInGamePenaltyDetail,
  isOwnGoalDetail,
} from "@/lib/match/goal-event-detail"

describe("goal-event-detail", () => {
  it("detects API-Football Own Goal and Penalty detail strings", () => {
    expect(isOwnGoalDetail("Own Goal")).toBe(true)
    expect(isInGamePenaltyDetail("Penalty")).toBe(true)
    expect(isInGamePenaltyDetail("Normal Goal")).toBe(false)
    expect(isInGamePenaltyDetail("Missed Penalty")).toBe(false)
  })

  it("formats scorecard suffixes", () => {
    expect(goalDetailSuffix("Own Goal")).toBe(" (OG)")
    expect(goalDetailSuffix("Penalty")).toBe(" (P)")
    expect(goalDetailSuffix("Normal Goal")).toBe("")
  })
})

import { describe, expect, it } from "vitest"

import {
  buildGoalAssistCountsMap,
  isCountedMatchGoal,
  isPenaltyShootoutGoal,
} from "@/lib/match/goal-assist-counts"

describe("isPenaltyShootoutGoal", () => {
  it("detects shootout goals at 120+ extra minutes", () => {
    expect(isPenaltyShootoutGoal(120, 1, "Penalty")).toBe(true)
    expect(isPenaltyShootoutGoal(120, 8, "Penalty")).toBe(true)
  })

  it("allows in-game penalties", () => {
    expect(isPenaltyShootoutGoal(23, null, "Penalty")).toBe(false)
    expect(isPenaltyShootoutGoal(118, null, "Penalty")).toBe(false)
  })
})

describe("buildGoalAssistCountsMap", () => {
  it("counts normal goals, in-game penalties, and ET goals", () => {
    const map = buildGoalAssistCountsMap([
      {
        type: "Goal",
        detail: "Penalty",
        minute: 23,
        extra_minute: null,
        player_id: 154,
        assist_player_id: null,
      },
      {
        type: "Goal",
        detail: "Normal Goal",
        minute: 108,
        extra_minute: null,
        player_id: 154,
        assist_player_id: null,
      },
      {
        type: "Goal",
        detail: "Penalty",
        minute: 80,
        extra_minute: null,
        player_id: 278,
        assist_player_id: null,
      },
      {
        type: "Goal",
        detail: "Normal Goal",
        minute: 81,
        extra_minute: null,
        player_id: 278,
        assist_player_id: 21104,
      },
      {
        type: "Goal",
        detail: "Penalty",
        minute: 118,
        extra_minute: null,
        player_id: 278,
        assist_player_id: null,
      },
    ])
    expect(map.get(154)).toEqual({ goals: 2, assists: 0 })
    expect(map.get(278)).toEqual({ goals: 3, assists: 0 })
    expect(map.get(21104)).toEqual({ goals: 0, assists: 1 })
  })

  it("excludes shootout penalties and misses", () => {
    const map = buildGoalAssistCountsMap([
      {
        type: "Goal",
        detail: "Penalty",
        minute: 120,
        extra_minute: 2,
        player_id: 154,
        assist_player_id: null,
      },
      {
        type: "Goal",
        detail: "Penalty",
        minute: 120,
        extra_minute: 1,
        player_id: 278,
        assist_player_id: null,
      },
      {
        type: "Goal",
        detail: "Missed Penalty",
        minute: 120,
        extra_minute: 3,
        player_id: 508,
        assist_player_id: null,
      },
    ])
    expect(map.size).toBe(0)
  })

  it("isCountedMatchGoal matches build rules", () => {
    expect(isCountedMatchGoal("Normal Goal", 108, null)).toBe(true)
    expect(isCountedMatchGoal("Penalty", 23, null)).toBe(true)
    expect(isCountedMatchGoal("Penalty", 120, 1)).toBe(false)
    expect(isCountedMatchGoal("Missed Penalty", 120, 4)).toBe(false)
  })
})

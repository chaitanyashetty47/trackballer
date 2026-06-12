import { describe, expect, it } from "vitest"

import {
  buildVarCancelledGoalKeys,
  filterVarCancelledGoals,
  isVarGoalCancellation,
} from "@/lib/match/var-goal-events"

const HOME = 10

describe("isVarGoalCancellation", () => {
  it("matches API-Football VAR goal overturn strings", () => {
    expect(isVarGoalCancellation("Var", "Goal cancelled")).toBe(true)
    expect(isVarGoalCancellation("Var", "Goal Disallowed")).toBe(true)
    expect(isVarGoalCancellation("Var", "Goal confirmed")).toBe(false)
    expect(isVarGoalCancellation("Goal", "Normal Goal")).toBe(false)
  })
})

describe("filterVarCancelledGoals", () => {
  it("removes goals at the same minute/team as a VAR cancellation", () => {
    const events = [
      {
        type: "Goal",
        detail: "Normal Goal",
        team_id: HOME,
        minute: 54,
        extra_minute: null,
        player_id: 99,
      },
      {
        type: "Var",
        detail: "Goal cancelled",
        team_id: HOME,
        minute: 54,
        extra_minute: null,
        player_id: 99,
      },
      {
        type: "Goal",
        detail: "Normal Goal",
        team_id: HOME,
        minute: 61,
        extra_minute: null,
        player_id: 88,
      },
    ]

    const filtered = filterVarCancelledGoals(events)
    expect(filtered).toHaveLength(2)
    expect(filtered.map((e) => e.minute)).toEqual([54, 61])
    expect(filtered[0]?.type).toBe("Var")
    expect(filtered[1]?.type).toBe("Goal")
  })

  it("builds keys from stoppage time including extra minute", () => {
    const keys = buildVarCancelledGoalKeys([
      {
        type: "Var",
        detail: "Goal cancelled",
        team_id: HOME,
        minute: 90,
        extra_minute: 3,
      },
    ])

    expect(keys.has(`${HOME}:90:3`)).toBe(true)
    expect(keys.has(`${HOME}:90:0`)).toBe(false)
  })
})

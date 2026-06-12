import { describe, expect, it } from "vitest"

import {
  buildMatchGoalScorers,
  formatGoalMinuteLabel,
  formatGroupedScorerLine,
  groupScorersByPlayer,
} from "@/lib/match/match-goals"

const HOME = 10
const AWAY = 20

const names = new Map<number, string>([
  [154, "Lionel Messi"],
  [278, "Kylian Mbappé"],
  [21104, "Ángel Di María"],
  [99, "Bryan Mbeumo"],
  [55, "Casemiro"],
])

describe("buildMatchGoalScorers", () => {
  it("groups in-game goals and excludes shootout pens", () => {
    const scorers = buildMatchGoalScorers(
      [
        {
          type: "Goal",
          detail: "Penalty",
          minute: 23,
          extra_minute: null,
          player_id: 154,
          team_id: HOME,
        },
        {
          type: "Goal",
          detail: "Normal Goal",
          minute: 108,
          extra_minute: null,
          player_id: 154,
          team_id: HOME,
        },
        {
          type: "Goal",
          detail: "Normal Goal",
          minute: 36,
          extra_minute: null,
          player_id: 21104,
          team_id: HOME,
        },
        {
          type: "Goal",
          detail: "Penalty",
          minute: 120,
          extra_minute: 1,
          player_id: 154,
          team_id: HOME,
        },
        {
          type: "Goal",
          detail: "Penalty",
          minute: 80,
          extra_minute: null,
          player_id: 278,
          team_id: AWAY,
        },
      ],
      HOME,
      names,
    )

    expect(scorers.home).toHaveLength(3)
    expect(scorers.away).toHaveLength(1)
    expect(scorers.home[0]?.isPenalty).toBe(true)
    expect(scorers.home[0]?.minute).toBe(23)
  })

  it("drops goals overturned by VAR when cancellation event is present", () => {
    const scorers = buildMatchGoalScorers(
      [
        {
          type: "Goal",
          detail: "Normal Goal",
          minute: 54,
          extra_minute: null,
          player_id: 99,
          team_id: HOME,
        },
        {
          type: "Var",
          detail: "Goal cancelled",
          minute: 54,
          extra_minute: null,
          player_id: 99,
          team_id: HOME,
        },
        {
          type: "Goal",
          detail: "Normal Goal",
          minute: 72,
          extra_minute: null,
          player_id: 99,
          team_id: HOME,
        },
      ],
      HOME,
      names,
    )

    expect(scorers.home).toHaveLength(1)
    expect(scorers.home[0]?.minute).toBe(72)
  })

  it("includes own goals with OG marker", () => {
    const scorers = buildMatchGoalScorers(
      [
        {
          type: "Goal",
          detail: "Own Goal",
          minute: 34,
          extra_minute: null,
          player_id: 55,
          team_id: HOME,
        },
      ],
      HOME,
      names,
    )

    expect(scorers.home).toHaveLength(1)
    expect(scorers.home[0]?.isOwnGoal).toBe(true)
  })

  it("formats stoppage time as 90+n", () => {
    expect(formatGoalMinuteLabel(90, 7)).toBe("90+7'")
    expect(formatGoalMinuteLabel(61, null)).toBe("61'")
  })

  it("groups same player goals on one row", () => {
    const scorers = buildMatchGoalScorers(
      [
        {
          type: "Goal",
          detail: "Normal Goal",
          minute: 61,
          extra_minute: null,
          player_id: 99,
          team_id: HOME,
        },
        {
          type: "Goal",
          detail: "Normal Goal",
          minute: 90,
          extra_minute: 7,
          player_id: 99,
          team_id: HOME,
        },
      ],
      HOME,
      names,
    )

    const grouped = groupScorersByPlayer(scorers.home)
    expect(grouped).toHaveLength(1)
    expect(formatGroupedScorerLine(grouped[0]!)).toBe("B. Mbeumo 61', 90+7'")
  })

  it("formats scorer list with pen marker on one row per player", () => {
    const scorers = buildMatchGoalScorers(
      [
        {
          type: "Goal",
          detail: "Penalty",
          minute: 23,
          extra_minute: null,
          player_id: 154,
          team_id: HOME,
        },
        {
          type: "Goal",
          detail: "Normal Goal",
          minute: 108,
          extra_minute: null,
          player_id: 154,
          team_id: HOME,
        },
      ],
      HOME,
      names,
    )

    const grouped = groupScorersByPlayer(scorers.home)
    expect(grouped).toHaveLength(1)
    expect(formatGroupedScorerLine(grouped[0]!)).toBe("L. Messi 23' (P), 108'")
  })
})

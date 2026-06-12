import { describe, expect, it } from "vitest"

import { buildMatchRedCards, formatRedCardLine } from "@/lib/match/match-red-cards"

const HOME = 16
const AWAY = 1531

describe("buildMatchRedCards", () => {
  it("lists direct reds and second yellows by team", () => {
    const names = new Map<number, string>([
      [158433, "Y. Sithole"],
      [2873, "C. Montes"],
    ])

    const result = buildMatchRedCards(
      [
        {
          type: "Card",
          detail: "Red Card",
          player_id: 158433,
          team_id: AWAY,
          minute: 49,
          extra_minute: null,
        },
        {
          type: "Card",
          detail: "Yellow Card",
          player_id: 3287,
          team_id: AWAY,
          minute: 17,
          extra_minute: null,
        },
        {
          type: "Card",
          detail: "Red Card",
          player_id: 2873,
          team_id: HOME,
          minute: 90,
          extra_minute: 2,
        },
      ],
      HOME,
      names,
    )

    expect(result.away).toEqual([
      {
        playerId: 158433,
        displayName: "Y. Sithole",
        minute: 49,
        extraMinute: null,
      },
    ])
    expect(result.home).toEqual([
      {
        playerId: 2873,
        displayName: "C. Montes",
        minute: 90,
        extraMinute: 2,
      },
    ])
  })

  it("formats scorecard lines", () => {
    expect(
      formatRedCardLine({
        playerId: 1,
        displayName: "Y. Sithole",
        minute: 49,
        extraMinute: null,
      }),
    ).toBe("Y. Sithole 49'")
  })
})

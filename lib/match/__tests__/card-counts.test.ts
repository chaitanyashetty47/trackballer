import { describe, expect, it } from "vitest"

import { isRedCardDetail, isYellowCardDetail } from "@/lib/match/card-event-detail"
import { buildCardCountsMap } from "@/lib/match/card-counts"

describe("card-event-detail", () => {
  it("detects yellow, red, and second-yellow details", () => {
    expect(isYellowCardDetail("Yellow Card")).toBe(true)
    expect(isYellowCardDetail("Red Card")).toBe(false)
    expect(isRedCardDetail("Red Card")).toBe(true)
    expect(isRedCardDetail("Yellow-Red Card")).toBe(true)
    expect(isRedCardDetail("Yellow Card")).toBe(false)
  })
})

describe("buildCardCountsMap", () => {
  it("counts cards per player", () => {
    const map = buildCardCountsMap([
      {
        type: "Card",
        detail: "Yellow Card",
        minute: 17,
        extra_minute: null,
        player_id: 1,
      },
      {
        type: "Card",
        detail: "Red Card",
        minute: 49,
        extra_minute: null,
        player_id: 2,
      },
      {
        type: "Card",
        detail: "Yellow-Red Card",
        minute: 84,
        extra_minute: null,
        player_id: 3,
      },
    ])

    expect(map.get(1)).toEqual({ yellowCards: 1, redCards: 0 })
    expect(map.get(2)).toEqual({ yellowCards: 0, redCards: 1 })
    expect(map.get(3)).toEqual({ yellowCards: 0, redCards: 1 })
  })
})

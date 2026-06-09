import { describe, expect, it } from "vitest"

import { mapPlayerBrowseRow } from "@/lib/search/player-map"

describe("mapPlayerBrowseRow", () => {
  it("prefers first and last name for display", () => {
    const item = mapPlayerBrowseRow({
      id: 1,
      name: "Player 1",
      firstname: "Harry",
      lastname: "Kane",
      photo_url: null,
      nationality: "England",
      primary_position: "FWD",
      age: 31,
      club_team: { name: "Bayern Munich" },
      career: {
        display_score: 87,
        tier: "world_class",
        is_provisional: false,
      },
    })

    expect(item.displayName).toBe("Harry Kane")
    expect(item.displayScore).toBe(87)
    expect(item.clubName).toBe("Bayern Munich")
  })

  it("handles career aggregate returned as array", () => {
    const item = mapPlayerBrowseRow({
      id: 2,
      name: "Player 2",
      firstname: null,
      lastname: null,
      photo_url: null,
      nationality: null,
      primary_position: null,
      age: null,
      club_team: null,
      career: [
        {
          display_score: 6,
          tier: "good",
          is_provisional: true,
        },
      ],
    })

    expect(item.displayName).toBe("Player 2")
    expect(item.isProvisional).toBe(true)
    expect(item.tier).toBe("good")
  })
})

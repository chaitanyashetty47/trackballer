/** @vitest-environment node */

import { describe, expect, it } from "vitest"

import { rankRecentMatchLeaders } from "@/lib/world-cup/player-leaders"

describe("rankRecentMatchLeaders", () => {
  it("ignores rows below min rating count and ranks by weighted average", () => {
    const ranked = rankRecentMatchLeaders([
      { player_id: 1, avg_rating: 9, rating_count: 5 },
      { player_id: 1, avg_rating: 7, rating_count: 4 },
      { player_id: 2, avg_rating: 8.5, rating_count: 3 },
      { player_id: 3, avg_rating: 10, rating_count: 2 },
    ])

    expect(ranked).toEqual([
      { playerId: 2, score: 8.5, totalVotes: 3 },
      { playerId: 1, score: 8.11, totalVotes: 9 },
    ])
  })
})

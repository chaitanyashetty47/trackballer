import { describe, expect, it } from "vitest"

import { mapTrendingMatchCommentRow } from "../trending-match-comments"

const baseRow = {
  id: 1,
  body: "What a game",
  score: 5,
  upvote_count: 5,
  created_at: "2026-06-01T12:00:00Z",
  user_id: "user-1",
  profile: {
    username: "fan1",
    display_name: "Fan One",
    favourite_club: null,
    favourite_national_team: null,
  },
  fixture: {
    id: 100,
    season_id: 9,
    home_team: { id: 1, name: "Brazil", logo_url: null, code: "BRA" },
    away_team: { id: 2, name: "France", logo_url: null, code: "FRA" },
  },
}

describe("mapTrendingMatchCommentRow", () => {
  it("maps a World Cup season match comment", () => {
    const mapped = mapTrendingMatchCommentRow(baseRow, 9)
    expect(mapped?.fixtureId).toBe(100)
    expect(mapped?.homeTeam.name).toBe("Brazil")
    expect(mapped?.awayTeam.name).toBe("France")
  })

  it("drops comments from other seasons", () => {
    expect(mapTrendingMatchCommentRow(baseRow, 99)).toBeNull()
  })
})

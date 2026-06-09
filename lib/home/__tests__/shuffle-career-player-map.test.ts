import { describe, expect, it } from "vitest"

import { mapShuffleCareerPlayerRow } from "@/lib/home/shuffle-career-player-map"

describe("mapShuffleCareerPlayerRow", () => {
  it("maps RPC row to shuffle card", () => {
    const card = mapShuffleCareerPlayerRow({
      id: 153,
      name: "Player 153",
      firstname: "Ousmane",
      lastname: "Dembélé",
      photo_url: "https://example.com/photo.png",
      primary_position: "FWD",
      club_name: "Paris SG",
      display_score: 82,
      tier: "world_class",
    })

    expect(card).toEqual({
      id: 153,
      displayName: "Ousmane Dembélé",
      photoUrl: "https://example.com/photo.png",
      position: "FWD",
      clubName: "Paris SG",
      displayScore: 82,
      tier: "world_class",
    })
  })

  it("falls back to catalog name when first/last missing", () => {
    const card = mapShuffleCareerPlayerRow({
      id: 1,
      name: "Rodri",
      firstname: null,
      lastname: null,
      photo_url: "https://example.com/rodri.png",
      primary_position: "MID",
      club_name: null,
      display_score: 90,
      tier: "elite",
    })

    expect(card.displayName).toBe("Rodri")
    expect(card.clubName).toBeNull()
  })
})

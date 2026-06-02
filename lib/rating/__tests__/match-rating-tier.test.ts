import { describe, expect, it } from "vitest"

import { getMatchRatingTier } from "@/lib/rating/match-rating-tier"

describe("getMatchRatingTier", () => {
  it("returns empty when no rating", () => {
    expect(getMatchRatingTier(null)).toBe("empty")
    expect(getMatchRatingTier(undefined)).toBe("empty")
  })

  it("maps FotMob-style bands", () => {
    expect(getMatchRatingTier(9)).toBe("blue")
    expect(getMatchRatingTier(10)).toBe("blue")
    expect(getMatchRatingTier(8.99)).toBe("green")
    expect(getMatchRatingTier(7)).toBe("green")
    expect(getMatchRatingTier(6.99)).toBe("yellow")
    expect(getMatchRatingTier(6)).toBe("yellow")
    expect(getMatchRatingTier(5.99)).toBe("orange")
    expect(getMatchRatingTier(5)).toBe("orange")
    expect(getMatchRatingTier(4.99)).toBe("red")
    expect(getMatchRatingTier(3)).toBe("red")
    expect(getMatchRatingTier(2.99)).toBe("maroon")
    expect(getMatchRatingTier(1)).toBe("maroon")
  })
})

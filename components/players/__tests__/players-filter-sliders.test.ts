import { describe, expect, it } from "vitest"

import {
  formatRatingValue,
  isFullAgeRange,
  isNoMinRating,
} from "@/components/players/players-filter-sliders"

describe("players filter sliders", () => {
  it("isFullAgeRange when spanning catalog bounds", () => {
    expect(isFullAgeRange([16, 45])).toBe(true)
    expect(isFullAgeRange([18, 40])).toBe(false)
  })

  it("isNoMinRating at floor", () => {
    expect(isNoMinRating(1)).toBe(true)
    expect(isNoMinRating(5)).toBe(false)
  })

  it("formatRatingValue shows half steps", () => {
    expect(formatRatingValue(7)).toBe("7")
    expect(formatRatingValue(7.5)).toBe("7.5")
  })
})

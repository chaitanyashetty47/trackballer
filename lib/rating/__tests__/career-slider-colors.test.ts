import { describe, expect, it } from "vitest"

import {
  careerColorAtScore,
  careerSliderPercent,
  careerTrackGradient,
} from "@/lib/rating/career-slider-colors"

describe("careerTrackGradient", () => {
  it("includes tier CSS vars", () => {
    const gradient = careerTrackGradient()
    expect(gradient).toContain("--rating-elite")
    expect(gradient).toContain("--rating-unwatchable")
  })
})

describe("careerColorAtScore", () => {
  it("maps elite scores to elite token", () => {
    expect(careerColorAtScore(92)).toBe("var(--rating-elite)")
  })

  it("maps low scores to unwatchable token", () => {
    expect(careerColorAtScore(20)).toBe("var(--rating-unwatchable)")
  })
})

describe("careerSliderPercent", () => {
  it("maps min and max to 0 and 100", () => {
    expect(careerSliderPercent(1)).toBe(0)
    expect(careerSliderPercent(100)).toBe(100)
  })

  it("maps midpoint", () => {
    expect(careerSliderPercent(50)).toBeCloseTo(49.49, 1)
  })
})

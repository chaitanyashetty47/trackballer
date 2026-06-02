import { describe, expect, it } from "vitest"

import {
  careerTierCssVar,
  careerTierLabel,
  formatCareerScore,
  normalizeCareerTierSlug,
  tierForScore,
} from "@/lib/rating/career-tier"

describe("normalizeCareerTierSlug", () => {
  it("maps known DB slugs", () => {
    expect(normalizeCareerTierSlug("world_class")).toBe("world_class")
    expect(normalizeCareerTierSlug("provisional")).toBe("provisional")
  })

  it("falls back to provisional for unknown", () => {
    expect(normalizeCareerTierSlug(null)).toBe("provisional")
    expect(normalizeCareerTierSlug("unknown")).toBe("provisional")
  })
})

describe("careerTierLabel", () => {
  it("returns human labels", () => {
    expect(careerTierLabel("world_class")).toBe("World Class")
    expect(careerTierLabel("provisional")).toBe("Provisional")
  })
})

describe("careerTierCssVar", () => {
  it("maps to design tokens", () => {
    expect(careerTierCssVar("world_class")).toBe("--rating-world-class")
    expect(careerTierCssVar("provisional")).toBe("--rating-provisional")
  })
})

describe("tierForScore", () => {
  it("uses locked boundaries", () => {
    expect(tierForScore(9)).toBe("elite")
    expect(tierForScore(8.99)).toBe("world_class")
    expect(tierForScore(9.0)).toBe("elite")
    expect(tierForScore(2.99)).toBe("unwatchable")
  })
})

describe("formatCareerScore", () => {
  it("formats one decimal", () => {
    expect(formatCareerScore(8.17)).toBe("8.2")
    expect(formatCareerScore(null)).toBe("—")
  })
})

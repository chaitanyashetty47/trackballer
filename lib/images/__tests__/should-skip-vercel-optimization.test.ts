import { describe, expect, it } from "vitest"

import { shouldSkipVercelImageOptimization } from "@/lib/images/should-skip-vercel-optimization"

describe("shouldSkipVercelImageOptimization", () => {
  it("skips local static assets and SVGs", () => {
    expect(shouldSkipVercelImageOptimization("/football-svgrepo-com.svg")).toBe(true)
    expect(shouldSkipVercelImageOptimization("/stadium-svgrepo-com.svg")).toBe(true)
  })

  it("skips API-Football and FotMob CDN hosts", () => {
    expect(
      shouldSkipVercelImageOptimization(
        "https://media.api-sports.io/football/players/123.png",
      ),
    ).toBe(true)
    expect(
      shouldSkipVercelImageOptimization(
        "https://images.fotmob.com/image_resources/logo/leaguelogo/dark/47.png",
      ),
    ).toBe(true)
  })

  it("does not skip other remote URLs", () => {
    expect(
      shouldSkipVercelImageOptimization("https://cdn.example.com/photo.jpg"),
    ).toBe(false)
  })
})

import { describe, expect, it } from "vitest"

import { sevenDaysAgoIso, utcDayBounds } from "@/lib/home/dates"

describe("home dates", () => {
  it("sevenDaysAgoIso is seven days before now", () => {
    const now = new Date("2026-06-02T12:00:00.000Z")
    const since = new Date(sevenDaysAgoIso(now))
    expect(now.getTime() - since.getTime()).toBe(7 * 24 * 60 * 60 * 1000)
  })

  it("utcDayBounds covers the UTC calendar day", () => {
    const now = new Date("2026-06-02T15:30:00.000Z")
    const { start, end } = utcDayBounds(now)
    expect(start).toBe("2026-06-02T00:00:00.000Z")
    expect(end).toBe("2026-06-03T00:00:00.000Z")
  })
})

import { describe, expect, it } from "vitest"

import {
  formatCommentDate,
  getCommentTimeSince,
} from "@/lib/comment/format-time"

describe("formatCommentDate", () => {
  it("uses en-GB UTC regardless of runtime locale", () => {
    expect(formatCommentDate("2026-06-02T12:00:00.000Z")).toBe("2 Jun 2026")
  })
})

describe("getCommentTimeSince", () => {
  const now = new Date("2026-06-09T12:00:00.000Z").getTime()

  it("returns relative labels for recent comments", () => {
    expect(getCommentTimeSince("2026-06-09T11:30:00.000Z", now)).toBe("30m")
    expect(getCommentTimeSince("2026-06-09T11:59:30.000Z", now)).toBe("now")
  })

  it("falls back to stable date after 7 days", () => {
    expect(getCommentTimeSince("2026-05-01T12:00:00.000Z", now)).toBe("1 May 2026")
  })
})

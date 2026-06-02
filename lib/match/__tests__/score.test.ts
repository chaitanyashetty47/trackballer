/** @vitest-environment node */

import { describe, expect, it } from "vitest"

import {
  formatMatchKickoffDateTime,
  formatMatchScore,
  type MatchScoreFixture,
} from "@/lib/match/score"

function scoreFixture(overrides: Partial<MatchScoreFixture> = {}): MatchScoreFixture {
  return {
    status_short: "FT",
    kickoff_at: "2026-06-15T18:00:00.000Z",
    home_goals_ft: null,
    away_goals_ft: null,
    home_goals_et: null,
    away_goals_et: null,
    home_goals_pen: null,
    away_goals_pen: null,
    ...overrides,
  }
}

describe("formatMatchScore", () => {
  it("shows kickoff time and NS for upcoming fixtures", () => {
    const kickoff_at = "2026-06-15T18:00:00.000Z"
    const result = formatMatchScore(scoreFixture({ status_short: "NS", kickoff_at }))

    expect(result.statusLabel).toBe("NS")
    expect(result.isLive).toBe(false)
    expect(result.scoreline).toBe(
      new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }).format(new Date(kickoff_at)),
    )
  })

  it("formats full kickoff datetime deterministically", () => {
    expect(formatMatchKickoffDateTime("2022-12-18T20:30:00.000Z")).toBe(
      new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }).format(new Date("2022-12-18T20:30:00.000Z")),
    )
  })

  it("shows TBD status for TBD fixtures", () => {
    const result = formatMatchScore(scoreFixture({ status_short: "TBD" }))

    expect(result.statusLabel).toBe("TBD")
    expect(result.isLive).toBe(false)
  })

  it("shows FT score from full-time goals", () => {
    const result = formatMatchScore(
      scoreFixture({ status_short: "FT", home_goals_ft: 2, away_goals_ft: 1 }),
    )

    expect(result).toEqual({
      scoreline: "2 - 1",
      statusLabel: "FT",
      isLive: false,
    })
  })

  it("shows AET score from extra-time goals when present", () => {
    const result = formatMatchScore(
      scoreFixture({
        status_short: "AET",
        home_goals_ft: 1,
        away_goals_ft: 1,
        home_goals_et: 2,
        away_goals_et: 1,
      }),
    )

    expect(result).toEqual({
      scoreline: "2 - 1",
      statusLabel: "AET",
      isLive: false,
    })
  })

  it("shows regulation/AET score and pen tally for penalty shootouts", () => {
    const result = formatMatchScore(
      scoreFixture({
        status_short: "PEN",
        home_goals_ft: 1,
        away_goals_ft: 1,
        home_goals_et: 1,
        away_goals_et: 1,
        home_goals_pen: 4,
        away_goals_pen: 2,
      }),
    )

    expect(result).toEqual({
      scoreline: "1 - 1",
      statusLabel: "PEN (4-2)",
      isLive: false,
    })
  })

  it("marks in-play fixtures as LIVE with current score", () => {
    const result = formatMatchScore(
      scoreFixture({ status_short: "1H", home_goals_ft: 1, away_goals_ft: 0 }),
    )

    expect(result).toEqual({
      scoreline: "1 - 0",
      statusLabel: "LIVE",
      isLive: true,
    })
  })

  it("shows HT at half-time", () => {
    const result = formatMatchScore(
      scoreFixture({ status_short: "HT", home_goals_ft: 0, away_goals_ft: 0 }),
    )

    expect(result).toEqual({
      scoreline: "0 - 0",
      statusLabel: "HT",
      isLive: true,
    })
  })

  it("shows dash scoreline for interrupted fixtures", () => {
    const result = formatMatchScore(scoreFixture({ status_short: "PST" }))

    expect(result).toEqual({
      scoreline: "–",
      statusLabel: "PST",
      isLive: false,
    })
  })

  it("falls back when terminal status lacks goal data", () => {
    const result = formatMatchScore(scoreFixture({ status_short: "FT" }))

    expect(result).toEqual({
      scoreline: "–",
      statusLabel: "FT",
      isLive: false,
    })
  })
})

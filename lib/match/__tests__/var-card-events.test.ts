import { describe, expect, it } from "vitest"

import {
  buildVarCancelledCardKeys,
  filterVarCancelledCards,
  isVarCardCancellation,
} from "@/lib/match/var-card-events"

describe("isVarCardCancellation", () => {
  it("matches API-Football VAR card overturn strings", () => {
    expect(isVarCardCancellation("Var", "Card cancelled")).toBe(true)
    expect(isVarCardCancellation("Var", "Red card cancelled")).toBe(true)
    expect(isVarCardCancellation("Var", "Card upgrade")).toBe(false)
    expect(isVarCardCancellation("Var", "Card confirmed")).toBe(false)
    expect(isVarCardCancellation("Card", "Red Card")).toBe(false)
  })
})

describe("filterVarCancelledCards", () => {
  it("removes cards for the same player and minute as a VAR cancellation", () => {
    const events = [
      {
        type: "Card",
        detail: "Red Card",
        player_id: 158433,
        team_id: 1531,
        minute: 49,
        extra_minute: null,
      },
      {
        type: "Var",
        detail: "Card cancelled",
        player_id: 158433,
        team_id: 1531,
        minute: 49,
        extra_minute: null,
      },
      {
        type: "Card",
        detail: "Yellow Card",
        player_id: 3287,
        team_id: 1531,
        minute: 17,
        extra_minute: null,
      },
    ]

    const filtered = filterVarCancelledCards(events)
    expect(filtered).toHaveLength(2)
    expect(filtered.some((event) => event.type === "Card" && event.minute === 49)).toBe(false)
    expect(filtered.some((event) => event.type === "Var")).toBe(true)
  })

  it("builds keys from stoppage time including extra minute", () => {
    const keys = buildVarCancelledCardKeys([
      {
        type: "Var",
        detail: "Card cancelled",
        player_id: 99,
        team_id: 10,
        minute: 90,
        extra_minute: 2,
      },
    ])

    expect(keys.has("p:99:90:2")).toBe(true)
    expect(keys.has("p:99:90:0")).toBe(false)
  })
})

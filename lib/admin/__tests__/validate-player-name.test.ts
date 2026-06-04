import { describe, expect, it } from "vitest"

import {
  isPlayerStubName,
  validatePlayerNameUpdate,
} from "../validate-player-name"

describe("validate-player-name", () => {
  it("detects stub names", () => {
    expect(isPlayerStubName("Player 278")).toBe(true)
    expect(isPlayerStubName("Kylian Mbappe")).toBe(false)
  })

  it("blocks downgrade from real name to stub", () => {
    expect(validatePlayerNameUpdate("Kylian Mbappe", "Player 278")).toMatch(
      /stub/i,
    )
  })

  it("allows fixing stub to real name", () => {
    expect(validatePlayerNameUpdate("Player 278", "Kylian Mbappe")).toBeNull()
  })
})

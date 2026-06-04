import { describe, expect, it } from "vitest"

import { playerMatchesNameQuery } from "@/lib/search/player-name-query"

describe("playerMatchesNameQuery", () => {
  it("matches last name substring", () => {
    expect(playerMatchesNameQuery("Harry", "Kane", "H. Kane", "kane")).toBe(true)
  })

  it("matches catalog name when first/last missing", () => {
    expect(playerMatchesNameQuery(null, null, "C. Ronaldo", "ronaldo")).toBe(true)
  })

  it("matches full display string", () => {
    expect(playerMatchesNameQuery("Bruno", "Fernandes", "B. Fernandes", "bruno")).toBe(
      true,
    )
  })

  it("rejects unrelated names", () => {
    expect(playerMatchesNameQuery("Lionel", "Messi", "L. Messi", "kane")).toBe(false)
  })
})

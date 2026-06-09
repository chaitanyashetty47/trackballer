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

  it("matches without French accents", () => {
    expect(
      playerMatchesNameQuery("Jules Olivier", "Koundé", "J. Koundé", "kounde"),
    ).toBe(true)
  })

  it("matches without Croatian accents", () => {
    expect(
      playerMatchesNameQuery("Luka", "Modrić", "L. Modrić", "modric"),
    ).toBe(true)
  })

  it("matches without Spanish accents", () => {
    expect(
      playerMatchesNameQuery("Álvaro", "Morata", "Á. Morata", "alvaro"),
    ).toBe(true)
  })
})

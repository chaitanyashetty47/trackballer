import { describe, expect, it } from "vitest"

import { matchPlayerIdsFromIndex } from "@/lib/search/player-search-index"

describe("matchPlayerIdsFromIndex", () => {
  const index = [
    { id: 1, name: "H. Kane", firstname: "Harry", lastname: "Kane" },
    { id: 2, name: "L. Messi", firstname: "Lionel", lastname: "Messi" },
    { id: 3, name: "C. Ronaldo", firstname: "Cristiano", lastname: "Ronaldo" },
  ]

  it("matches last name substring", () => {
    expect(matchPlayerIdsFromIndex(index, "kane")).toEqual([1])
  })

  it("matches first name substring", () => {
    expect(matchPlayerIdsFromIndex(index, "bruno")).toEqual([])
    expect(matchPlayerIdsFromIndex(index, "lionel")).toEqual([2])
  })

  it("respects scope ids", () => {
    expect(matchPlayerIdsFromIndex(index, "ronaldo", [3])).toEqual([3])
    expect(matchPlayerIdsFromIndex(index, "ronaldo", [1])).toEqual([])
  })
})

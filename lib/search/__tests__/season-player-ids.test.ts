import { describe, expect, it } from "vitest"

import { mergeSeasonPlayerIds } from "@/lib/search/season-player-ids"

describe("mergeSeasonPlayerIds", () => {
  it("dedupes squad, appearance, and lineup ids", () => {
    expect(mergeSeasonPlayerIds([1, 2], [2, 3], [3, 4])).toEqual([1, 2, 3, 4])
  })
})

import { describe, expect, it } from "vitest"

import { teamsToComboboxOptions } from "@/lib/search/combobox-options"

describe("combobox filter options", () => {
  it("maps national teams with crest metadata", () => {
    const items = teamsToComboboxOptions([
      { id: 10, name: "England", logo_url: "https://x/eng.png", code: "ENG" },
    ])
    expect(items[0].id).toBe("10")
    expect(items[0].logo_url).toBe("https://x/eng.png")
  })

  it("maps clubs with crest metadata", () => {
    const items = teamsToComboboxOptions([
      { id: 33, name: "Manchester United", logo_url: "https://x/mu.png", code: "MUN" },
      { id: 40, name: "Liverpool", logo_url: null, code: "LIV" },
    ])
    expect(items).toHaveLength(2)
    expect(items[0].id).toBe("33")
    expect(items[0].logo_url).toBe("https://x/mu.png")
  })
})

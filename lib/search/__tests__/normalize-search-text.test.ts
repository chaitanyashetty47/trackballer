import { describe, expect, it } from "vitest"

import { normalizeSearchText } from "@/lib/search/normalize-search-text"

describe("normalizeSearchText", () => {
  it("folds French accents", () => {
    expect(normalizeSearchText("Koundé")).toBe("kounde")
  })

  it("folds Croatian accents", () => {
    expect(normalizeSearchText("Modrić")).toBe("modric")
  })

  it("folds Spanish accents", () => {
    expect(normalizeSearchText("Álvaro")).toBe("alvaro")
  })
})

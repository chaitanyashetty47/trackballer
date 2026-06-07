import { describe, expect, it } from "vitest"

import {
  normalizeUsername,
  validateUsernameFormat,
} from "@/lib/profile/validate-username"

describe("validateUsernameFormat", () => {
  it("accepts valid handles", () => {
    expect(validateUsernameFormat("chaitanya_47")).toBeNull()
    expect(validateUsernameFormat("sack_ole")).toBeNull()
  })

  it("rejects invalid shapes", () => {
    expect(validateUsernameFormat("ab")).toMatch(/3–20/)
    expect(validateUsernameFormat("_bad")).toMatch(/start with a letter/)
    expect(validateUsernameFormat("bad_")).toMatch(/end with _/)
    expect(validateUsernameFormat("admin")).toMatch(/reserved/)
  })

  it("normalizes to lowercase", () => {
    expect(normalizeUsername(" Chai_47 ")).toBe("chai_47")
  })
})

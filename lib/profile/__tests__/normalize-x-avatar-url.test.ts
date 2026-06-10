import { describe, expect, it } from "vitest"

import { normalizeXAvatarUrl } from "@/lib/profile/normalize-x-avatar-url"

describe("normalizeXAvatarUrl", () => {
  it("strips _normal from twimg URLs", () => {
    expect(
      normalizeXAvatarUrl(
        "https://pbs.twimg.com/profile_images/123/avatar_normal.jpg",
      ),
    ).toBe("https://pbs.twimg.com/profile_images/123/avatar.jpg")
  })

  it("leaves already-full-size twimg URLs unchanged", () => {
    const url = "https://pbs.twimg.com/profile_images/123/avatar.jpg"
    expect(normalizeXAvatarUrl(url)).toBe(url)
  })

  it("leaves non-X URLs unchanged", () => {
    const url = "https://lh3.googleusercontent.com/a/abc_normal=s96-c"
    expect(normalizeXAvatarUrl(url)).toBe(url)
  })

  it("returns null for missing or non-https values", () => {
    expect(normalizeXAvatarUrl(null)).toBeNull()
    expect(normalizeXAvatarUrl("http://pbs.twimg.com/x_normal.jpg")).toBeNull()
  })
})

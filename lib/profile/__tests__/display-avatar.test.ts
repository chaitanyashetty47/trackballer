import { describe, expect, it } from "vitest"

import {
  buildAvatarCacheUpdate,
  resolveDisplayAvatar,
} from "@/lib/profile/display-avatar"

describe("resolveDisplayAvatar", () => {
  it("uses google when avatar_source is google", () => {
    expect(
      resolveDisplayAvatar({
        avatar_source: "google",
        google_avatar_url: "https://google.test/a.jpg",
        x_avatar_url: "https://x.test/b.jpg",
      }),
    ).toBe("https://google.test/a.jpg")
  })

  it("uses x when avatar_source is x", () => {
    expect(
      resolveDisplayAvatar({
        avatar_source: "x",
        google_avatar_url: "https://google.test/a.jpg",
        x_avatar_url: "https://x.test/b.jpg",
      }),
    ).toBe("https://x.test/b.jpg")
  })

  it("falls back when preferred source is missing", () => {
    expect(
      resolveDisplayAvatar({
        avatar_source: "x",
        google_avatar_url: "https://google.test/a.jpg",
      }),
    ).toBe("https://google.test/a.jpg")
  })
})

describe("buildAvatarCacheUpdate", () => {
  it("writes resolved avatar_url for comments and nav", () => {
    expect(
      buildAvatarCacheUpdate({
        avatar_source: "google",
        google_avatar_url: "https://google.test/a.jpg",
        x_avatar_url: "https://x.test/b.jpg",
      }),
    ).toEqual({
      avatar_source: "google",
      avatar_url: "https://google.test/a.jpg",
    })
  })
})

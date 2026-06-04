import { describe, expect, it } from "vitest"

import {
  normalizeSocialHandle,
  socialHandlesSchema,
} from "../validate-social-handles"

describe("normalizeSocialHandle", () => {
  it("accepts bare handles", () => {
    expect(normalizeSocialHandle("twitter", "@KylianMbappe")).toEqual({
      ok: true,
      handle: "KylianMbappe",
    })
  })

  it("parses twitter profile URLs", () => {
    expect(normalizeSocialHandle("twitter", "https://x.com/some_user")).toEqual({
      ok: true,
      handle: "some_user",
    })
  })

  it("rejects wrong host for instagram", () => {
    expect(normalizeSocialHandle("instagram", "https://x.com/foo")).toMatchObject({
      ok: false,
    })
  })

  it("parses reddit /u/ links", () => {
    expect(normalizeSocialHandle("reddit", "https://reddit.com/u/plastic_fan")).toEqual({
      ok: true,
      handle: "plastic_fan",
    })
  })

  it("empty becomes null", () => {
    expect(normalizeSocialHandle("tiktok", "  ")).toEqual({ ok: true, handle: null })
  })
})

describe("socialHandlesSchema", () => {
  it("normalizes mixed inputs", () => {
    const parsed = socialHandlesSchema.parse({
      twitterHandle: "https://twitter.com/TestUser",
      instagramHandle: "@photos",
      tiktokHandle: null,
      redditHandle: "",
    })
    expect(parsed.twitterHandle).toBe("TestUser")
    expect(parsed.instagramHandle).toBe("photos")
    expect(parsed.tiktokHandle).toBeNull()
    expect(parsed.redditHandle).toBeNull()
  })
})

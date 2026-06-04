import { describe, expect, it } from "vitest"

import { parseAppMetadataClaims } from "../session-claims"

describe("parseAppMetadataClaims", () => {
  it("defaults to false when app_metadata is missing", () => {
    expect(parseAppMetadataClaims(undefined)).toEqual({
      isAdmin: false,
      isOnboarded: false,
    })
  })

  it("reads is_admin and is_onboarded when true", () => {
    expect(
      parseAppMetadataClaims({
        is_admin: true,
        is_onboarded: true,
      }),
    ).toEqual({
      isAdmin: true,
      isOnboarded: true,
    })
  })

  it("treats non-boolean values as false", () => {
    expect(
      parseAppMetadataClaims({
        is_admin: "true",
        is_onboarded: 1,
      }),
    ).toEqual({
      isAdmin: false,
      isOnboarded: false,
    })
  })
})

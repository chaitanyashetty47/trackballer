import { describe, expect, it } from "vitest"

import { getCommentAuthorDisplay } from "@/lib/comment/author-display"

describe("getCommentAuthorDisplay", () => {
  const authorId = "11111111-1111-1111-1111-111111111111"
  const otherId = "22222222-2222-2222-2222-222222222222"

  it("shows You and /profile for the signed-in author", () => {
    expect(
      getCommentAuthorDisplay({
        currentUserId: authorId,
        authorUserId: authorId,
        username: "tasker",
        displayName: "Tasker",
      }),
    ).toEqual({ label: "You", href: "/profile" })
  })

  it("shows @username and public profile for other users", () => {
    expect(
      getCommentAuthorDisplay({
        currentUserId: otherId,
        authorUserId: authorId,
        username: "tasker",
        displayName: "Tasker",
      }),
    ).toEqual({ label: "@tasker", href: "/u/tasker" })
  })

  it("falls back to display name when username is missing", () => {
    expect(
      getCommentAuthorDisplay({
        currentUserId: null,
        authorUserId: authorId,
        username: null,
        displayName: "Tasker",
      }),
    ).toEqual({ label: "@Tasker", href: null })
  })

  it("treats guests like any other viewer", () => {
    expect(
      getCommentAuthorDisplay({
        currentUserId: null,
        authorUserId: authorId,
        username: "tasker",
      }),
    ).toEqual({ label: "@tasker", href: "/u/tasker" })
  })
})

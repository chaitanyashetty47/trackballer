/** @vitest-environment node */

import { describe, expect, it } from "vitest"

import {
  attachRepliesToComments,
  buildUserVotesMap,
  collectCommentIds,
  normalizeCommentRow,
} from "@/lib/comment/normalize"

function rawComment(
  overrides: Partial<Parameters<typeof normalizeCommentRow>[0]> = {},
): Parameters<typeof normalizeCommentRow>[0] {
  return {
    id: 1,
    body: "Hello",
    score: 3,
    upvote_count: 4,
    downvote_count: 1,
    created_at: "2026-06-01T12:00:00.000Z",
    is_deleted: false,
    parent_id: null,
    user_id: "user-a",
    player_id: 99,
    fixture_id: null,
    target_type: "player",
    profile: {
      id: "user-a",
      display_name: "fan1",
      avatar_url: null,
      favourite_club: null,
    },
    ...overrides,
  }
}

describe("normalizeCommentRow", () => {
  it("defaults missing profile to null and replies to empty", () => {
    const row = normalizeCommentRow(rawComment({ profile: undefined }))
    expect(row.profile).toBeNull()
    expect(row.replies).toEqual([])
  })
})

describe("attachRepliesToComments", () => {
  it("groups replies under the correct parent sorted by created_at", () => {
    const parents = [
      normalizeCommentRow(rawComment({ id: 10 })),
      normalizeCommentRow(rawComment({ id: 20 })),
    ]

    const result = attachRepliesToComments(parents, [
      rawComment({ id: 102, parent_id: 10, created_at: "2026-06-01T14:00:00.000Z" }),
      rawComment({ id: 101, parent_id: 10, created_at: "2026-06-01T13:00:00.000Z" }),
      rawComment({ id: 201, parent_id: 20, created_at: "2026-06-01T15:00:00.000Z" }),
    ])

    expect(result[0]?.replies.map((r) => r.id)).toEqual([101, 102])
    expect(result[1]?.replies.map((r) => r.id)).toEqual([201])
    expect(result[0]?.replies.every((r) => r.replies.length === 0)).toBe(true)
  })

  it("ignores reply rows with no parent_id", () => {
    const parents = [normalizeCommentRow(rawComment({ id: 10 }))]
    const result = attachRepliesToComments(parents, [
      rawComment({ id: 99, parent_id: null }),
    ])
    expect(result[0]?.replies).toEqual([])
  })
})

describe("collectCommentIds", () => {
  it("returns parent and nested reply ids", () => {
    const parents = attachRepliesToComments(
      [normalizeCommentRow(rawComment({ id: 10 }))],
      [rawComment({ id: 11, parent_id: 10 })],
    )
    expect(collectCommentIds(parents)).toEqual([10, 11])
  })
})

describe("buildUserVotesMap", () => {
  it("maps vote values to 1 or -1", () => {
    expect(
      buildUserVotesMap([
        { comment_id: 1, value: 1 },
        { comment_id: 2, value: -1 },
      ]),
    ).toEqual({ 1: 1, 2: -1 })
  })
})

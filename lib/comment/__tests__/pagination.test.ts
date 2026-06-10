import { describe, expect, it } from "vitest"

import {
  appendThreadComments,
  appendUniqueParents,
} from "@/lib/comment/comment-tree"
import type { CommentDisplay } from "@/lib/comment/types"
import {
  parentCursorFromComment,
  replyCursorFromComment,
} from "@/lib/comment/pagination"

function comment(
  overrides: Partial<CommentDisplay> & { id: number },
): CommentDisplay {
  const { id, body, score, created_at, parent_id, replies, ...rest } = overrides
  return {
    body: body ?? "Hello",
    score: score ?? 0,
    upvote_count: 0,
    downvote_count: 0,
    created_at: created_at ?? "2026-06-01T12:00:00.000Z",
    is_deleted: false,
    parent_id: parent_id ?? null,
    user_id: "user-a",
    player_id: 1,
    fixture_id: null,
    target_type: "player",
    thread_root_id: null,
    thread_depth: 0,
    profile: null,
    replies: replies ?? [],
    ...rest,
    id,
  }
}

describe("parentCursorFromComment", () => {
  it("builds top cursor from score and id", () => {
    expect(
      parentCursorFromComment(comment({ id: 9, score: 12 }), "top"),
    ).toEqual({ sort: "top", score: 12, id: 9 })
  })

  it("builds new cursor from created_at and id", () => {
    expect(
      parentCursorFromComment(
        comment({ id: 3, created_at: "2026-06-02T08:00:00.000Z" }),
        "new",
      ),
    ).toEqual({ sort: "new", created_at: "2026-06-02T08:00:00.000Z", id: 3 })
  })
})

describe("replyCursorFromComment", () => {
  it("uses created_at and id", () => {
    expect(
      replyCursorFromComment(
        comment({ id: 44, created_at: "2026-06-03T10:00:00.000Z" }),
      ),
    ).toEqual({ created_at: "2026-06-03T10:00:00.000Z", id: 44 })
  })
})

describe("appendUniqueParents", () => {
  it("dedupes by id and keeps order", () => {
    const existing = [comment({ id: 1 }), comment({ id: 2 })]
    const incoming = [comment({ id: 2 }), comment({ id: 3 })]
    expect(appendUniqueParents(existing, incoming).map((row) => row.id)).toEqual([
      1, 2, 3,
    ])
  })
})

describe("appendThreadComments", () => {
  it("merges replies oldest-first without duplicates", () => {
    const tree = [
      comment({
        id: 10,
        replies: [
          comment({
            id: 101,
            parent_id: 10,
            created_at: "2026-06-01T12:00:00.000Z",
          }),
        ],
      }),
    ]

    const next = appendThreadComments(tree, 10, [
      comment({
        id: 101,
        parent_id: 10,
        created_at: "2026-06-01T12:00:00.000Z",
      }),
      comment({
        id: 102,
        parent_id: 10,
        created_at: "2026-06-01T13:00:00.000Z",
      }),
    ])

    expect(next[0]?.replies.map((row) => row.id)).toEqual([101, 102])
  })
})

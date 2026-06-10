/** @vitest-environment node */

import { describe, expect, it } from "vitest"

import { updateVoteInTree } from "@/lib/comment/comment-tree"
import {
  deleteCommentInTree,
  mergeServerWithPendingComments,
  pruneDeletedComments,
  replaceCommentInTree,
  settlePendingComment,
} from "@/lib/comment/comment-tree"
import { computeVoteTransition } from "@/lib/comment/optimistic-vote"
import type { CommentDisplay } from "@/lib/comment/types"

function comment(overrides: Partial<CommentDisplay> = {}): CommentDisplay {
  return {
    id: 1,
    body: "Test",
    score: 5,
    upvote_count: 6,
    downvote_count: 1,
    created_at: "2026-06-01T12:00:00.000Z",
    is_deleted: false,
    parent_id: null,
    user_id: "user-a",
    player_id: 10,
    fixture_id: null,
    target_type: "player",
    thread_root_id: null,
    thread_depth: 0,
    profile: null,
    replies: [],
    ...overrides,
  }
}

describe("computeVoteTransition", () => {
  it("adds an upvote when none exists", () => {
    expect(computeVoteTransition(null, 1)).toEqual({
      nextVote: 1,
      scoreDelta: 1,
      upvoteDelta: 1,
      downvoteDelta: 0,
    })
  })

  it("removes an upvote when clicking up again", () => {
    expect(computeVoteTransition(1, 1)).toEqual({
      nextVote: null,
      scoreDelta: -1,
      upvoteDelta: -1,
      downvoteDelta: 0,
    })
  })

  it("flips from downvote to upvote", () => {
    expect(computeVoteTransition(-1, 1)).toEqual({
      nextVote: 1,
      scoreDelta: 2,
      upvoteDelta: 1,
      downvoteDelta: -1,
    })
  })
})

describe("updateVoteInTree", () => {
  it("updates score on a nested reply instantly", () => {
    const tree = [
      comment({
        id: 10,
        replies: [comment({ id: 11, score: 2, upvote_count: 2, downvote_count: 0 })],
      }),
    ]

    const transition = computeVoteTransition(null, 1)
    const next = updateVoteInTree(tree, 11, transition)

    expect(next[0]?.replies[0]?.score).toBe(3)
    expect(next[0]?.replies[0]?.upvote_count).toBe(3)
  })
})

describe("replaceCommentInTree", () => {
  it("swaps a pending comment for the saved one without duplicating", () => {
    const pending = comment({ id: -100, body: "pending", isPending: true, parent_id: 10 })
    const real = comment({ id: 42, body: "pending", parent_id: 10 })
    const tree = [comment({ id: 10, replies: [pending] })]

    const next = replaceCommentInTree(tree, -100, real)

    expect(next[0]?.replies).toHaveLength(1)
    expect(next[0]?.replies[0]?.id).toBe(42)
    expect(next[0]?.replies[0]?.isPending).toBeUndefined()
  })
})

describe("settlePendingComment", () => {
  it("drops the temp row when revalidation already added the saved comment", () => {
    const pending = comment({ id: -100, body: "hey lol", isPending: true, user_id: "u1" })
    const saved = comment({ id: 42, body: "hey lol", user_id: "u1" })
    const tree = [pending, saved]

    const next = settlePendingComment(tree, -100, saved)

    expect(next).toHaveLength(1)
    expect(next[0]?.id).toBe(42)
  })
})

describe("mergeServerWithPendingComments", () => {
  it("keeps pending rows until the server returns a matching saved comment", () => {
    const pending = comment({ id: -100, body: "hey lol", isPending: true, user_id: "u1" })
    const local = [pending]
    const server: ReturnType<typeof comment>[] = []

    expect(mergeServerWithPendingComments(server, local)).toHaveLength(1)
    expect(mergeServerWithPendingComments(server, local)[0]?.isPending).toBe(true)

    const saved = comment({ id: 42, body: "hey lol", user_id: "u1" })
    const merged = mergeServerWithPendingComments([saved], local)
    expect(merged).toHaveLength(1)
    expect(merged[0]?.id).toBe(42)
  })
})

describe("deleteCommentInTree", () => {
  it("removes a top-level comment with no replies", () => {
    const tree = [comment({ id: 1 })]
    expect(deleteCommentInTree(tree, 1)).toEqual([])
  })

  it("keeps a deleted stub when replies remain", () => {
    const tree = [
      comment({
        id: 1,
        replies: [comment({ id: 2, parent_id: 1 })],
      }),
    ]
    const next = deleteCommentInTree(tree, 1)
    expect(next).toHaveLength(1)
    expect(next[0]?.is_deleted).toBe(true)
    expect(next[0]?.replies).toHaveLength(1)
  })

  it("removes a reply without stubbing the parent", () => {
    const tree = [comment({ id: 1, replies: [comment({ id: 2, parent_id: 1 })] })]
    const next = deleteCommentInTree(tree, 2)
    expect(next[0]?.is_deleted).toBe(false)
    expect(next[0]?.replies).toEqual([])
  })

  it("keeps a deleted stub when a nested reply has children", () => {
    const tree = [
      comment({
        id: 1,
        replies: [
          comment({ id: 2, parent_id: 1, thread_root_id: 1, thread_depth: 1 }),
          comment({ id: 3, parent_id: 2, thread_root_id: 1, thread_depth: 2 }),
        ],
      }),
    ]
    const next = deleteCommentInTree(tree, 2)
    expect(next[0]?.replies).toHaveLength(2)
    expect(next[0]?.replies.find((row) => row.id === 2)?.is_deleted).toBe(true)
  })
})

describe("pruneDeletedComments", () => {
  it("drops deleted comments with no replies", () => {
    const tree = [comment({ id: 1, is_deleted: true })]
    expect(pruneDeletedComments(tree)).toEqual([])
  })
})

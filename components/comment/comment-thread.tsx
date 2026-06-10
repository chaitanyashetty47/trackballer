"use client"

import { useEffect, useMemo, useState, useTransition } from "react"

import { CommentItem } from "./comment-item"
import { CommentComposer } from "./comment-composer"
import {
  addCommentToTree,
  settlePendingComment,
  removeCommentById,
  deleteCommentInTree,
  mergeServerWithPendingComments,
  pruneDeletedComments,
  sortComments,
  updateVoteInTree,
} from "@/lib/comment/comment-tree"
import {
  applyUserVoteToMap,
  computeVoteTransition,
} from "@/lib/comment/optimistic-vote"
import { submitComment, deleteComment } from "@/lib/comment/submit-comment"
import { submitVote } from "@/lib/comment/submit-vote"
import type { CommentDisplay, CommentWithProfile } from "@/lib/comment/types"

interface CommentThreadProps {
  initialComments: CommentWithProfile[]
  initialUserVotes: Record<number, 1 | -1>
  targetType: "player" | "match"
  targetId: number
  isLoggedIn: boolean
  currentUserId: string | null
}

function buildPendingComment(
  body: string,
  targetType: "player" | "match",
  targetId: number,
  currentUserId: string,
  parentId?: number,
): CommentDisplay {
  return {
    id: -Date.now(),
    body,
    score: 0,
    upvote_count: 0,
    downvote_count: 0,
    created_at: new Date().toISOString(),
    is_deleted: false,
    parent_id: parentId ?? null,
    user_id: currentUserId,
    player_id: targetType === "player" ? targetId : null,
    fixture_id: targetType === "match" ? targetId : null,
    target_type: targetType,
    profile: {
      id: currentUserId,
      username: null,
      display_name: "You",
      avatar_url: null,
      favourite_club: null,
      favourite_national_team: null,
    },
    replies: [],
    isPending: true,
  }
}

export function CommentThread({
  initialComments,
  initialUserVotes,
  targetType,
  targetId,
  isLoggedIn,
  currentUserId,
}: CommentThreadProps) {
  const [sort, setSort] = useState<"top" | "new">("top")
  const [comments, setComments] = useState<CommentDisplay[]>(initialComments)
  const [userVotes, setUserVotes] = useState(initialUserVotes)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    setComments((prev) =>
      mergeServerWithPendingComments(pruneDeletedComments(initialComments), prev),
    )
    setUserVotes(initialUserVotes)
  }, [initialComments, initialUserVotes])

  const visibleComments = useMemo(
    () => pruneDeletedComments(comments),
    [comments],
  )

  const sortedComments = useMemo(
    () => sortComments(visibleComments, sort),
    [visibleComments, sort],
  )

  const topLevelCount = visibleComments.length

  function handleVote(commentId: number, value: 1 | -1) {
    if (!isLoggedIn) {
      window.location.href = "/login"
      return
    }

    const currentVote = userVotes[commentId] ?? null
    const transition = computeVoteTransition(currentVote, value)
    const snapshotComments = comments
    const snapshotVotes = userVotes

    setUserVotes(applyUserVoteToMap(userVotes, commentId, transition.nextVote))
    setComments(updateVoteInTree(comments, commentId, transition))
    setErrorMessage(null)

    startTransition(async () => {
      const result = await submitVote({
        comment_id: commentId,
        value: String(value) as "1" | "-1",
      })

      if (!result.ok) {
        setComments(snapshotComments)
        setUserVotes(snapshotVotes)
        setErrorMessage(result.error)
      }
    })
  }

  function handleDelete(commentId: number) {
    const snapshotComments = comments

    setComments(deleteCommentInTree(comments, commentId))
    setErrorMessage(null)

    startTransition(async () => {
      const result = await deleteComment({ comment_id: commentId })
      if (!result.ok) {
        setComments(snapshotComments)
        setErrorMessage(result.error)
      }
    })
  }

  function handlePostComment(
    body: string,
    parentId?: number,
  ): Promise<{ ok: boolean; error?: string }> {
    if (!isLoggedIn || !currentUserId) {
      return Promise.resolve({ ok: false, error: "Sign in to comment." })
    }

    const pending = buildPendingComment(
      body,
      targetType,
      targetId,
      currentUserId,
      parentId,
    )
    const tempId = pending.id

    setComments((prev) => addCommentToTree(prev, pending))

    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await submitComment({
          body,
          target_type: targetType,
          ...(targetType === "player"
            ? { player_id: targetId }
            : { fixture_id: targetId }),
          ...(parentId != null ? { parent_id: parentId } : {}),
        })

        if (result.ok) {
          setComments((prev) => settlePendingComment(prev, tempId, result.comment))
          resolve({ ok: true })
          return
        }

        setComments((prev) => removeCommentById(prev, tempId))
        setErrorMessage(result.error)
        resolve({ ok: false, error: result.error })
      })
    })
  }

  return (
    <section className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Comments ({topLevelCount})</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSort("top")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              sort === "top"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Top
          </button>
          <button
            type="button"
            onClick={() => setSort("new")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              sort === "new"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            New
          </button>
        </div>
      </div>

      <CommentComposer
        isLoggedIn={isLoggedIn}
        onPost={(body) => handlePostComment(body)}
      />

      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      {sortedComments.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-6">
          {sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              userVote={userVotes[comment.id] ?? null}
              isLoggedIn={isLoggedIn}
              currentUserId={currentUserId}
              depth={0}
              userVotesMap={userVotes}
              onVote={handleVote}
              onDelete={handleDelete}
              onPostReply={(body, parentId) => handlePostComment(body, parentId)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

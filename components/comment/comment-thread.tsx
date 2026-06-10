"use client"

import { useCallback, useEffect, useMemo, useState, useTransition, ViewTransition } from "react"

import { CommentThreadBlock } from "./comment-thread-block"
import { CommentComposer } from "./comment-composer"
import { useInfiniteScroll } from "./use-infinite-scroll"
import {
  addCommentToTree,
  appendThreadComments,
  appendUniqueParents,
  settlePendingComment,
  removeCommentById,
  deleteCommentInTree,
  mergeServerWithPendingComments,
  pruneDeletedComments,
  updateVoteInTree,
} from "@/lib/comment/comment-tree"
import {
  fetchParentCommentsPageAction,
  fetchThreadCommentsPageAction,
} from "@/lib/comment/fetch-comments-page"
import {
  applyUserVoteToMap,
  computeVoteTransition,
} from "@/lib/comment/optimistic-vote"
import type {
  CommentSort,
  ParentCursor,
  ReplyPaginationMeta,
} from "@/lib/comment/pagination"
import { submitComment, deleteComment } from "@/lib/comment/submit-comment"
import { submitVote } from "@/lib/comment/submit-vote"
import type { CommentDisplay, CommentWithProfile } from "@/lib/comment/types"

interface CommentThreadProps {
  initialComments: CommentWithProfile[]
  initialUserVotes: Record<number, 1 | -1>
  totalParentCount: number
  initialParentHasMore: boolean
  initialParentNextCursor: ParentCursor | null
  initialReplyPagination: Record<number, ReplyPaginationMeta>
  initialSort?: CommentSort
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
    thread_root_id: null,
    thread_depth: 0,
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

function mergeVoteMaps(
  existing: Record<number, 1 | -1>,
  incoming: Record<number, 1 | -1>,
): Record<number, 1 | -1> {
  return { ...existing, ...incoming }
}

export function CommentThread({
  initialComments,
  initialUserVotes,
  totalParentCount: initialTotalParentCount,
  initialParentHasMore,
  initialParentNextCursor,
  initialReplyPagination,
  initialSort = "top",
  targetType,
  targetId,
  isLoggedIn,
  currentUserId,
}: CommentThreadProps) {
  const [sort, setSort] = useState<CommentSort>(initialSort)
  const [comments, setComments] = useState<CommentDisplay[]>(initialComments)
  const [userVotes, setUserVotes] = useState(initialUserVotes)
  const [totalParentCount, setTotalParentCount] = useState(initialTotalParentCount)
  const [parentHasMore, setParentHasMore] = useState(initialParentHasMore)
  const [parentCursor, setParentCursor] = useState<ParentCursor | null>(
    initialParentNextCursor,
  )
  const [replyMeta, setReplyMeta] =
    useState<Record<number, ReplyPaginationMeta>>(initialReplyPagination)
  const [loadingThreadFor, setLoadingThreadFor] = useState<number | null>(null)
  const [isLoadingParents, setIsLoadingParents] = useState(false)
  const [isLoadingSort, setIsLoadingSort] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    setComments((prev) =>
      mergeServerWithPendingComments(pruneDeletedComments(initialComments), prev),
    )
    setUserVotes(initialUserVotes)
    setTotalParentCount(initialTotalParentCount)
    setParentHasMore(initialParentHasMore)
    setParentCursor(initialParentNextCursor)
    setReplyMeta(initialReplyPagination)
    setSort(initialSort)
  }, [
    initialComments,
    initialUserVotes,
    initialTotalParentCount,
    initialParentHasMore,
    initialParentNextCursor,
    initialReplyPagination,
    initialSort,
  ])

  const visibleComments = useMemo(
    () => pruneDeletedComments(comments),
    [comments],
  )

  const loadMoreParents = useCallback(() => {
    if (!parentHasMore || isLoadingParents || isLoadingSort) return

    setIsLoadingParents(true)
    startTransition(async () => {
      const result = await fetchParentCommentsPageAction({
        target_type: targetType,
        target_id: targetId,
        sort,
        cursor: parentCursor ?? undefined,
      })

      setIsLoadingParents(false)

      if (!result.ok) {
        setErrorMessage(result.error)
        return
      }

      setComments((prev) =>
        appendUniqueParents(prev, pruneDeletedComments(result.comments)),
      )
      setUserVotes((prev) => mergeVoteMaps(prev, result.userVotes))
      setParentHasMore(result.hasMore)
      setParentCursor(result.nextCursor)
      setReplyMeta((prev) => ({ ...prev, ...result.replyPagination }))
    })
  }, [
    parentHasMore,
    isLoadingParents,
    isLoadingSort,
    targetType,
    targetId,
    sort,
    parentCursor,
    startTransition,
  ])

  const parentSentinelRef = useInfiniteScroll({
    hasMore: parentHasMore,
    isLoading: isLoadingParents || isLoadingSort,
    onLoadMore: loadMoreParents,
  })

  function handleSortChange(nextSort: CommentSort) {
    if (nextSort === sort || isLoadingSort) return

    setSort(nextSort)
    setIsLoadingSort(true)
    setErrorMessage(null)

    startTransition(async () => {
      const result = await fetchParentCommentsPageAction({
        target_type: targetType,
        target_id: targetId,
        sort: nextSort,
      })

      setIsLoadingSort(false)

      if (!result.ok) {
        setErrorMessage(result.error)
        return
      }

      setComments((prev) =>
        mergeServerWithPendingComments(pruneDeletedComments(result.comments), prev),
      )
      setUserVotes((prev) => mergeVoteMaps(prev, result.userVotes))
      setParentHasMore(result.hasMore)
      setParentCursor(result.nextCursor)
      setReplyMeta(result.replyPagination)
    })
  }

  function handleLoadMoreThread(threadRootId: number) {
    const meta = replyMeta[threadRootId]
    if (!meta?.hasMore || loadingThreadFor != null) return

    setLoadingThreadFor(threadRootId)
    setErrorMessage(null)

    startTransition(async () => {
      const result = await fetchThreadCommentsPageAction({
        thread_root_id: threadRootId,
        cursor: meta.nextCursor ?? undefined,
      })

      setLoadingThreadFor(null)

      if (!result.ok) {
        setErrorMessage(result.error)
        return
      }

      setComments((prev) => appendThreadComments(prev, threadRootId, result.replies))
      setUserVotes((prev) => mergeVoteMaps(prev, result.userVotes))
      setReplyMeta((prev) => ({
        ...prev,
        [threadRootId]: { hasMore: result.hasMore, nextCursor: result.nextCursor },
      }))
    })
  }

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
    if (parentId == null) {
      setTotalParentCount((count) => count + 1)
    }

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
        if (parentId == null) {
          setTotalParentCount((count) => Math.max(0, count - 1))
        }
        setErrorMessage(result.error)
        resolve({ ok: false, error: result.error })
      })
    })
  }

  return (
    <section className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Comments ({totalParentCount})</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleSortChange("top")}
            disabled={isLoadingSort}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
              sort === "top"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Top
          </button>
          <button
            type="button"
            onClick={() => handleSortChange("new")}
            disabled={isLoadingSort}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
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

      {visibleComments.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className={`space-y-6 ${isLoadingSort ? "opacity-60" : ""}`}>
          {visibleComments.map((comment) => (
            <ViewTransition key={comment.id} enter="fade-in" default="none">
              <CommentThreadBlock
                root={comment}
                userVotesMap={userVotes}
                threadMeta={replyMeta[comment.id]}
                isLoadingThread={loadingThreadFor === comment.id}
                isLoggedIn={isLoggedIn}
                currentUserId={currentUserId}
                onVote={handleVote}
                onDelete={handleDelete}
                onPostReply={(body, parentId) => handlePostComment(body, parentId)}
                onLoadMoreThread={handleLoadMoreThread}
              />
            </ViewTransition>
          ))}

          {parentHasMore && (
            <div ref={parentSentinelRef} className="flex justify-center py-4">
              {isLoadingParents && (
                <p className="text-sm text-muted-foreground">Loading more comments…</p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

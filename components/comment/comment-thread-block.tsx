"use client"

import { ViewTransition } from "react"

import { CommentItem } from "./comment-item"
import { useInfiniteScroll } from "./use-infinite-scroll"
import type { ReplyPaginationMeta } from "@/lib/comment/pagination"
import type { CommentDisplay } from "@/lib/comment/types"

type CommentThreadBlockProps = {
  root: CommentDisplay
  userVotesMap: Record<number, 1 | -1>
  threadMeta?: ReplyPaginationMeta
  isLoadingThread: boolean
  isLoggedIn: boolean
  currentUserId: string | null
  onVote: (commentId: number, value: 1 | -1) => void
  onDelete: (commentId: number) => void
  onPostReply: (body: string, parentId: number) => Promise<{ ok: boolean; error?: string }>
  onLoadMoreThread: (threadRootId: number) => void
}

export function CommentThreadBlock({
  root,
  userVotesMap,
  threadMeta,
  isLoadingThread,
  isLoggedIn,
  currentUserId,
  onVote,
  onDelete,
  onPostReply,
  onLoadMoreThread,
}: CommentThreadBlockProps) {
  const threadHasMore = threadMeta?.hasMore ?? false

  const threadSentinelRef = useInfiniteScroll({
    hasMore: threadHasMore,
    isLoading: isLoadingThread,
    onLoadMore: () => onLoadMoreThread(root.id),
  })

  return (
    <div className="space-y-4">
      <CommentItem
        comment={root}
        userVote={userVotesMap[root.id] ?? null}
        isLoggedIn={isLoggedIn}
        currentUserId={currentUserId}
        depth={0}
        onVote={onVote}
        onDelete={onDelete}
        onPostReply={onPostReply}
      />

      {root.replies.length > 0 && (
        <div className="space-y-4">
          {root.replies.map((reply) => (
            <ViewTransition key={reply.id} enter="fade-in" default="none">
              <CommentItem
                comment={reply}
                userVote={userVotesMap[reply.id] ?? null}
                isLoggedIn={isLoggedIn}
                currentUserId={currentUserId}
                depth={reply.thread_depth}
                onVote={onVote}
                onDelete={onDelete}
                onPostReply={onPostReply}
              />
            </ViewTransition>
          ))}
        </div>
      )}

      {threadHasMore && (
        <div ref={threadSentinelRef} className="flex justify-center py-2">
          {isLoadingThread && (
            <p className="text-xs text-muted-foreground">Loading more replies…</p>
          )}
        </div>
      )}
    </div>
  )
}

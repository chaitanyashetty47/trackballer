"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { CommentComposer } from "./comment-composer"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CommentTime } from "@/components/comment/comment-time"
import type { CommentDisplay } from "@/lib/comment/types"

interface CommentItemProps {
  comment: CommentDisplay
  userVote: 1 | -1 | null
  isLoggedIn: boolean
  currentUserId: string | null
  depth?: 0 | 1
  userVotesMap: Record<number, 1 | -1>
  onVote: (commentId: number, value: 1 | -1) => void
  onDelete: (commentId: number) => void
  onPostReply: (body: string, parentId: number) => Promise<{ ok: boolean; error?: string }>
}

export function CommentItem({
  comment,
  userVote,
  isLoggedIn,
  currentUserId,
  depth = 0,
  userVotesMap,
  onVote,
  onDelete,
  onPostReply,
}: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const isPending = comment.isPending === true
  const isDeletedStub = comment.is_deleted
  const isOwner = currentUserId === comment.user_id
  const handle =
    comment.profile?.username ?? comment.profile?.display_name ?? "user"
  const profileHref = comment.profile?.username
    ? `/u/${comment.profile.username}`
    : null

  function confirmDelete() {
    onDelete(comment.id)
    setDeleteOpen(false)
  }

  return (
    <>
      <div
        className={`flex gap-3 transition-opacity ${depth === 1 ? "ml-10" : ""} ${
          isPending ? "opacity-50" : ""
        }`}
      >
        <div className="flex flex-col items-center gap-1 pt-1">
          {!isDeletedStub ? (
            <>
              <button
                type="button"
                disabled={isPending}
                onClick={() => onVote(comment.id, 1)}
                className={`text-lg transition-colors disabled:cursor-not-allowed ${
                  userVote === 1
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ▲
              </button>
              <span className="text-sm font-medium tabular-nums">{comment.score}</span>
              <button
                type="button"
                disabled={isPending}
                onClick={() => onVote(comment.id, -1)}
                className={`text-lg transition-colors disabled:cursor-not-allowed ${
                  userVote === -1
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ▼
              </button>
            </>
          ) : (
            <span className="pt-1 text-xs text-muted-foreground">·</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {profileHref ? (
              <Link
                href={profileHref}
                className="font-medium text-foreground hover:underline"
              >
                @{handle}
              </Link>
            ) : (
              <span className="font-medium text-foreground">@{handle}</span>
            )}
            {comment.profile?.favourite_club?.logo_url && (
              <Image
                src={comment.profile.favourite_club.logo_url}
                alt={comment.profile.favourite_club.name}
                width={16}
                height={16}
                className="h-4 w-4"
              />
            )}
            <CommentTime dateString={comment.created_at} pending={isPending} />
          </div>

          <p className="mt-1 break-words text-sm text-foreground">
            {isDeletedStub ? (
              <span className="italic text-muted-foreground">[deleted]</span>
            ) : (
              comment.body
            )}
          </p>

          {!isDeletedStub && !isPending && (
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              {depth === 0 && (
                <button
                  type="button"
                  onClick={() => setReplyOpen(!replyOpen)}
                  className="transition-colors hover:text-foreground"
                >
                  Reply
                </button>
              )}
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="transition-colors hover:text-red-500"
                >
                  Delete
                </button>
              )}
            </div>
          )}

          {replyOpen && depth === 0 && (
            <div className="mt-3">
              <CommentComposer
                isLoggedIn={isLoggedIn}
                compact
                onPost={async (body) => {
                  const result = await onPostReply(body, comment.id)
                  if (result.ok) {
                    setReplyOpen(false)
                  }
                  return result
                }}
              />
            </div>
          )}

          {depth === 0 && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  userVote={userVotesMap[reply.id] ?? null}
                  isLoggedIn={isLoggedIn}
                  currentUserId={currentUserId}
                  depth={1}
                  userVotesMap={userVotesMap}
                  onVote={onVote}
                  onDelete={onDelete}
                  onPostReply={onPostReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this comment?</DialogTitle>
            <DialogDescription>
              This will remove your comment from the thread. You cannot undo this.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mx-0 mt-2 mb-0 border-t-0 bg-transparent p-0 sm:justify-end sm:gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  adminBanUser,
  adminDeleteComment,
} from "@/lib/admin/actions/moderation"
import type { AdminCommentRow } from "@/lib/admin/comment-moderation"

type CommentModListProps = {
  comments: AdminCommentRow[]
}

function targetHref(row: AdminCommentRow): string | null {
  if (row.targetId == null) return null
  return row.targetType === "player"
    ? `/player/${row.targetId}`
    : `/match/${row.targetId}`
}

export function CommentModList({ comments }: CommentModListProps) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function runAction(label: string, fn: () => Promise<{ ok: boolean; error?: string }>) {
    if (!window.confirm(`Confirm: ${label}?`)) return

    startTransition(async () => {
      const result = await fn()
      if (!result.ok) {
        setMessage(result.error ?? "Something went wrong.")
        return
      }
      setMessage("Done.")
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {comments.map((row) => {
            const href = targetHref(row)
            return (
              <li key={row.id} className="space-y-2 px-3 py-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{row.authorName ?? "User"}</span>
                  <span>·</span>
                  <span>score {row.score}</span>
                  {row.isDeleted ? (
                    <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">
                      deleted
                    </span>
                  ) : null}
                  {href ? (
                    <>
                      <span>·</span>
                      <Link href={href} className="text-primary hover:underline">
                        View {row.targetType}
                      </Link>
                    </>
                  ) : null}
                </div>
                <p className="text-sm leading-snug">
                  {row.isDeleted ? "[deleted]" : row.body}
                </p>
                <div className="flex flex-wrap gap-2">
                  {!row.isDeleted ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        runAction("delete this comment", () =>
                          adminDeleteComment(row.id),
                        )
                      }
                    >
                      Delete
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      runAction("ban this user", () =>
                        adminBanUser({ userId: row.authorId }),
                      )
                    }
                  >
                    Ban user
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  )
}

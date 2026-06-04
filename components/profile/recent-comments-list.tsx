import Link from "next/link"

import type { RecentCommentItem } from "@/lib/profile/types"

type RecentCommentsListProps = {
  comments: RecentCommentItem[]
}

function commentTargetHref(comment: RecentCommentItem): string | null {
  if (comment.playerId) return `/player/${comment.playerId}`
  if (comment.fixtureId) return `/match/${comment.fixtureId}`
  return null
}

export function RecentCommentsList({ comments }: RecentCommentsListProps) {
  if (comments.length === 0) {
    return (
      <p className="body-sm text-muted-foreground">No comments yet.</p>
    )
  }

  return (
    <ul className="space-y-3">
      {comments.map((c) => {
        const href = commentTargetHref(c)
        const excerpt =
          c.body.length > 120 ? `${c.body.slice(0, 120)}…` : c.body

        return (
          <li
            key={c.id}
            className="rounded-lg border border-border bg-card px-4 py-3"
          >
            <p className="text-sm text-foreground">{excerpt}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{c.score} points</span>
              {href && c.playerName ? (
                <Link href={href} className="text-primary hover:underline">
                  on {c.playerName}
                </Link>
              ) : href ? (
                <Link href={href} className="text-primary hover:underline">
                  View thread
                </Link>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

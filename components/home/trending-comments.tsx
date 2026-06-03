import Image from "next/image"
import Link from "next/link"

import type { TrendingCommentCard } from "@/lib/home/types"

type TrendingCommentsProps = {
  comments: TrendingCommentCard[]
}

function getTimeSince(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`

  return date.toLocaleDateString()
}

function TrendingCommentCardItem({ comment }: { comment: TrendingCommentCard }) {
  return (
    <Link
      href={`/player/${comment.playerId}`}
      className="block rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/30"
    >
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-mono font-semibold tabular-nums text-foreground">
          ▲{comment.upvoteCount}
        </span>
        <span>@{comment.authorName}</span>
        {comment.authorClubLogoUrl ? (
          <Image
            src={comment.authorClubLogoUrl}
            alt=""
            width={14}
            height={14}
            className="size-3.5 object-contain"
          />
        ) : null}
        <span>· {getTimeSince(comment.createdAt)}</span>
      </div>
      <p className="line-clamp-3 text-sm leading-snug">&ldquo;{comment.body}&rdquo;</p>
      <p className="mt-2 text-xs font-medium text-primary">→ {comment.playerName}</p>
    </Link>
  )
}

export function TrendingComments({ comments }: TrendingCommentsProps) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="h3">Trending comments</h2>
      </div>

      {comments.length === 0 ? (
        <p className="body-sm rounded-lg border border-border bg-card p-4 text-muted-foreground">
          No hot takes this week yet.
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <TrendingCommentCardItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </section>
  )
}

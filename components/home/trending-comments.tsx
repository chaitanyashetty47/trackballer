import Image from "next/image"
import Link from "next/link"

import { getCommentTimeSince } from "@/lib/comment/format-time"
import type { TrendingCommentCard } from "@/lib/home/types"

type TrendingCommentsProps = {
  comments: TrendingCommentCard[]
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
        <span>· {getCommentTimeSince(comment.createdAt)}</span>
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

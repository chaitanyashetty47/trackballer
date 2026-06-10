import Link from "next/link"

import { CommentAuthorLink } from "@/components/comment/comment-author-link"
import { CommentFavouriteCrests } from "@/components/comment/comment-favourite-crests"
import { PlayerAvatar } from "@/components/player-avatar"
import { getCommentTimeSince } from "@/lib/comment/format-time"
import type { TrendingCommentCard } from "@/lib/home/types"

type TrendingCommentsProps = {
  comments: TrendingCommentCard[]
  currentUserId: string | null
}

function TrendingCommentCardItem({
  comment,
  currentUserId,
}: {
  comment: TrendingCommentCard
  currentUserId: string | null
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/30">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-mono font-semibold tabular-nums text-foreground">
          ▲{comment.upvoteCount}
        </span>
        <CommentAuthorLink
          currentUserId={currentUserId}
          authorUserId={comment.authorUserId}
          username={comment.authorUsername}
          displayName={comment.authorDisplayName}
        />
        <CommentFavouriteCrests
          size="sm"
          club={comment.authorClub}
          nationalTeam={comment.authorNationalTeam}
        />
        <span>· {getCommentTimeSince(comment.createdAt)}</span>
      </div>
      <Link href={`/player/${comment.playerId}`} className="block">
        <p className="line-clamp-3 text-sm leading-snug">&ldquo;{comment.body}&rdquo;</p>
        <div className="mt-2 flex min-w-0 items-center gap-2">
        <span className="line-clamp-1 min-w-0 text-xs font-medium text-primary">
          → Trending on 
          </span>
          <PlayerAvatar
            name={comment.playerName}
            photoUrl={comment.playerPhotoUrl}
            size="sm"
            className="shrink-0"
          />
          <span className="line-clamp-1 min-w-0 text-xs font-medium text-primary">
          {comment.playerName}&apos;s page
          </span>
        </div>
      </Link>
    </div>
  )
}

export function TrendingComments({ comments, currentUserId }: TrendingCommentsProps) {
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
            <TrendingCommentCardItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </section>
  )
}

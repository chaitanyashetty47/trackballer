import Link from "next/link"

import { CommentAuthorLink } from "@/components/comment/comment-author-link"
import { CommentFavouriteCrests } from "@/components/comment/comment-favourite-crests"
import { PlayerAvatar } from "@/components/player-avatar"
import { getCommentTimeSince } from "@/lib/comment/format-time"
import type { Team } from "@/lib/comment/types"
import { cn } from "@/lib/utils"

export type PlayerCommentPreviewCardProps = {
  body: string
  upvoteCount: number
  createdAt: string
  authorUserId: string
  authorUsername: string | null
  authorDisplayName: string
  authorAvatarUrl: string | null
  authorClub: Team | null
  authorNationalTeam: Team | null
  playerId: number
  playerName: string
  playerPhotoUrl: string | null
  currentUserId: string | null
  showAuthorMeta?: boolean
  showUpvoteCount?: boolean
  /** Footer lead-in before the player link, e.g. "Trending on" or "On". */
  linkPrefix?: string
  className?: string
}

export function PlayerCommentPreviewCard({
  body,
  upvoteCount,
  createdAt,
  authorUserId,
  authorUsername,
  authorDisplayName,
  authorAvatarUrl,
  authorClub,
  authorNationalTeam,
  playerId,
  playerName,
  playerPhotoUrl,
  currentUserId,
  showAuthorMeta = true,
  showUpvoteCount,
  linkPrefix = "Trending on",
  className,
}: PlayerCommentPreviewCardProps) {
  const showCount = showUpvoteCount ?? showAuthorMeta

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/30",
        className,
      )}
    >
      {showAuthorMeta ? (
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono font-semibold tabular-nums text-foreground">
            ▲{upvoteCount}
          </span>
          <CommentAuthorLink
            currentUserId={currentUserId}
            authorUserId={authorUserId}
            username={authorUsername}
            displayName={authorDisplayName}
            avatarUrl={authorAvatarUrl}
          />
          <CommentFavouriteCrests
            size="sm"
            club={authorClub}
            nationalTeam={authorNationalTeam}
          />
          <span>· {getCommentTimeSince(createdAt)}</span>
        </div>
      ) : showCount ? (
        <div className="mb-2 text-xs text-muted-foreground">
          <span className="font-mono font-semibold tabular-nums text-foreground">
            ▲{upvoteCount}
          </span>
        </div>
      ) : null}
      <Link href={`/player/${playerId}`} className="block">
        <p className="line-clamp-3 text-sm leading-snug">&ldquo;{body}&rdquo;</p>
        <div className="mt-2 flex min-w-0 items-center gap-2">
          <span className="line-clamp-1 min-w-0 text-xs font-medium text-primary">
            → {linkPrefix}
          </span>
          <PlayerAvatar
            name={playerName}
            photoUrl={playerPhotoUrl}
            size="sm"
            className="shrink-0"
          />
          <span className="line-clamp-1 min-w-0 text-xs font-medium text-primary">
            {playerName}&apos;s page
          </span>
        </div>
      </Link>
    </div>
  )
}

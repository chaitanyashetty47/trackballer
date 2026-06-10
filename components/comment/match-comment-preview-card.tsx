import Link from "next/link"

import { CommentAuthorLink } from "@/components/comment/comment-author-link"
import { CommentFavouriteCrests } from "@/components/comment/comment-favourite-crests"
import { TeamFlag } from "@/components/team-flag"
import { getCommentTimeSince } from "@/lib/comment/format-time"
import type { Team } from "@/lib/comment/types"
import { cn } from "@/lib/utils"

type MatchPreviewTeam = Team & {
  code: string | null
}

export type MatchCommentPreviewCardProps = {
  body: string
  upvoteCount: number
  createdAt: string
  authorUserId: string
  authorUsername: string | null
  authorDisplayName: string
  authorAvatarUrl: string | null
  authorClub: Team | null
  authorNationalTeam: Team | null
  fixtureId: number
  homeTeam: MatchPreviewTeam
  awayTeam: MatchPreviewTeam
  currentUserId: string | null
  showAuthorMeta?: boolean
  showUpvoteCount?: boolean
  linkPrefix?: string
  compact?: boolean
  className?: string
}

export function MatchCommentPreviewCard({
  body,
  upvoteCount,
  createdAt,
  authorUserId,
  authorUsername,
  authorDisplayName,
  authorAvatarUrl,
  authorClub,
  authorNationalTeam,
  fixtureId,
  homeTeam,
  awayTeam,
  currentUserId,
  showAuthorMeta = true,
  showUpvoteCount,
  linkPrefix = "Trending on",
  compact = false,
  className,
}: MatchCommentPreviewCardProps) {
  const showCount = showUpvoteCount ?? showAuthorMeta

  return (
    <div
      className={cn(
        "border-b border-border transition-colors last:border-b-0 hover:bg-muted/30",
        compact ? "p-2.5" : "p-4",
        className,
      )}
    >
      {showAuthorMeta ? (
        <div
          className={cn(
            "mb-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-muted-foreground",
            compact ? "text-[10px]" : "text-xs",
          )}
        >
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
        <div
          className={cn(
            "mb-1.5 text-muted-foreground",
            compact ? "text-[10px]" : "text-xs",
          )}
        >
          <span className="font-mono font-semibold tabular-nums text-foreground">
            ▲{upvoteCount}
          </span>
        </div>
      ) : null}
      <Link href={`/match/${fixtureId}`} className="block">
        <p
          className={cn(
            "line-clamp-2 leading-snug",
            compact ? "text-[11px]" : "text-sm",
          )}
        >
          &ldquo;{body}&rdquo;
        </p>
        <div
          className={cn(
            "mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5 font-medium text-primary",
            compact ? "text-[10px]" : "text-xs",
          )}
        >
          <span className="shrink-0">→ {linkPrefix}</span>
          <TeamFlag team={homeTeam} size="sm" />
          <span className="truncate">{homeTeam.name}</span>
          <span className="shrink-0 text-muted-foreground">vs</span>
          <TeamFlag team={awayTeam} size="sm" />
          <span className="truncate">{awayTeam.name}</span>
        </div>
      </Link>
    </div>
  )
}

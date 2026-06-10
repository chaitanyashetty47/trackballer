import Link from "next/link"

import { CommentAuthorLink } from "@/components/comment/comment-author-link"
import { CommentFavouriteCrests } from "@/components/comment/comment-favourite-crests"
import { TeamFlag } from "@/components/team-flag"
import { getCommentTimeSince } from "@/lib/comment/format-time"
import {
  wcSidebarCardClass,
  wcSidebarTitleClass,
} from "@/lib/world-cup/layout"
import type { TrendingMatchCommentCard } from "@/lib/world-cup/trending-match-comment-types"
import { cn } from "@/lib/utils"

type WorldCupTrendingMatchCommentsProps = {
  comments: TrendingMatchCommentCard[]
  currentUserId: string | null
  variant?: "default" | "sidebar"
  className?: string
}

function MatchCommentCard({
  comment,
  currentUserId,
  compact,
}: {
  comment: TrendingMatchCommentCard
  currentUserId: string | null
  compact: boolean
}) {
  return (
    <div
      className={cn(
        "border-b border-border transition-colors last:border-b-0 hover:bg-muted/30",
        compact ? "p-2.5" : "p-4",
      )}
    >
      <div
        className={cn(
          "mb-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-muted-foreground",
          compact ? "text-[10px]" : "text-xs",
        )}
      >
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
      <Link href={`/match/${comment.fixtureId}`} className="block">
        <p
          className={cn(
            "line-clamp-2 leading-snug",
            compact ? "text-[11px]" : "text-sm",
          )}
        >
          &ldquo;{comment.body}&rdquo;
        </p>
        <div
          className={cn(
            "mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5 font-medium text-primary",
            compact ? "text-[10px]" : "text-xs",
          )}
        >
          <span className="shrink-0">→ Trending on</span>
          <TeamFlag team={comment.homeTeam} size="sm" />
          <span className="truncate">{comment.homeTeam.name}</span>
          <span className="shrink-0 text-muted-foreground">vs</span>
          <TeamFlag team={comment.awayTeam} size="sm" />
          <span className="truncate">{comment.awayTeam.name}</span>
        </div>
      </Link>
    </div>
  )
}

export function WorldCupTrendingMatchComments({
  comments,
  currentUserId,
  variant = "default",
  className,
}: WorldCupTrendingMatchCommentsProps) {
  const compact = variant === "sidebar"

  return (
    <section className={cn("flex min-w-0 flex-col", className)}>
      <h2 className={cn("shrink-0", compact ? cn(wcSidebarTitleClass, "mb-2") : "h3 mb-3")}>
        Trending comments
      </h2>

      {comments.length === 0 ? (
        <p
          className={cn(
            "text-muted-foreground",
            compact
              ? cn(wcSidebarCardClass, "p-3 text-[10px]")
              : "body-sm rounded-lg border border-border bg-card p-4",
          )}
        >
          No hot takes on match pages this week yet.
        </p>
      ) : (
        <div
          className={
            compact
              ? wcSidebarCardClass
              : "overflow-hidden rounded-lg border border-border bg-card"
          }
        >
          {comments.map((comment) => (
            <MatchCommentCard
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              compact={compact}
            />
          ))}
        </div>
      )}
    </section>
  )
}

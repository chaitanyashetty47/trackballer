import { MatchCommentPreviewCard } from "@/components/comment/match-comment-preview-card"
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
            <MatchCommentPreviewCard
              key={comment.id}
              body={comment.body}
              upvoteCount={comment.upvoteCount}
              createdAt={comment.createdAt}
              authorUserId={comment.authorUserId}
              authorUsername={comment.authorUsername}
              authorDisplayName={comment.authorDisplayName}
              authorAvatarUrl={comment.authorAvatarUrl}
              authorClub={comment.authorClub}
              authorNationalTeam={comment.authorNationalTeam}
              fixtureId={comment.fixtureId}
              homeTeam={comment.homeTeam}
              awayTeam={comment.awayTeam}
              currentUserId={currentUserId}
              compact={compact}
            />
          ))}
        </div>
      )}
    </section>
  )
}

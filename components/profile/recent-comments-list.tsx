import { MatchCommentPreviewCard } from "@/components/comment/match-comment-preview-card"
import { PlayerCommentPreviewCard } from "@/components/comment/player-comment-preview-card"
import type { ProfileView, RecentCommentItem } from "@/lib/profile/types"

type RecentCommentsListProps = {
  comments: RecentCommentItem[]
  profile: ProfileView
  viewerUserId: string | null
}

export function RecentCommentsList({
  comments,
  profile,
  viewerUserId,
}: RecentCommentsListProps) {
  if (comments.length === 0) {
    return (
      <p className="body-sm text-muted-foreground">No comments yet.</p>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        if (comment.targetType === "player") {
          return (
            <PlayerCommentPreviewCard
              key={comment.id}
              body={comment.body}
              upvoteCount={comment.upvoteCount}
              createdAt={comment.createdAt}
              authorUserId={profile.id}
              authorUsername={profile.username}
              authorDisplayName={profile.displayName}
              authorAvatarUrl={null}
              authorClub={null}
              authorNationalTeam={null}
              playerId={comment.playerId}
              playerName={comment.playerName}
              playerPhotoUrl={comment.playerPhotoUrl}
              currentUserId={viewerUserId}
              showAuthorMeta={false}
              showUpvoteCount
              linkPrefix="On"
            />
          )
        }

        return (
          <div
            key={comment.id}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <MatchCommentPreviewCard
              body={comment.body}
              upvoteCount={comment.upvoteCount}
              createdAt={comment.createdAt}
              authorUserId={profile.id}
              authorUsername={profile.username}
              authorDisplayName={profile.displayName}
              authorAvatarUrl={null}
              authorClub={null}
              authorNationalTeam={null}
              fixtureId={comment.fixtureId}
              homeTeam={{
                id: comment.homeTeam.id,
                name: comment.homeTeam.name,
                logo_url: comment.homeTeam.logoUrl,
                code: comment.homeTeam.code,
              }}
              awayTeam={{
                id: comment.awayTeam.id,
                name: comment.awayTeam.name,
                logo_url: comment.awayTeam.logoUrl,
                code: comment.awayTeam.code,
              }}
              currentUserId={viewerUserId}
              showAuthorMeta={false}
              showUpvoteCount
              linkPrefix="On"
              className="border-b-0"
            />
          </div>
        )
      })}
    </div>
  )
}

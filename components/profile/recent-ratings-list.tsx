import Link from "next/link"

import { PlayerAvatar } from "@/components/player-avatar"
import { CareerRatingChip } from "@/components/rating/career-rating-chip"
import { RatingChip } from "@/components/rating/rating-chip"
import { TeamFlag } from "@/components/team-flag"
import type { RecentRatingItem } from "@/lib/profile/types"
import { tierForScore } from "@/lib/rating/career-tier"

type RecentRatingsListProps = {
  ratings: RecentRatingItem[]
}

function RecentRatingRow({ rating }: { rating: RecentRatingItem }) {
  return (
    <Link
      href={`/player/${rating.playerId}`}
      className="flex items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/60"
    >
      <PlayerAvatar
        name={rating.playerName}
        photoUrl={rating.photoUrl}
        size="sm"
        className="rounded-full"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold leading-tight">{rating.playerName}</p>
        {rating.kind === "match" && rating.oppositionTeam ? (
          <p className="flex min-w-0 items-center gap-1 truncate text-xs text-muted-foreground">
            <span className="shrink-0">vs</span>
            <TeamFlag
              team={{
                name: rating.oppositionTeam.name,
                logo_url: rating.oppositionTeam.logoUrl,
                code: rating.oppositionTeam.code,
              }}
              size="sm"
            />
            <span className="truncate">{rating.oppositionTeam.name}</span>
          </p>
        ) : null}
      </div>
      {rating.kind === "career" ? (
        <CareerRatingChip
          score={rating.value}
          tier={tierForScore(rating.value)}
          size="sm"
          className="shrink-0"
        />
      ) : (
        <RatingChip value={rating.value} size="sm" className="shrink-0" />
      )}
    </Link>
  )
}

export function RecentRatingsList({ ratings }: RecentRatingsListProps) {
  if (ratings.length === 0) {
    return (
      <p className="body-sm text-muted-foreground">No ratings yet.</p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {ratings.map((rating) => (
        <RecentRatingRow
          key={`${rating.kind}-${rating.playerId}-${rating.ratedAt}`}
          rating={rating}
        />
      ))}
    </div>
  )
}

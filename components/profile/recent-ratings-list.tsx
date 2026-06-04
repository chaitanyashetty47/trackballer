import Link from "next/link"

import type { RecentRatingItem } from "@/lib/profile/types"

type RecentRatingsListProps = {
  ratings: RecentRatingItem[]
}

export function RecentRatingsList({ ratings }: RecentRatingsListProps) {
  if (ratings.length === 0) {
    return (
      <p className="body-sm text-muted-foreground">No ratings yet.</p>
    )
  }

  return (
    <ul className="space-y-2">
      {ratings.map((r) => (
        <li key={`${r.kind}-${r.playerId}-${r.ratedAt}`}>
          <Link
            href={`/player/${r.playerId}`}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/30"
          >
            <span className="text-sm font-medium">{r.playerName}</span>
            <span className="font-mono text-sm font-bold tabular-nums text-primary">
              {r.kind === "career" ? "Career " : ""}
              {r.value.toFixed(1)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

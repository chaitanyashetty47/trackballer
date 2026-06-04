import type { ProfileStats } from "@/lib/profile/types"

type ProfileStatsProps = {
  stats: ProfileStats
}

export function ProfileStatsRow({ stats }: ProfileStatsProps) {
  const items = [
    { label: "Ratings", value: stats.ratingsGiven },
    { label: "Comments", value: stats.commentsCount },
    { label: "Upvotes received", value: stats.upvotesReceived },
  ]

  return (
    <div className="grid grid-cols-3 gap-4 rounded-lg border border-border bg-card p-4">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
            {item.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  )
}

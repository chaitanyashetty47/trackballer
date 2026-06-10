import Link from "next/link"

import { PlayerAvatar } from "@/components/player-avatar"
import { CareerRatingChip } from "@/components/rating/career-rating-chip"
import { RatingChip } from "@/components/rating/rating-chip"
import {
  wcSidebarCardClass,
  wcSidebarTitleClass,
} from "@/lib/world-cup/layout"
import type { WcPlayerLeaders } from "@/lib/world-cup/player-leader-types"
import { cn } from "@/lib/utils"

type WorldCupPlayerLeadersProps = {
  leaders: WcPlayerLeaders
  variant?: "default" | "sidebar"
  className?: string
}

function LeaderRow({
  player,
  mode,
  compact,
}: {
  player: WcPlayerLeaders["players"][number]
  mode: WcPlayerLeaders["mode"]
  compact: boolean
}) {
  return (
    <Link
      href={`/player/${player.id}`}
      className={cn(
        "flex items-center border-b border-border transition-colors last:border-b-0 hover:bg-muted/60",
        compact ? "gap-1.5 px-1.5 py-1.5" : "gap-3 px-4 py-3",
      )}
    >
      <PlayerAvatar
        name={player.name}
        photoUrl={player.photoUrl}
        size="sm"
        className="rounded-full"
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate font-semibold leading-tight",
            compact ? "text-[11px]" : "text-sm",
          )}
        >
          {player.name}
        </p>
        {player.nationality ? (
          <p
            className={cn(
              "truncate text-muted-foreground",
              compact ? "text-[10px]" : "text-xs",
            )}
          >
            {player.nationality}
          </p>
        ) : null}
      </div>
      {mode === "recent" ? (
        <RatingChip value={player.score} size="sm" className="shrink-0" />
      ) : (
        <CareerRatingChip
          score={player.score}
          tier={player.careerTier}
          size="sm"
          className="shrink-0"
        />
      )}
    </Link>
  )
}

export function WorldCupPlayerLeaders({
  leaders,
  variant = "default",
  className,
}: WorldCupPlayerLeadersProps) {
  const { mode, players } = leaders
  const compact = variant === "sidebar"

  const title = mode === "recent" ? "Top rated recently" : "Trending players"

  return (
    <section className={cn("flex min-w-0 flex-col", className)}>
      <div className={cn("shrink-0", compact ? "mb-2" : "mb-3")}>
        <h2 className={compact ? wcSidebarTitleClass : "h3"}>{title}</h2>
      </div>

      {players.length === 0 ? (
        <p
          className={cn(
            "text-muted-foreground",
            compact
              ? cn(wcSidebarCardClass, "p-3 text-[10px]")
              : "body-sm rounded-lg border border-border bg-card p-4",
          )}
        >
          Go rate the players to start a trend.
        </p>
      ) : (
        <div className={compact ? wcSidebarCardClass : "overflow-hidden rounded-lg border border-border bg-card"}>
          {players.map((player) => (
            <LeaderRow key={player.id} player={player} mode={mode} compact={compact} />
          ))}
        </div>
      )}
    </section>
  )
}

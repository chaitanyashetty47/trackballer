import Link from "next/link"

import { CareerRing } from "@/components/player/career-ring"
import { positionDisplayLabel } from "@/lib/match/position-label"
import type { PlayerListItem } from "@/lib/search/types"

type PlayerResultRowProps = {
  player: PlayerListItem
}

function formatScore(score: number): string {
  return score.toFixed(1)
}

export function PlayerResultRow({ player }: PlayerResultRowProps) {
  const positionLabel = positionDisplayLabel(player.position)
  const meta = [player.nationality, positionLabel, player.age != null ? String(player.age) : null]
    .filter(Boolean)
    .join(" · ")

  return (
    <Link
      href={`/player/${player.id}`}
      className="flex items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/30"
    >
      <CareerRing
        name={player.displayName}
        photoUrl={player.photoUrl}
        tier={player.tier}
        compact
        className="size-11 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{player.displayName}</p>
        {meta ? <p className="truncate text-xs text-muted-foreground">{meta}</p> : null}
      </div>
      <span className="font-mono text-sm font-bold tabular-nums text-primary">
        {formatScore(player.displayScore)}
      </span>
    </Link>
  )
}

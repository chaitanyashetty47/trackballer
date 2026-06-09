import Link from "next/link"

import { CareerRing } from "@/components/player/career-ring"
import { positionDisplayLabel } from "@/lib/match/position-label"
import type { PlayerListItem } from "@/lib/search/types"
import { cn } from "@/lib/utils"

type PlayerResultRowProps = {
  player: PlayerListItem
  onSelect?: () => void
  className?: string
}

function PlayerResultRowContent({ player }: { player: PlayerListItem }) {
  const positionLabel = positionDisplayLabel(player.position)
  const meta = [player.nationality, positionLabel, player.age != null ? String(player.age) : null]
    .filter(Boolean)
    .join(" · ")

  return (
    <>
      <CareerRing
        name={player.displayName}
        photoUrl={player.photoUrl}
        tier={player.tier}
        displayScore={player.displayScore}
        compact
        className="shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{player.displayName}</p>
        {meta ? <p className="truncate text-xs text-muted-foreground">{meta}</p> : null}
      </div>
    </>
  )
}

const rowClassName =
  "flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/30"

export function PlayerResultRow({ player, onSelect, className }: PlayerResultRowProps) {
  if (onSelect) {
    return (
      <button
        type="button"
        className={cn(rowClassName, className)}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onSelect}
      >
        <PlayerResultRowContent player={player} />
      </button>
    )
  }

  return (
    <Link href={`/player/${player.id}`} className={cn(rowClassName, className)}>
      <PlayerResultRowContent player={player} />
    </Link>
  )
}

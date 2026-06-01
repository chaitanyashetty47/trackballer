"use client"

import { RatingChip } from "@/components/rating/rating-chip"
import type { MatchLineupPlayer } from "@/lib/match/types"
import { cn } from "@/lib/utils"

type LineupPitchProps = {
  starters: MatchLineupPlayer[]
  onPlayerClick?: (player: MatchLineupPlayer) => void
  ratingsLocked?: boolean
  className?: string
}

export function LineupPitch({
  starters,
  onPlayerClick,
  ratingsLocked = false,
  className,
}: LineupPitchProps) {
  return (
    <div
      className={cn(
        "relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-[color-mix(in_oklch,var(--pitch-line),transparent_30%)] bg-[var(--pitch)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-4 rounded-lg border border-[var(--pitch-line)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--pitch-line)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 bg-[var(--pitch-line)]" />

      {starters.map((player) => (
        <button
          key={`${player.side}-${player.playerId}`}
          type="button"
          disabled={ratingsLocked}
          onClick={() => onPlayerClick?.(player)}
          className={cn(
            "absolute flex w-[4.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 text-center",
            ratingsLocked ? "cursor-default opacity-80" : "cursor-pointer hover:opacity-90",
          )}
          style={{
            left: `${player.position.leftPct}%`,
            top: `${player.position.topPct}%`,
          }}
        >
          <span className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-[11px] font-bold tabular-nums shadow-sm">
            {player.shirtNumber ?? "·"}
          </span>
          <span className="max-w-full truncate text-[10px] font-medium leading-tight">
            {player.name.split(" ").pop()}
          </span>
          <RatingChip value={player.communityAvg} size="sm" />
        </button>
      ))}
    </div>
  )
}

"use client"

import { PlayerAvatar } from "@/components/player-avatar"
import { MatchEventBadge } from "@/components/match/match-event-badge"
import { RatingChip } from "@/components/rating/rating-chip"
import type { MatchLineupPlayer } from "@/lib/match/types"
import { cn } from "@/lib/utils"

const ASSIST_ICON = "/american-football-black-shoe-svgrepo-com.svg"
const GOAL_ICON = "/football-svgrepo-com.svg"

function lastName(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts[parts.length - 1] ?? name
}

type LineupPlayerPuckProps = {
  player: MatchLineupPlayer
  locked?: boolean
  onClick?: (player: MatchLineupPlayer) => void
  avatarSize?: "md" | "lg"
}

export function LineupPlayerPuck({
  player,
  locked = false,
  onClick,
  avatarSize = "lg",
}: LineupPlayerPuckProps) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => onClick?.(player)}
      className={cn(
        "flex w-full max-w-[5.5rem] flex-col items-center gap-1 px-0.5 text-center",
        locked ? "cursor-default" : "cursor-pointer hover:opacity-90",
      )}
    >
      <span className="relative inline-flex shrink-0 px-2.5">
        <MatchEventBadge
          iconSrc={ASSIST_ICON}
          label="assist"
          count={player.assistCount}
          side="left"
        />
        <PlayerAvatar
          name={player.name}
          photoUrl={player.photoUrl}
          shirtNumber={player.shirtNumber}
          size={avatarSize}
          className="rounded-full"
        />
        <MatchEventBadge
          iconSrc={GOAL_ICON}
          label="goal"
          count={player.goalCount}
          side="right"
        />
        <RatingChip
          value={player.communityAvg}
          size="sm"
          className="absolute bottom-full left-1/2 z-10 mb-0.5 min-w-[1.75rem] -translate-x-1/2 border-background shadow-sm"
        />
      </span>
      <span className="max-w-full truncate text-[11px] font-semibold leading-tight text-foreground">
        {player.shirtNumber != null && (
          <span className="font-mono tabular-nums text-muted-foreground">
            {player.shirtNumber}{" "}
          </span>
        )}
        {lastName(player.name)}
      </span>
    </button>
  )
}

"use client"

import { PlayerAvatar } from "@/components/player-avatar"
import { MatchCardBadge, MatchEventBadge } from "@/components/match/match-event-badge"
import { RatingChip } from "@/components/rating/rating-chip"
import type { MatchLineupPlayer } from "@/lib/match/types"
import { cn } from "@/lib/utils"

const ASSIST_ICON = "/american-football-black-shoe-svgrepo-com.svg"
const GOAL_ICON = "/football-svgrepo-com.svg"

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) return name
  const last = parts[parts.length - 1] ?? name
  const first = parts[0]
  if (!first) return last
  return `${first[0]}. ${last}`
}

type LineupPlayerNodeProps = {
  player: MatchLineupPlayer
  locked?: boolean
  onClick?: (player: MatchLineupPlayer) => void
  avatarSize?: "md" | "lg"
  className?: string
}

export function LineupPlayerNode({
  player,
  locked = false,
  onClick,
  avatarSize = "lg",
  className,
}: LineupPlayerNodeProps) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => onClick?.(player)}
      className={cn(
        "flex w-full min-w-0 flex-col items-center px-0.5 text-center",
        locked ? "cursor-default" : "cursor-pointer hover:opacity-90",
        className,
      )}
    >
      <span className="relative inline-flex shrink-0">
        <MatchEventBadge
          iconSrc={ASSIST_ICON}
          label="assist"
          count={player.assistCount}
          side="left"
          layout="corner"
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
          layout="corner"
        />
        <MatchCardBadge kind="red" show={player.redCardCount > 0} side="left" />
        <MatchCardBadge kind="yellow" show={player.yellowCardCount > 0} side="right" />
      </span>
      <RatingChip
        value={player.communityAvg}
        size="sm"
        className="mt-0.5 z-10 min-w-[1.5rem] shrink-0 border-background px-1 py-0 text-[10px] shadow-sm"
      />
      <span className="mt-0.5 max-w-full truncate pt-0.5 text-[11px] font-semibold leading-tight text-foreground">
        {player.shirtNumber != null && (
          <span className="font-mono tabular-nums text-muted-foreground">
            {player.shirtNumber}{" "}
          </span>
        )}
        {shortName(player.name)}
      </span>
    </button>
  )
}

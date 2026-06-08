"use client"

import { LineupPlayerNode } from "@/components/match/lineup-player-node"
import { buildFormationRows, type FormationRow } from "@/lib/match/formation"
import type { MatchLineupPlayer } from "@/lib/match/types"
import { cn } from "@/lib/utils"

type LineupSingleTeamPitchProps = {
  starters: MatchLineupPlayer[]
  side: "home" | "away"
  onPlayerClick?: (player: MatchLineupPlayer) => void
  ratingsLocked?: boolean
  className?: string
}

function FormationLineRow({
  row,
  locked,
  onPlayerClick,
}: {
  row: FormationRow
  locked: boolean
  onPlayerClick?: (player: MatchLineupPlayer) => void
}) {
  const players = row.players

  return (
    <div
      className="grid w-full items-start justify-items-center gap-x-1"
      style={{ gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))` }}
    >
      {players.map((player) => (
        <LineupPlayerNode
          key={player.playerId}
          player={player}
          locked={locked}
          onClick={onPlayerClick}
          avatarSize="md"
        />
      ))}
    </div>
  )
}

function SingleTeamPitchMarkings() {
  return (
    <>
      <div className="pointer-events-none absolute inset-2 rounded-lg border border-[var(--pitch-line)]" />
      <div className="pointer-events-none absolute right-3 bottom-3 left-3 h-px bg-[var(--pitch-line)]" />
      <div className="pointer-events-none absolute bottom-[18%] left-1/2 size-14 -translate-x-1/2 rounded-full border border-[var(--pitch-line)]" />
      <div className="pointer-events-none absolute bottom-3 left-1/2 h-16 w-[42%] -translate-x-1/2 rounded-t-sm border border-b-0 border-[var(--pitch-line)]" />
    </>
  )
}

export function LineupSingleTeamPitch({
  starters,
  side,
  onPlayerClick,
  ratingsLocked = false,
  className,
}: LineupSingleTeamPitchProps) {
  const teamStarters = starters.filter((p) => p.side === side)
  const rows = [...buildFormationRows(teamStarters)].reverse()

  return (
    <div
      className={cn(
        "relative flex min-h-[28rem] w-full flex-col justify-evenly gap-y-3 overflow-hidden rounded-xl border border-[color-mix(in_oklch,var(--pitch-line),transparent_30%)] bg-[var(--pitch)] px-2 py-4",
        className,
      )}
    >
      <SingleTeamPitchMarkings />
      {rows.map((row) => (
        <FormationLineRow
          key={row.row}
          row={row}
          locked={ratingsLocked}
          onPlayerClick={onPlayerClick}
        />
      ))}
    </div>
  )
}

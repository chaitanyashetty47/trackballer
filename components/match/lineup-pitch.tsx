"use client"

import { LineupPlayerPuck } from "@/components/match/lineup-player-puck"
import { buildFormationRows, type FormationRow } from "@/lib/match/formation"
import type { MatchLineupPlayer } from "@/lib/match/types"
import { cn } from "@/lib/utils"

type LineupPitchProps = {
  starters: MatchLineupPlayer[]
  onPlayerClick?: (player: MatchLineupPlayer) => void
  ratingsLocked?: boolean
  className?: string
}

/** Mobile: each formation line is a horizontal grid row. */
function FormationLineRow({
  row,
  reverseCols,
  locked,
  onPlayerClick,
}: {
  row: FormationRow
  reverseCols: boolean
  locked: boolean
  onPlayerClick?: (player: MatchLineupPlayer) => void
}) {
  const players = reverseCols ? [...row.players].reverse() : row.players

  return (
    <div
      className="grid w-full items-start justify-items-center gap-1"
      style={{ gridTemplateColumns: `repeat(${players.length}, minmax(0, 1fr))` }}
    >
      {players.map((player) => (
        <LineupPlayerPuck
          key={`${player.side}-${player.playerId}`}
          player={player}
          locked={locked}
          onClick={onPlayerClick}
          avatarSize="md"
        />
      ))}
    </div>
  )
}

/** Tablet/laptop: each formation line is a vertical column (GK at the touchline). */
function FormationLineColumn({
  row,
  locked,
  onPlayerClick,
}: {
  row: FormationRow
  locked: boolean
  onPlayerClick?: (player: MatchLineupPlayer) => void
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-evenly gap-2 py-1">
      {row.players.map((player) => (
        <LineupPlayerPuck
          key={`${player.side}-${player.playerId}`}
          player={player}
          locked={locked}
          onClick={onPlayerClick}
        />
      ))}
    </div>
  )
}

function PitchMarkings() {
  return (
    <>
      <div className="pointer-events-none absolute inset-2 rounded-lg border border-[var(--pitch-line)] md:inset-3" />

      {/* Mobile: horizontal halfway + center circle */}
      <div className="pointer-events-none absolute top-1/2 right-3 left-3 h-px -translate-y-1/2 bg-[var(--pitch-line)] md:hidden" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--pitch-line)] md:hidden" />

      {/* md+: vertical halfway + center circle (teams left / right) */}
      <div className="pointer-events-none absolute top-3 bottom-3 left-1/2 hidden w-px -translate-x-1/2 bg-[var(--pitch-line)] md:block" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 hidden size-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--pitch-line)] md:block" />

      {/* md+: penalty areas at each end */}
      <div className="pointer-events-none absolute top-1/2 left-3 hidden h-24 w-10 -translate-y-1/2 rounded-sm border border-[var(--pitch-line)] md:block" />
      <div className="pointer-events-none absolute top-1/2 right-3 hidden h-24 w-10 -translate-y-1/2 rounded-sm border border-[var(--pitch-line)] md:block" />
    </>
  )
}

function TeamHalfVertical({
  rows,
  reverseCols,
  locked,
  onPlayerClick,
  className,
}: {
  rows: FormationRow[]
  reverseCols: boolean
  locked: boolean
  onPlayerClick?: (player: MatchLineupPlayer) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative flex flex-1 flex-col justify-evenly gap-2 px-2 md:hidden",
        className,
      )}
    >
      {rows.map((row) => (
        <FormationLineRow
          key={row.row}
          row={row}
          reverseCols={reverseCols}
          locked={locked}
          onPlayerClick={onPlayerClick}
        />
      ))}
    </div>
  )
}

function TeamHalfHorizontal({
  rows,
  locked,
  onPlayerClick,
  className,
}: {
  rows: FormationRow[]
  locked: boolean
  onPlayerClick?: (player: MatchLineupPlayer) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative hidden min-h-0 flex-1 flex-row items-stretch justify-evenly gap-0.5 px-1 md:flex",
        className,
      )}
    >
      {rows.map((row) => (
        <FormationLineColumn
          key={row.row}
          row={row}
          locked={locked}
          onPlayerClick={onPlayerClick}
        />
      ))}
    </div>
  )
}

export function LineupPitch({
  starters,
  onPlayerClick,
  ratingsLocked = false,
  className,
}: LineupPitchProps) {
  const homeRows = buildFormationRows(starters.filter((p) => p.side === "home"))
  const awayRows = buildFormationRows(starters.filter((p) => p.side === "away"))
  const awayRowsVertical = [...awayRows].reverse()
  const awayRowsHorizontal = [...awayRows].reverse()

  return (
    <div
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-xl border border-[color-mix(in_oklch,var(--pitch-line),transparent_30%)] bg-[var(--pitch)]",
        "aspect-[3/4] max-md:min-h-[22rem]",
        "md:aspect-[16/10] md:min-h-[18rem] md:flex-row",
        className,
      )}
    >
      <PitchMarkings />

      {/* Mobile: home top, away bottom */}
      <TeamHalfVertical
        rows={homeRows}
        reverseCols={false}
        locked={ratingsLocked}
        onPlayerClick={onPlayerClick}
        className="pt-3 pb-1"
      />
      <TeamHalfVertical
        rows={awayRowsVertical}
        reverseCols
        locked={ratingsLocked}
        onPlayerClick={onPlayerClick}
        className="pt-1 pb-3"
      />

      {/* Tablet/laptop: home left, away right */}
      <TeamHalfHorizontal
        rows={homeRows}
        locked={ratingsLocked}
        onPlayerClick={onPlayerClick}
        className="pl-2"
      />
      <TeamHalfHorizontal
        rows={awayRowsHorizontal}
        locked={ratingsLocked}
        onPlayerClick={onPlayerClick}
        className="pr-2"
      />
    </div>
  )
}

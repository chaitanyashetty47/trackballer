"use client"

import { ChevronLeft, ChevronRight, User } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

import { PlayerAvatar } from "@/components/player-avatar"
import { RatingChip } from "@/components/rating/rating-chip"
import { TeamFlag } from "@/components/team-flag"
import { Button } from "@/components/ui/button"
import type { TeamSummary } from "@/lib/catalog/types"
import { positionDisplayLabel } from "@/lib/match/position-label"
import type { MatchLineupPlayer } from "@/lib/match/types"
import { isValidRatingValue } from "@/lib/rating/engine"
import { cn } from "@/lib/utils"

type RatingSheetProps = {
  open: boolean
  players: MatchLineupPlayer[]
  activeIndex: number
  matchContext: string
  homeTeam: TeamSummary
  awayTeam: TeamSummary
  onClose: () => void
  onIndexChange: (index: number) => void
  onSubmit: (value: number) => void
  isSubmitting?: boolean
}

function teamForPlayer(
  player: MatchLineupPlayer,
  homeTeam: TeamSummary,
  awayTeam: TeamSummary,
): TeamSummary {
  return player.side === "home" ? homeTeam : awayTeam
}

export function RatingSheet({
  open,
  players,
  activeIndex,
  matchContext,
  homeTeam,
  awayTeam,
  onClose,
  onIndexChange,
  onSubmit,
  isSubmitting = false,
}: RatingSheetProps) {
  const player = players[activeIndex]
  const [value, setValue] = useState(7.5)

  const syncValueFromPlayer = useCallback((p: MatchLineupPlayer | undefined) => {
    if (p?.userRating != null && isValidRatingValue(p.userRating)) {
      setValue(p.userRating)
    } else {
      setValue(7.5)
    }
  }, [])

  useEffect(() => {
    syncValueFromPlayer(player)
  }, [activeIndex, player, syncValueFromPlayer])

  useEffect(() => {
    if (!open) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose()
        return
      }
      if (e.key === "ArrowLeft" && activeIndex > 0) {
        onIndexChange(activeIndex - 1)
      }
      if (e.key === "ArrowRight" && activeIndex < players.length - 1) {
        onIndexChange(activeIndex + 1)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, activeIndex, players.length, onClose, onIndexChange])

  if (!open || !player) return null

  const canGoPrev = activeIndex > 0
  const canGoNext = activeIndex < players.length - 1
  const team = teamForPlayer(player, homeTeam, awayTeam)
  const positionLabel = positionDisplayLabel(player.position)
  const metaParts = [
    player.shirtNumber != null ? `#${player.shirtNumber}` : null,
    positionLabel,
  ].filter(Boolean)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="rating-sheet-title"
        className={cn(
          "w-full max-w-md rounded-t-2xl border border-border bg-card p-5 shadow-lg sm:rounded-2xl",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />

        <div className="mb-4 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0 rounded-full"
            disabled={!canGoPrev || isSubmitting}
            onClick={() => onIndexChange(activeIndex - 1)}
            aria-label="Previous player"
          >
            <ChevronLeft className="size-5" />
          </Button>

          <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className="relative inline-flex shrink-0">
              <PlayerAvatar
                name={player.name}
                photoUrl={player.photoUrl}
                shirtNumber={player.shirtNumber}
                size="lg"
                className="rounded-full"
              />
              <span className="absolute -bottom-0.5 -right-4 rounded-full border border-background bg-card p-0.5">
                <TeamFlag team={team} size="sm" />
              </span>
              <RatingChip
                value={player.communityAvg}
                size="sm"
                className="absolute -top-1 -right-5 z-10 min-w-[1.75rem] border-background shadow-sm"
              />
            </span>
            <h2 id="rating-sheet-title" className="max-w-full truncate text-center text-lg font-semibold">
              {player.name}
            </h2>
            {metaParts.length > 0 && (
              <p className="text-center text-xs text-muted-foreground">{metaParts.join(" · ")}</p>
            )}
            <p className="text-center font-mono text-xs tabular-nums text-muted-foreground">
              {activeIndex + 1} / {players.length}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-9 shrink-0 rounded-full"
            disabled={!canGoNext || isSubmitting}
            onClick={() => onIndexChange(activeIndex + 1)}
            aria-label="Next player"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>

        <p className="mb-4 text-center text-sm text-muted-foreground">{matchContext}</p>

        <p className="text-center font-mono text-4xl font-bold tabular-nums">{value.toFixed(1)}</p>

        <input
          type="range"
          min={1}
          max={10}
          step={0.5}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="mt-4 w-full accent-primary"
          aria-label="Rating value"
          aria-valuetext={`${value.toFixed(1)} out of 10`}
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>1</span>
          <span>10</span>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <Link
            href={`/player/${player.playerId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            onClick={onClose}
          >
            <User className="size-4 shrink-0" aria-hidden />
            Player profile
          </Link>
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => onSubmit(value)}
            >
              {isSubmitting ? "Saving…" : "Submit rating"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

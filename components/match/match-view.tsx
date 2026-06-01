"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState, useTransition } from "react"

import { LineupPitch } from "@/components/match/lineup-pitch"
import { RatingSheet, type RatingSheetSubject } from "@/components/rating/rating-sheet"
import { TeamFlag } from "@/components/team-flag"
import { Button } from "@/components/ui/button"
import { formatMatchScore } from "@/lib/match/score"
import type { MatchDetail, MatchLineupPlayer } from "@/lib/match/types"
import { submitMatchRating } from "@/lib/rating/submit-match-rating"

type MatchViewProps = {
  detail: MatchDetail
  isLoggedIn: boolean
}

function matchContextLabel(detail: MatchDetail): string {
  const { fixture } = detail
  const vs = `${fixture.home_team.name} vs ${fixture.away_team.name}`
  return fixture.round_name ? `${vs} · ${fixture.round_name}` : vs
}

function updatePlayerInList(
  list: MatchLineupPlayer[],
  playerId: number,
  patch: Partial<MatchLineupPlayer>,
): MatchLineupPlayer[] {
  return list.map((p) => (p.playerId === playerId ? { ...p, ...patch } : p))
}

export function MatchView({ detail: initialDetail, isLoggedIn }: MatchViewProps) {
  const router = useRouter()
  const [detail, setDetail] = useState(initialDetail)

  useEffect(() => {
    setDetail(initialDetail)
  }, [initialDetail])
  const [sheetSubject, setSheetSubject] = useState<RatingSheetSubject | null>(null)
  const [guidedIndex, setGuidedIndex] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const { fixture } = detail
  const { scoreline, statusLabel } = formatMatchScore(fixture)
  const contextLabel = matchContextLabel(detail)

  const canRate = isLoggedIn && detail.ratingsUnlocked

  const openSheetForPlayer = useCallback(
    (player: MatchLineupPlayer, guidedIdx: number | null = null) => {
      if (!canRate) {
        if (!isLoggedIn) {
          setErrorMessage("Sign in to rate players.")
        } else if (!detail.ratingsUnlocked) {
          setErrorMessage("Ratings unlock when the match finishes.")
        } else if (!player.isRateable) {
          setErrorMessage("Only players who got minutes can be rated.")
        }
        return
      }
      if (!player.isRateable) {
        setErrorMessage("This player did not play enough minutes to rate.")
        return
      }
      setErrorMessage(null)
      setGuidedIndex(guidedIdx)
      setSheetSubject({
        playerId: player.playerId,
        name: player.name,
        context: contextLabel,
        initialValue: player.userRating,
      })
    },
    [canRate, contextLabel, detail.ratingsUnlocked, isLoggedIn],
  )

  const guidedPlayer = useMemo(() => {
    if (guidedIndex == null) return null
    return detail.rateableQueue[guidedIndex] ?? null
  }, [detail.rateableQueue, guidedIndex])

  function handleRateAll() {
    if (detail.rateableQueue.length === 0) {
      setErrorMessage("No rateable players for this match yet.")
      return
    }
    openSheetForPlayer(detail.rateableQueue[0], 0)
  }

  function applyLocalRating(playerId: number, value: number, communityAvg: number | null) {
    setDetail((prev) => ({
      ...prev,
      starters: updatePlayerInList(prev.starters, playerId, {
        userRating: value,
        communityAvg,
      }),
      substitutes: updatePlayerInList(prev.substitutes, playerId, {
        userRating: value,
        communityAvg,
      }),
      rateableQueue: updatePlayerInList(prev.rateableQueue, playerId, {
        userRating: value,
        communityAvg,
      }),
    }))
  }

  function handleSubmit(value: number) {
    if (!sheetSubject) return
    const snapshotGuided = guidedIndex
    const snapshotQueue = detail.rateableQueue

    startTransition(async () => {
      const result = await submitMatchRating({
        fixtureId: fixture.id,
        playerId: sheetSubject.playerId,
        value,
      })

      if (!result.ok) {
        setErrorMessage(result.error)
        return
      }

      const player =
        detail.starters.find((p) => p.playerId === sheetSubject.playerId) ??
        detail.substitutes.find((p) => p.playerId === sheetSubject.playerId)

      const prevAvg = player?.communityAvg
      const prevCount = player?.ratingCount ?? 0
      let nextAvg = value
      if (player?.userRating != null && prevCount > 0) {
        const total = (prevAvg ?? 0) * prevCount - player.userRating + value
        nextAvg = Math.round((total / prevCount) * 100) / 100
      } else if (prevCount > 0 && prevAvg != null) {
        nextAvg = Math.round(((prevAvg * prevCount + value) / (prevCount + 1)) * 100) / 100
      }

      applyLocalRating(sheetSubject.playerId, value, nextAvg)
      setSheetSubject(null)
      router.refresh()

      if (snapshotGuided != null) {
        const nextPlayer = snapshotQueue[snapshotGuided + 1]
        if (nextPlayer) {
          openSheetForPlayer(nextPlayer, snapshotGuided + 1)
        } else {
          setGuidedIndex(null)
        }
      }
    })
  }

  const kickoff = fixture.kickoff_at
    ? new Date(fixture.kickoff_at).toLocaleString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <p className="eyebrow mb-2">Match</p>

      <div className="mb-6 text-center">
        {fixture.round_name && (
          <p className="text-sm text-muted-foreground">{fixture.round_name}</p>
        )}
        {fixture.venue && (
          <p className="text-sm text-muted-foreground">{fixture.venue}</p>
        )}
        {kickoff && <p className="text-sm text-muted-foreground">{kickoff}</p>}

        <div className="mt-4 flex items-center justify-center gap-3">
          <TeamFlag team={fixture.home_team} size="md" />
          <div>
            <p className="font-display text-3xl font-bold tabular-nums">{scoreline}</p>
            <p className="text-sm font-medium text-muted-foreground">{statusLabel}</p>
          </div>
          <TeamFlag team={fixture.away_team} size="md" />
        </div>
        <p className="mt-2 text-sm font-semibold">
          {fixture.home_team.name} · {fixture.away_team.name}
        </p>
      </div>

      {canRate && detail.rateableQueue.length > 0 && (
        <Button type="button" className="mb-4 w-full" onClick={handleRateAll}>
          Rate all players
        </Button>
      )}

      {!isLoggedIn && (
        <p className="mb-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>{" "}
          to rate performances.
        </p>
      )}

      {errorMessage && (
        <p className="mb-4 text-center text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      <section className="mb-6">
        <h2 className="h3 mb-3">Lineups</h2>
        {!detail.hasLineups ? (
          <p className="body-sm text-muted-foreground">
            Lineups are not available yet. Check back closer to kickoff.
          </p>
        ) : (
          <LineupPitch
            starters={detail.starters}
            ratingsLocked={!canRate}
            onPlayerClick={(player) => openSheetForPlayer(player)}
          />
        )}
      </section>

      {detail.substitutes.length > 0 && (
        <section className="mb-8">
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Substitutes</h3>
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {detail.substitutes.map((player) => (
              <li key={player.playerId}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted/50"
                  onClick={() => openSheetForPlayer(player)}
                  disabled={!canRate || !player.isRateable}
                >
                  <span>
                    {player.shirtNumber != null ? `${player.shirtNumber}. ` : ""}
                    {player.name}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {player.communityAvg?.toFixed(2) ?? "—"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {guidedPlayer && guidedIndex != null && !sheetSubject && (
        <p className="body-sm text-center text-muted-foreground">
          Guided rating paused. Tap Rate all players to continue.
        </p>
      )}

      <p className="body-sm text-center">
        <Link href="/world-cup" className="text-primary underline-offset-4 hover:underline">
          Back to World Cup
        </Link>
      </p>

      <RatingSheet
        subject={sheetSubject}
        onClose={() => {
          setSheetSubject(null)
          setGuidedIndex(null)
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </div>
  )
}

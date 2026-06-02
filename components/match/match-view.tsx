"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState, useTransition } from "react"

import {
  MatchSubstitutesSection,
  MatchUnusedBenchSection,
} from "@/components/match/match-bench-sections"
import { LineupPitch } from "@/components/match/lineup-pitch"
import { CommentThread } from "@/components/comment/comment-thread"
import { RatingSheet } from "@/components/rating/rating-sheet"
import { TeamFlag } from "@/components/team-flag"
import { Button } from "@/components/ui/button"
import { formatMatchKickoffDateTime, formatMatchScore } from "@/lib/match/score"
import type { MatchDetail, MatchLineupPlayer } from "@/lib/match/types"
import type { CommentWithProfile } from "@/lib/comment/types"
import { submitMatchRating } from "@/lib/rating/submit-match-rating"

type MatchViewProps = {
  detail: MatchDetail
  isLoggedIn: boolean
  comments?: CommentWithProfile[]
  userVotes?: Record<number, 1 | -1>
  currentUserId?: string | null
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

function findRateableIndex(queue: MatchLineupPlayer[], playerId: number): number {
  return queue.findIndex((p) => p.playerId === playerId)
}

export function MatchView({
  detail: initialDetail,
  isLoggedIn,
  comments = [],
  userVotes = {},
  currentUserId = null,
}: MatchViewProps) {
  const router = useRouter()
  const [detail, setDetail] = useState(initialDetail)
  const [ratingIndex, setRatingIndex] = useState<number | null>(null)
  const [advanceOnSubmit, setAdvanceOnSubmit] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setDetail(initialDetail)
  }, [initialDetail])

  const { fixture } = detail
  const { scoreline, statusLabel } = formatMatchScore(fixture)
  const contextLabel = matchContextLabel(detail)
  const canRate = isLoggedIn && detail.ratingsUnlocked
  const ratingOpen = ratingIndex != null && detail.rateableQueue[ratingIndex] != null

  const closeRatingSheet = useCallback(() => {
    setRatingIndex(null)
    setAdvanceOnSubmit(false)
  }, [])

  const openRatingSheet = useCallback(
    (player: MatchLineupPlayer, options?: { advanceOnSubmit?: boolean }) => {
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

      const index = findRateableIndex(detail.rateableQueue, player.playerId)
      if (index < 0) {
        setErrorMessage("This player cannot be rated for this match.")
        return
      }

      setErrorMessage(null)
      setAdvanceOnSubmit(options?.advanceOnSubmit ?? false)
      setRatingIndex(index)
    },
    [canRate, detail.rateableQueue, detail.ratingsUnlocked, isLoggedIn],
  )

  function handleRateAll() {
    if (detail.rateableQueue.length === 0) {
      setErrorMessage("No rateable players for this match yet.")
      return
    }
    setAdvanceOnSubmit(true)
    setRatingIndex(0)
    setErrorMessage(null)
  }

  function applyLocalRating(playerId: number, value: number, communityAvg: number | null) {
    setDetail((prev) => ({
      ...prev,
      starters: updatePlayerInList(prev.starters, playerId, {
        userRating: value,
        communityAvg,
      }),
      substitutesOn: updatePlayerInList(prev.substitutesOn, playerId, {
        userRating: value,
        communityAvg,
      }),
      benchUnused: updatePlayerInList(prev.benchUnused, playerId, {
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
    if (ratingIndex == null) return

    const player = detail.rateableQueue[ratingIndex]
    if (!player) return

    const snapshotIndex = ratingIndex
    const shouldAdvance = advanceOnSubmit

    startTransition(async () => {
      const result = await submitMatchRating({
        fixtureId: fixture.id,
        playerId: player.playerId,
        value,
      })

      if (!result.ok) {
        setErrorMessage(result.error)
        return
      }

      const prevAvg = player.communityAvg
      const prevCount = player.ratingCount ?? 0
      let nextAvg = value
      if (player.userRating != null && prevCount > 0) {
        const total = (prevAvg ?? 0) * prevCount - player.userRating + value
        nextAvg = Math.round((total / prevCount) * 100) / 100
      } else if (prevCount > 0 && prevAvg != null) {
        nextAvg = Math.round(((prevAvg * prevCount + value) / (prevCount + 1)) * 100) / 100
      }

      applyLocalRating(player.playerId, value, nextAvg)
      router.refresh()

      if (shouldAdvance && snapshotIndex < detail.rateableQueue.length - 1) {
        setRatingIndex(snapshotIndex + 1)
      } else {
        closeRatingSheet()
      }
    })
  }

  const kickoff = fixture.kickoff_at
    ? formatMatchKickoffDateTime(fixture.kickoff_at)
    : null

  return (
    <div className="mx-auto max-w-lg px-4 py-8 md:max-w-5xl">
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
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="h3">Lineups</h2>
          {(detail.homeFormation || detail.awayFormation) && (
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {detail.homeFormation ?? "?"} · {detail.awayFormation ?? "?"}
            </span>
          )}
        </div>
        {!detail.hasLineups ? (
          <p className="body-sm text-muted-foreground">
            Lineups are not available yet. Check back closer to kickoff.
          </p>
        ) : (
          <LineupPitch
            starters={detail.starters}
            ratingsLocked={!canRate}
            onPlayerClick={(player) => openRatingSheet(player)}
          />
        )}
      </section>

      <MatchSubstitutesSection
        fixture={fixture}
        coaches={detail.coaches}
        substitutesOn={detail.substitutesOn}
        canRate={canRate}
        onPlayerSelect={(player) => openRatingSheet(player)}
      />

      <MatchUnusedBenchSection
        fixture={fixture}
        benchUnused={detail.benchUnused}
        onPlayerSelect={(player) => openRatingSheet(player)}
      />

      <CommentThread
        initialComments={comments}
        initialUserVotes={userVotes}
        targetType="match"
        targetId={fixture.id}
        isLoggedIn={isLoggedIn}
        currentUserId={currentUserId}
      />

      <p className="body-sm text-center mt-6">
        <Link href="/world-cup" className="text-primary underline-offset-4 hover:underline">
          Back to World Cup
        </Link>
      </p>

      <RatingSheet
        open={ratingOpen}
        players={detail.rateableQueue}
        activeIndex={ratingIndex ?? 0}
        matchContext={contextLabel}
        homeTeam={fixture.home_team}
        awayTeam={fixture.away_team}
        onClose={closeRatingSheet}
        onIndexChange={setRatingIndex}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </div>
  )
}

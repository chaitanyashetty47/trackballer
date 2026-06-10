"use client"

import type { MatchScoreFixture } from "@/lib/match/score"
import {
  formatKickoffDateLocalShort,
  formatKickoffTimeLocal,
  formatMatchScore,
} from "@/lib/match/score"
import { cn } from "@/lib/utils"

const UPCOMING = new Set(["NS", "TBD"])
const FRIENDLY_STATUS_LABELS = new Set(["Yet to start"])

type MatchRowScoreBlockProps = {
  fixture: MatchScoreFixture
  compact?: boolean
}

/** Centre score/time + status line; uses viewer-local kickoff for upcoming matches. */
export function MatchRowScoreBlock({ fixture, compact = false }: MatchRowScoreBlockProps) {
  const { scoreline, statusLabel, isLive } = formatMatchScore(fixture)
  const isUpcoming = UPCOMING.has(fixture.status_short)
  const displayScoreline = isUpcoming
    ? formatKickoffTimeLocal(fixture.kickoff_at)
    : scoreline
  const displayStatus = isUpcoming
    ? formatKickoffDateLocalShort(fixture.kickoff_at)
    : statusLabel
  const shouldUppercase =
    !displayStatus.startsWith("PEN (") && !FRIENDLY_STATUS_LABELS.has(displayStatus)

  return (
    <>
      <span
        className={cn(
          "justify-self-center px-3 font-bold tracking-tight tabular-nums",
          compact ? "text-[14.4px]" : "text-lg",
        )}
      >
        <time dateTime={fixture.kickoff_at} suppressHydrationWarning>
          {displayScoreline}
        </time>
      </span>

      <span
        className={cn(
          "col-start-3 row-start-2 justify-self-center px-3 whitespace-nowrap font-semibold tracking-wider",
          compact ? "text-[8px]" : "text-[10px]",
          isLive ? "text-primary" : "text-muted-foreground",
          shouldUppercase && "uppercase",
        )}
      >
        <time dateTime={fixture.kickoff_at} suppressHydrationWarning>
          {displayStatus}
        </time>
      </span>
    </>
  )
}

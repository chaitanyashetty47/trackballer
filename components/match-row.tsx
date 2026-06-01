import Link from "next/link"

import { TeamFlag } from "@/components/team-flag"
import type { FixtureWithTeams } from "@/lib/catalog/types"
import { formatMatchScore } from "@/lib/match/score"
import { cn } from "@/lib/utils"

type MatchRowProps = {
  fixture: FixtureWithTeams
  showContext?: boolean
  className?: string
}

/** Shared column template — keeps names, flags, and scores aligned across rows. */
export const matchRowGridClass =
  "grid grid-cols-[minmax(0,1fr)_auto_minmax(4.5rem,auto)_auto_minmax(0,1fr)] items-center gap-x-2"

export function MatchRow({ fixture, showContext = false, className }: MatchRowProps) {
  const { scoreline, statusLabel, isLive } = formatMatchScore(fixture)

  return (
    <Link
      href={`/match/${fixture.id}`}
      className={cn(
        matchRowGridClass,
        "border-b border-border px-6 py-3.5 transition-colors last:border-b-0 hover:bg-muted/60",
        className,
      )}
    >
      <span className="block w-full min-w-0 truncate text-right text-[15px] font-semibold">
        {fixture.home_team.name}
      </span>
      <TeamFlag team={fixture.home_team} size="md" />

      <span className="justify-self-center px-3 text-lg font-bold tracking-tight tabular-nums">
        {scoreline}
      </span>

      <TeamFlag team={fixture.away_team} size="md" />
      <span className="block w-full min-w-0 truncate text-left text-[15px] font-semibold">
        {fixture.away_team.name}
      </span>

      <span
        className={cn(
          "col-start-3 row-start-2 justify-self-center px-3 whitespace-nowrap text-[10px] font-semibold tracking-wider",
          isLive ? "text-primary" : "text-muted-foreground",
          !statusLabel.startsWith("PEN (") && "uppercase",
        )}
      >
        {statusLabel}
      </span>

      {showContext && fixture.round_name && (
        <p className="col-span-5 row-start-3 mt-1 text-left text-[11px] text-muted-foreground">
          {fixture.round_name}
        </p>
      )}
    </Link>
  )
}

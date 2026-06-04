import Link from "next/link"

import { CareerRing } from "@/components/player/career-ring"
import type { TrendingPlayerCard } from "@/lib/home/types"

type TrendingPlayersProps = {
  players: TrendingPlayerCard[]
}

function formatScore(score: number): string {
  return score.toFixed(1)
}

function TrendingPlayerCardItem({ player }: { player: TrendingPlayerCard }) {
  return (
    <Link
      href={`/player/${player.id}`}
      className="flex w-[7.5rem] shrink-0 flex-col items-center gap-2 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/30 sm:w-auto"
    >
      <CareerRing
        name={player.displayName}
        photoUrl={player.photoUrl}
        tier={player.tier}
        compact
        className="size-[4.5rem]"
      />
      <p className="line-clamp-2 w-full text-center text-xs font-semibold leading-tight">
        {player.displayName}
      </p>
      <p className="font-mono text-sm font-bold tabular-nums text-primary">
        {formatScore(player.displayScore)}
      </p>
    </Link>
  )
}

export function TrendingPlayers({ players }: TrendingPlayersProps) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="h3">Trending players</h2>
        <Link href="/players" className="text-xs font-medium text-primary hover:underline">
          See all
        </Link>
      </div>

      {players.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm font-medium">No trending players yet</p>
          <p className="body-sm mt-1 text-muted-foreground">
            Rate players after big matches to see who fans are talking about.
          </p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {players.map((player) => (
            <TrendingPlayerCardItem key={player.id} player={player} />
          ))}
        </div>
      )}
    </section>
  )
}

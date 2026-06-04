import { Separator } from "@/components/ui/separator"
import type { PlayerListItem } from "@/lib/search/types"

import { PlayerResultRow } from "./player-result-row"

type SearchResultsProps = {
  query: string | null
  players: PlayerListItem[]
}

export function SearchResults({ query, players }: SearchResultsProps) {
  const hasQuery = query != null && query.length >= 1

  return (
    <div className="space-y-6">
      <section>
        <h2 className="h3 mb-2">Players ({players.length})</h2>
        {!hasQuery ? (
          <p className="body-sm rounded-lg border border-border bg-card p-4 text-muted-foreground">
            Type a player name to search.
          </p>
        ) : players.length === 0 ? (
          <p className="body-sm rounded-lg border border-border bg-card p-4 text-muted-foreground">
            No players found for &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            {players.map((player) => (
              <PlayerResultRow key={player.id} player={player} />
            ))}
          </div>
        )}
      </section>

      <Separator />

      <section>
        <h2 className="h3 mb-1 text-muted-foreground">Matches (0)</h2>
        <p className="body-sm text-muted-foreground">Match search is not available yet.</p>
      </section>

      <Separator />

      <section>
        <h2 className="h3 mb-1 text-muted-foreground">Leagues (0)</h2>
        <p className="body-sm text-muted-foreground">League search is not available yet.</p>
      </section>
    </div>
  )
}

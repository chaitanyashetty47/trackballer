"use client"

import { Search } from "lucide-react"

import { HydrationGate } from "@/components/hydration-gate"
import { Input } from "@/components/ui/input"
import type { BrowseFilters } from "@/lib/search/types"

type PlayersToolbarSearchProps = {
  filters: BrowseFilters
}

function FilterHiddenFields({ filters }: { filters: BrowseFilters }) {
  return (
    <>
      {filters.nationalTeamId != null ? (
        <input
          type="hidden"
          name="nationalTeamId"
          value={String(filters.nationalTeamId)}
          suppressHydrationWarning
        />
      ) : null}
      {filters.position ? (
        <input type="hidden" name="position" value={filters.position} suppressHydrationWarning />
      ) : null}
      {filters.clubId != null ? (
        <input type="hidden" name="clubId" value={String(filters.clubId)} suppressHydrationWarning />
      ) : null}
      {filters.ageMin != null ? (
        <input type="hidden" name="ageMin" value={String(filters.ageMin)} suppressHydrationWarning />
      ) : null}
      {filters.ageMax != null ? (
        <input type="hidden" name="ageMax" value={String(filters.ageMax)} suppressHydrationWarning />
      ) : null}
      {filters.minRating != null ? (
        <input type="hidden" name="minRating" value={String(filters.minRating)} suppressHydrationWarning />
      ) : null}
    </>
  )
}

export function PlayersToolbarSearch({ filters }: PlayersToolbarSearchProps) {
  return (
    <HydrationGate
      fallback={
        <div className="h-9 flex-1 rounded-lg border border-border bg-muted/30" aria-hidden />
      }
    >
      <form method="get" action="/players" className="flex flex-1 gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Search by name…"
            className="pl-9"
            aria-label="Search players by name"
          />
        </div>
        <FilterHiddenFields filters={filters} />
        <button type="submit" className="sr-only" suppressHydrationWarning>
          Search
        </button>
      </form>
    </HydrationGate>
  )
}

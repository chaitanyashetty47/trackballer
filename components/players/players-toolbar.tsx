import { ArrowUpDown } from "lucide-react"

import { PlayersFiltersSheet } from "@/components/players/players-filters-sheet"
import { PlayersToolbarSearch } from "@/components/players/players-toolbar-search"
import { buildPlayersBrowseHref } from "@/lib/search/query"
import type { BrowseFilterOptions, BrowseFilters } from "@/lib/search/types"

type PlayersToolbarProps = {
  filters: BrowseFilters
  options: BrowseFilterOptions
  resultCount: number | null
}

export function PlayersToolbar({ filters, options, resultCount }: PlayersToolbarProps) {
  const countLabel =
    resultCount == null ? "players" : `${resultCount} player${resultCount === 1 ? "" : "s"}`

  return (
    <div className="space-y-3">
      <PlayersToolbarSearch filters={filters} />

      <div className="flex items-center gap-2">
        <PlayersFiltersSheet filters={filters} options={options} />
        <div className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-muted-foreground">
          <ArrowUpDown className="size-3.5 shrink-0" aria-hidden />
          <span>Sort: Highest rated</span>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          <span className="font-mono font-semibold tabular-nums text-foreground">
            {resultCount ?? "—"}
          </span>{" "}
          {countLabel}
        </span>
      </div>
    </div>
  )
}

export function PlayersPagination({
  filters,
  total,
  page,
  pageSize,
}: {
  filters: BrowseFilters
  total: number | null
  page: number
  pageSize: number
}) {
  if (total == null || total <= pageSize) return null

  const totalPages = Math.ceil(total / pageSize)
  const prevPage = page > 1 ? page - 1 : null
  const nextPage = page < totalPages ? page + 1 : null

  return (
    <nav
      className="flex items-center justify-between gap-4 border-t border-border pt-4"
      aria-label="Players pagination"
    >
      {prevPage ? (
        <a
          href={buildPlayersBrowseHref({ ...filters, page: prevPage })}
          className="text-sm font-medium text-primary hover:underline"
        >
          Previous
        </a>
      ) : (
        <span className="text-sm text-muted-foreground">Previous</span>
      )}
      <span className="text-xs text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {nextPage ? (
        <a
          href={buildPlayersBrowseHref({ ...filters, page: nextPage })}
          className="text-sm font-medium text-primary hover:underline"
        >
          Next
        </a>
      ) : (
        <span className="text-sm text-muted-foreground">Next</span>
      )}
    </nav>
  )
}

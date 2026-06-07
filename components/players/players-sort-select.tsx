"use client"

import { useRouter } from "next/navigation"

import { Label } from "@/components/ui/label"
import { buildPlayersBrowseHref } from "@/lib/search/query"
import type { BrowseFilters, PlayerBrowseSort } from "@/lib/search/types"
import { cn } from "@/lib/utils"

const selectClass =
  "flex h-8 min-w-0 rounded-lg border border-border bg-background px-2 py-1 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const SORT_OPTIONS: { value: PlayerBrowseSort; label: string }[] = [
  { value: "rating-desc", label: "Rating: high to low" },
  { value: "rating-asc", label: "Rating: low to high" },
]

type PlayersSortSelectProps = {
  filters: BrowseFilters
  className?: string
}

export function PlayersSortSelect({ filters, className }: PlayersSortSelectProps) {
  const router = useRouter()

  function handleSortChange(nextSort: PlayerBrowseSort) {
    if (nextSort === filters.sort) return
    router.push(buildPlayersBrowseHref({ ...filters, sort: nextSort, page: 1 }))
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-1.5", className)}>
      <Label htmlFor="players-sort" className="sr-only">
        Sort players
      </Label>
      <select
        id="players-sort"
        value={filters.sort}
        onChange={(event) => handleSortChange(event.target.value as PlayerBrowseSort)}
        className={selectClass}
        aria-label="Sort players by rating"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

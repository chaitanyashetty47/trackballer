"use client"

import { useRouter } from "nextjs-toploader/app"

import { OptionMenuSelect } from "@/components/ui/option-menu-select"
import { buildPlayersBrowseHref } from "@/lib/search/query"
import type { BrowseFilters, PlayerBrowseSort } from "@/lib/search/types"
import { cn } from "@/lib/utils"

const SORT_OPTIONS = [
  { value: "rating-desc", label: "Rating: high to low" },
  { value: "rating-asc", label: "Rating: low to high" },
]

type PlayersSortSelectProps = {
  filters: BrowseFilters
  className?: string
}

export function PlayersSortSelect({ filters, className }: PlayersSortSelectProps) {
  const router = useRouter()

  function handleSortChange(nextSort: string) {
    if (nextSort === filters.sort) return
    router.push(buildPlayersBrowseHref({ ...filters, sort: nextSort as PlayerBrowseSort, page: 1 }))
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-1.5", className)}>
      <OptionMenuSelect
        value={filters.sort}
        onValueChange={handleSortChange}
        groups={[{ options: SORT_OPTIONS }]}
        ariaLabel="Sort players by rating"
        triggerClassName="h-8 text-xs"
      />
    </div>
  )
}

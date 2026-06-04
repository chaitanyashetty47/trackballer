"use client"

import { SlidersHorizontal } from "lucide-react"

import { PlayersFiltersForm } from "@/components/players/players-filters-form"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import type { BrowseFilterOptions, BrowseFilters } from "@/lib/search/types"

type PlayersFiltersSheetProps = {
  filters: BrowseFilters
  options: BrowseFilterOptions
}

export function PlayersFiltersSheet({ filters, options }: PlayersFiltersSheetProps) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5 lg:hidden" />
        }
      >
        <SlidersHorizontal className="size-4" />
        Filters
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] gap-0 overflow-y-auto pt-4">
        <PlayersFiltersForm
          filters={filters}
          options={options}
          idPrefix="mobile"
          showFilterHeading
          actionsPosition="top"
          className="px-1 pb-6"
        />
      </SheetContent>
    </Sheet>
  )
}

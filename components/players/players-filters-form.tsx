"use client"

import Link from "next/link"
import { Search } from "lucide-react"
import { useRouter } from "nextjs-toploader/app"
import { FormEvent, useEffect, useState } from "react"

import {
  isFullAgeRange,
  isNoMinRating,
  PLAYER_AGE_MAX,
  PLAYER_AGE_MIN,
  PLAYER_RATING_MIN,
  PlayersAgeRangeSlider,
  PlayersRatingSlider,
} from "@/components/players/players-filter-sliders"
import { HydrationGate } from "@/components/hydration-gate"
import { SearchCombobox } from "@/components/ui/search-combobox"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { buildPlayersBrowseHref, normalizeSearchQuery } from "@/lib/search/query"
import {
  nationalTeamsToComboboxOptions,
  teamsToComboboxOptions,
} from "@/lib/search/combobox-options"
import type { BrowseFilterOptions, BrowseFilters } from "@/lib/search/types"
import { cn } from "@/lib/utils"

const selectClass =
  "flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

type PlayersFiltersFormProps = {
  filters: BrowseFilters
  options: BrowseFilterOptions
  idPrefix?: string
  showActions?: boolean
  /** Show "Filters" label beside Apply/Clear when actions are at the top. */
  showFilterHeading?: boolean
  actionsPosition?: "top" | "bottom"
  className?: string
}

export function PlayersFiltersForm({
  filters,
  options,
  idPrefix = "",
  showActions = true,
  showFilterHeading = false,
  actionsPosition = "top",
  className,
}: PlayersFiltersFormProps) {
  const router = useRouter()
  const id = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name)

  const nationalTeamOptions = nationalTeamsToComboboxOptions(options.nationalTeams)
  const clubOptions = teamsToComboboxOptions(options.clubs)

  const [nationalTeamId, setNationalTeamId] = useState<string | null>(
    filters.nationalTeamId != null ? String(filters.nationalTeamId) : null,
  )
  const [query, setQuery] = useState(filters.q ?? "")
  const [clubId, setClubId] = useState<string | null>(
    filters.clubId != null ? String(filters.clubId) : null,
  )
  const [position, setPosition] = useState(filters.position ?? "")
  const [ageRange, setAgeRange] = useState<[number, number]>([
    filters.ageMin ?? PLAYER_AGE_MIN,
    filters.ageMax ?? PLAYER_AGE_MAX,
  ])
  const [ratingMin, setRatingMin] = useState(
    filters.minRating ?? PLAYER_RATING_MIN,
  )

  useEffect(() => {
    setQuery(filters.q ?? "")
    setNationalTeamId(
      filters.nationalTeamId != null ? String(filters.nationalTeamId) : null,
    )
    setClubId(filters.clubId != null ? String(filters.clubId) : null)
    setPosition(filters.position ?? "")
    setAgeRange([filters.ageMin ?? PLAYER_AGE_MIN, filters.ageMax ?? PLAYER_AGE_MAX])
    setRatingMin(filters.minRating ?? PLAYER_RATING_MIN)
  }, [filters])

  function navigateWithFilters(event?: FormEvent) {
    event?.preventDefault()

    const next: BrowseFilters = {
      q: normalizeSearchQuery(query),
      nationalTeamId:
        nationalTeamId != null ? Number.parseInt(nationalTeamId, 10) : null,
      position: position || null,
      clubId: clubId != null ? Number.parseInt(clubId, 10) : null,
      leagueSlug: "world-cup",
      ageMin: isFullAgeRange(ageRange) ? null : ageRange[0],
      ageMax: isFullAgeRange(ageRange) ? null : ageRange[1],
      minRating: isNoMinRating(ratingMin) ? null : ratingMin,
      sort: filters.sort,
      page: 1,
    }

    router.push(buildPlayersBrowseHref(next))
  }

  const filterActions =
    showActions ? (
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Apply filters
        </Button>
        <Link href="/players" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Clear
        </Link>
      </div>
    ) : (
      <Button type="submit" className="w-full" size="sm">
        Apply filters
      </Button>
    )

  const fallback = (
    <div className={cn("space-y-4", className)} aria-hidden>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-10 rounded-lg bg-muted/40" />
      ))}
    </div>
  )

  return (
    <HydrationGate fallback={fallback}>
    <form
      onSubmit={navigateWithFilters}
      className={cn("space-y-4", className)}
    >
      {actionsPosition === "top" ? (
        <div
          className={cn(
            "pb-3",
            showFilterHeading &&
              "flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border",
          )}
        >
          {showFilterHeading ? (
            <h2 className="text-sm font-semibold">Filters</h2>
          ) : null}
          {filterActions}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor={id("search")}>Name</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id={id("search")}
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name…"
            className="pl-9"
            aria-label="Search players by name"
          />
        </div>
      </div>

      <SearchCombobox
        options={nationalTeamOptions}
        valueId={nationalTeamId}
        onValueIdChange={setNationalTeamId}
        label="Country"
        placeholder="Search country…"
        emptyMessage="No countries found."
      />

      <div className="space-y-1.5">
        <Label htmlFor={id("position")}>Position</Label>
        <select
          id={id("position")}
          name="position"
          value={position}
          onChange={(event) => setPosition(event.target.value)}
          className={selectClass}
        >
          <option value="">Any</option>
          {options.positions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>

      <SearchCombobox
        options={clubOptions}
        valueId={clubId}
        onValueIdChange={setClubId}
        label="Club"
        placeholder="Search club…"
        emptyMessage="No clubs found."
      />

      <PlayersAgeRangeSlider
        id={id("age-range")}
        value={ageRange}
        onValueChange={setAgeRange}
      />

      <PlayersRatingSlider
        id={id("min-rating")}
        value={ratingMin}
        onValueChange={setRatingMin}
      />

      {actionsPosition === "bottom" ? <div className="pt-1">{filterActions}</div> : null}
    </form>
    </HydrationGate>
  )
}

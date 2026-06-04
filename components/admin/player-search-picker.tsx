"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Search } from "lucide-react"

import { PlayerResultRow } from "@/components/search/player-result-row"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import type { PlayerListItem } from "@/lib/search/types"
import { cn } from "@/lib/utils"

type PlayerSearchPickerProps = {
  label: string
  placeholder?: string
  onSelect: (player: PlayerListItem) => void
  disabled?: boolean
  className?: string
}

export function PlayerSearchPicker({
  label,
  placeholder = "Search players…",
  onSelect,
  disabled = false,
  className,
}: PlayerSearchPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)
  const [results, setResults] = useState<PlayerListItem[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (debouncedQuery.trim().length < 1) {
      setResults([])
      setIsSearching(false)
      return
    }

    let cancelled = false
    setIsSearching(true)

    fetch(`/api/search/players?q=${encodeURIComponent(debouncedQuery.trim())}`)
      .then((res) => res.json())
      .then((data: PlayerListItem[]) => {
        if (!cancelled) setResults(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setResults([])
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  const inputId = label.replace(/\s+/g, "-").toLowerCase()
  const hasQuery = query.trim().length >= 1
  const showSpinner = isSearching && results.length === 0 && hasQuery
  const showEmpty =
    !isSearching && debouncedQuery.trim().length >= 1 && results.length === 0
  const showResults = results.length > 0

  function handleSelect(player: PlayerListItem) {
    onSelect(player)
    setQuery("")
    setResults([])
    inputRef.current?.focus({ preventScroll: true })
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          ref={inputRef}
          id={inputId}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          className="pl-8"
          aria-autocomplete="list"
        />
      </div>

      {showSpinner ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Searching…
        </div>
      ) : showEmpty ? (
        <p className="rounded-lg border border-border bg-card px-3 py-4 text-sm text-muted-foreground">
          No players found
        </p>
      ) : showResults ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {isSearching ? (
            <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Updating…
            </div>
          ) : null}
          <div className="max-h-64 overflow-y-auto">
            {results.map((player) => (
              <PlayerResultRow
                key={player.id}
                player={player}
                onSelect={() => handleSelect(player)}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Type to search players</p>
      )}
    </div>
  )
}

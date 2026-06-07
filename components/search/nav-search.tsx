"use client"

import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { useRouter } from "nextjs-toploader/app"
import { useEffect, useRef, useState } from "react"
import { Loader2, Search } from "lucide-react"

import { PlayerResultRow } from "@/components/search/player-result-row"
import { HydrationGate } from "@/components/hydration-gate"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import type { PlayerListItem } from "@/lib/search/types"
import { cn } from "@/lib/utils"

function NavSearchFallback() {
  return (
    <>
      <div
        className="hidden h-8 min-w-0 max-w-[280px] flex-1 rounded-lg border border-border bg-muted/30 md:block"
        aria-hidden
      />
      <div className="size-9 shrink-0 rounded-md bg-muted/30 md:hidden" aria-hidden />
    </>
  )
}

export function NavSearch() {
  const router = useRouter()
  const anchorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PlayerListItem[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const debouncedQuery = useDebounce(query, 300)
  const dropdownOpen = query.trim().length >= 1

  useEffect(() => {
    if (!dropdownOpen) return

    const frame = requestAnimationFrame(() => {
      const input = inputRef.current
      if (!input) return

      const active = document.activeElement
      const focusStolen =
        active !== input && !popupRef.current?.contains(active)

      if (focusStolen) {
        input.focus({ preventScroll: true })
      }
    })

    return () => cancelAnimationFrame(frame)
  }, [dropdownOpen, query.length, isSearching, results.length])

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

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      if (query.trim().length >= 1 && inputRef.current === document.activeElement) {
        return
      }
      setQuery("")
      setResults([])
      setIsSearching(false)
    }
  }

  function handleResultClick(playerId: number) {
    setQuery("")
    setResults([])
    router.push(`/player/${playerId}`)
  }

  const showSpinner = isSearching && results.length === 0
  const showEmpty =
    !isSearching && debouncedQuery.trim().length >= 1 && results.length === 0
  const showResults = results.length > 0

  return (
    <HydrationGate fallback={<NavSearchFallback />}>
      <PopoverPrimitive.Root
        open={dropdownOpen}
        onOpenChange={handleOpenChange}
        modal={false}
      >
        <div
          ref={anchorRef}
          className="relative hidden min-w-0 max-w-[280px] flex-1 md:block"
        >
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search players…"
            className="h-8 w-full pl-8"
            aria-label="Search players"
            aria-expanded={dropdownOpen}
            aria-autocomplete="list"
          />
        </div>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Positioner
            anchor={anchorRef}
            side="bottom"
            align="start"
            sideOffset={4}
            className="isolate z-50"
          >
            <PopoverPrimitive.Popup
              ref={popupRef}
              initialFocus={false}
              finalFocus={inputRef}
              className={cn(
                "z-50 w-[var(--anchor-width)] max-w-[280px] rounded-lg bg-popover p-0 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden",
              )}
            >
              {showSpinner ? (
                <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Searching…
                </div>
              ) : showEmpty ? (
                <p className="px-3 py-4 text-sm text-muted-foreground">No players found</p>
              ) : showResults ? (
                <div className="max-h-64 overflow-y-auto">
                  {isSearching ? (
                    <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs text-muted-foreground">
                      <Loader2 className="size-3.5 animate-spin" aria-hidden />
                      Updating…
                    </div>
                  ) : null}
                  {results.map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      className="w-full text-left"
                      onMouseDown={(event) => {
                        event.preventDefault()
                        handleResultClick(player.id)
                      }}
                    >
                      <PlayerResultRow player={player} />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="px-3 py-4 text-sm text-muted-foreground">Type to search players</p>
              )}
            </PopoverPrimitive.Popup>
          </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      <a
        href="/search"
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden",
        )}
        aria-label="Search players"
      >
        <Search className="size-[18px]" strokeWidth={2} />
      </a>
    </HydrationGate>
  )
}

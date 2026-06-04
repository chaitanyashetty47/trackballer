"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

const STORAGE_KEY = "pb-recent-player-searches"
const MAX_RECENT = 5

type RecentSearchesProps = {
  onPick: (term: string) => void
  className?: string
}

export function RecentSearches({ onPick, className }: RecentSearchesProps) {
  const [terms, setTerms] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed)) {
        setTerms(parsed.filter((item): item is string => typeof item === "string").slice(0, MAX_RECENT))
      }
    } catch {
      // ignore corrupt storage
    }
  }, [])

  if (terms.length === 0) return null

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Recent searches
      </p>
      <div className="flex flex-wrap gap-2">
        {terms.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => onPick(term)}
            className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium hover:bg-muted"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  )
}

export function rememberRecentSearch(term: string) {
  const trimmed = term.trim()
  if (trimmed.length < 2) return

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const existing = raw ? (JSON.parse(raw) as unknown) : []
    const list = Array.isArray(existing)
      ? existing.filter((item): item is string => typeof item === "string")
      : []
    const next = [trimmed, ...list.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(
      0,
      MAX_RECENT,
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore quota errors
  }
}

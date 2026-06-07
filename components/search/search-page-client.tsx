"use client"

import { useEffect } from "react"
import { useRouter } from "nextjs-toploader/app"

import { RecentSearches, rememberRecentSearch } from "./recent-searches"
import { SearchForm } from "./search-form"

type SearchPageClientProps = {
  initialQuery: string
}

export function SearchPageClient({ initialQuery }: SearchPageClientProps) {
  const router = useRouter()

  useEffect(() => {
    if (initialQuery.length >= 2) {
      rememberRecentSearch(initialQuery)
    }
  }, [initialQuery])

  return (
    <div className="space-y-6">
      <SearchForm initialQuery={initialQuery} autoFocus />
      {!initialQuery && (
        <RecentSearches
          onPick={(term) => router.push(`/search?q=${encodeURIComponent(term)}`)}
        />
      )}
    </div>
  )
}

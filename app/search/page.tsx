import { SearchPageClient } from "@/components/search/search-page-client"
import { SearchResults } from "@/components/search/search-results"
import { normalizeSearchQuery } from "@/lib/search/query"
import { searchPlayers } from "@/lib/search/search-players"

type PageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q: rawQ } = await searchParams
  const query = normalizeSearchQuery(rawQ ?? "")
  const players = query ? await searchPlayers(query) : []

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <p className="eyebrow mb-2">Search</p>
      <h1 className="h-display mb-6">Find players</h1>

      <SearchPageClient initialQuery={rawQ?.trim() ?? ""} />

      <div className="mt-8">
        <SearchResults query={query} players={players} />
      </div>
    </div>
  )
}

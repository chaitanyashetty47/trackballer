import { cache } from "react"

import { createClient } from "@/lib/supabase/server"

import { playerMatchesNameQuery } from "./player-name-query"

export type PlayerSearchIndexEntry = {
  id: number
  name: string
  firstname: string | null
  lastname: string | null
}

const ROW_PAGE = 1000

async function fetchAllPlayersIndexRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<PlayerSearchIndexEntry[]> {
  const rows: PlayerSearchIndexEntry[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from("players")
      .select("id, name, firstname, lastname")
      .range(from, from + ROW_PAGE - 1)

    if (error) {
      console.error("getPlayerSearchIndex failed:", error.message)
      break
    }

    rows.push(...((data ?? []) as PlayerSearchIndexEntry[]))
    if (!data || data.length < ROW_PAGE) break
    from += ROW_PAGE
  }

  return rows
}

/** Cached catalog names for fast substring search across all players. */
export const getPlayerSearchIndex = cache(async (): Promise<PlayerSearchIndexEntry[]> => {
  const supabase = await createClient()
  return fetchAllPlayersIndexRows(supabase)
})

export function matchPlayerIdsFromIndex(
  index: PlayerSearchIndexEntry[],
  rawQuery: string,
  scopePlayerIds?: number[],
): number[] {
  const trimmed = rawQuery.trim()
  if (!trimmed) return []

  const scope =
    scopePlayerIds && scopePlayerIds.length > 0 ? new Set(scopePlayerIds) : null

  const ids: number[] = []
  for (const entry of index) {
    if (scope && !scope.has(entry.id)) continue
    if (
      playerMatchesNameQuery(entry.firstname, entry.lastname, entry.name, trimmed)
    ) {
      ids.push(entry.id)
    }
  }

  return ids
}

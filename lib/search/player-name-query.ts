import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/database.types"

import {
  getPlayerSearchIndex,
  matchPlayerIdsFromIndex,
} from "./player-search-index"

type Db = SupabaseClient<Database>

/**
 * Substring match on name, firstname, and lastname using the cached players index.
 */
export async function fetchPlayerIdsMatchingName(
  _supabase: Db,
  rawQuery: string,
): Promise<number[]> {
  const trimmed = rawQuery.trim()
  if (!trimmed) return []

  const index = await getPlayerSearchIndex()
  return matchPlayerIdsFromIndex(index, trimmed)
}

export function playerMatchesNameQuery(
  firstname: string | null,
  lastname: string | null,
  name: string,
  rawQuery: string,
): boolean {
  const needle = rawQuery.trim().toLowerCase()
  if (!needle) return true

  const parts = [name, firstname, lastname, `${firstname ?? ""} ${lastname ?? ""}`.trim()]
    .filter((part): part is string => Boolean(part?.trim()))
    .map((part) => part.toLowerCase())

  return parts.some((part) => part.includes(needle))
}

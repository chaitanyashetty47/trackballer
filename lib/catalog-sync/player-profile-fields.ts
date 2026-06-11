import type { SupabaseClient } from "@supabase/supabase-js";

import type { ApiFootballClient } from "@/lib/api-football/client";
import type { ApiPlayerProfileItem } from "@/lib/api-football/types";
import type { Database } from "@/lib/database.types";
import { mergePlayerIdentityFields, type PlayerInsert } from "./player-merge";

type Db = SupabaseClient<Database>;

export type PlayerIdentityEnrichOptions = {
  /** API-Football season on GET /players?id&season (e.g. 2025). */
  profileSeasonYear?: number;
  limit?: number;
  offset?: number;
};

export type PlayerIdentityEnrichStats = {
  profileSeasonYear: number;
  candidates: number;
  offset: number;
  enriched: number;
  failed: number;
  apiCalls: number;
  nextOffset: number | null;
  failures: Array<{ playerId: number; error: string }>;
};

/** PostgREST returns at most 1000 rows per request unless paginated. */
const SUPABASE_PAGE_SIZE = 1000;

const IDENTITY_INCOMPLETE_FILTER =
  "firstname.is.null,lastname.is.null,nationality.is.null,birth_date.is.null";

/** Players missing firstname, lastname, nationality, or birth_date. */
export async function findPlayersNeedingIdentityEnrich(
  db: Db,
): Promise<Array<{ id: number }>> {
  const candidates: Array<{ id: number }> = [];
  let from = 0;

  while (true) {
    const { data, error } = await db
      .from("players")
      .select("id")
      .or(IDENTITY_INCOMPLETE_FILTER)
      .order("id", { ascending: true })
      .range(from, from + SUPABASE_PAGE_SIZE - 1);

    if (error) throw error;

    const batch = data ?? [];
    if (batch.length === 0) break;

    candidates.push(...batch.map((row) => ({ id: row.id })));

    if (batch.length < SUPABASE_PAGE_SIZE) break;
    from += SUPABASE_PAGE_SIZE;
  }

  return candidates;
}

export function mapPlayerIdentityFromApi(
  item: ApiPlayerProfileItem,
): PlayerInsert {
  const p = item.player;
  const birthRaw = p.birth?.date;
  const birth_date =
    birthRaw && birthRaw.length >= 10 ? birthRaw.slice(0, 10) : null;

  return {
    id: p.id,
    name: p.name,
    firstname: p.firstname ?? null,
    lastname: p.lastname ?? null,
    age: p.age ?? null,
    birth_date,
    nationality: p.nationality ?? null,
    photo_url: p.photo ?? null,
  };
}

async function fetchPlayersByIds(db: Db, ids: number[]) {
  if (ids.length === 0) {
    return new Map<number, Database["public"]["Tables"]["players"]["Row"]>();
  }
  const { data, error } = await db.from("players").select("*").in("id", ids);
  if (error) throw error;
  return new Map((data ?? []).map((row) => [row.id, row]));
}

async function upsertIdentityPlayer(
  db: Db,
  incoming: PlayerInsert,
): Promise<void> {
  const existing = (await fetchPlayersByIds(db, [incoming.id])).get(incoming.id) ?? null;
  const merged = mergePlayerIdentityFields(existing, incoming);
  const { error } = await db.from("players").upsert(merged, { onConflict: "id" });
  if (error) throw error;
}

/**
 * Fill firstname, lastname, nationality, and birth_date when any are missing.
 * Does not change club_team_id or national_team_id.
 */
export async function enrichPlayerIdentityFields(
  db: Db,
  api: ApiFootballClient,
  options: PlayerIdentityEnrichOptions = {},
): Promise<PlayerIdentityEnrichStats> {
  const profileSeasonYear =
    options.profileSeasonYear ??
    Number(process.env.API_FOOTBALL_CLUBS_SEASON ?? process.env.API_FOOTBALL_SEASON ?? 2025);
  const offset = options.offset ?? 0;

  const candidates = await findPlayersNeedingIdentityEnrich(db);
  const remaining = candidates.length - offset;
  const limit = options.limit ?? remaining;
  const batch = candidates.slice(offset, offset + limit);

  const stats: PlayerIdentityEnrichStats = {
    profileSeasonYear,
    candidates: candidates.length,
    offset,
    enriched: 0,
    failed: 0,
    apiCalls: 0,
    nextOffset:
      offset + batch.length < candidates.length ? offset + batch.length : null,
    failures: [],
  };

  for (const candidate of batch) {
    try {
      const res = await api.getPlayerProfile(candidate.id, profileSeasonYear);
      stats.apiCalls += 1;

      const item = res.response[0];
      if (!item?.player) {
        throw new Error("No profile returned");
      }

      await upsertIdentityPlayer(db, mapPlayerIdentityFromApi(item));
      stats.enriched += 1;
    } catch (err) {
      stats.failed += 1;
      stats.failures.push({
        playerId: candidate.id,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return stats;
}

import type { SupabaseClient } from "@supabase/supabase-js";

import type { ApiFootballClient } from "@/lib/api-football/client";
import type { Database } from "@/lib/database.types";
import { mergePlayerProfile, type PlayerInsert } from "./player-merge";
import { mapPlayerProfile } from "./player-profile-picker";

type Db = SupabaseClient<Database>;

export type PlayerEnrichOptions = {
  /**
   * API-Football season on GET /players?id&season — use current domestic year
   * (e.g. 2025) so current club crests fill in (Kane → Bayern, Messi → Inter Miami).
   */
  profileSeasonYear?: number;
  /**
   * When set, only players linked in `player_season_squads` for this WC season
   * (e.g. 2026) — skips Curacao and other non-squad rows in `players`.
   */
  squadSeasonYear?: number;
  leagueId?: number;
  /** When true (default), set `national_team_id` from WC squad and ensure NT row in `teams`. */
  syncNationalTeam?: boolean;
  /** Only enrich players on these national team ids (e.g. [10] England, [6,3] Brazil + Croatia). */
  nationalTeamIds?: number[];
  /** Max players this run. Omit to process all remaining candidates (fine locally). */
  limit?: number;
  /** Skip first N candidates for resume after a partial run. */
  offset?: number;
};

export type PlayerEnrichStats = {
  profileSeasonYear: number;
  squadSeasonYear: number | null;
  candidates: number;
  offset: number;
  enriched: number;
  failed: number;
  clubsUpserted: number;
  nationalTeamsEnsured: number;
  apiCalls: number;
  nextOffset: number | null;
  failures: Array<{ playerId: number; error: string }>;
};

function dedupeById<T extends { id: number }>(rows: T[]): T[] {
  const map = new Map<number, T>();
  for (const row of rows) {
    map.set(row.id, row);
  }
  return [...map.values()];
}

type PlayerCandidate = {
  id: number;
  national_team_id: number | null;
};

function isProfileIncomplete(
  row: PlayerCandidate & {
    firstname: string | null;
    lastname: string | null;
    nationality: string | null;
    birth_date: string | null;
    club_team_id: number | null;
  },
  syncNationalTeam: boolean,
): boolean {
  return (
    row.firstname == null ||
    row.lastname == null ||
    row.nationality == null ||
    row.birth_date == null ||
    row.club_team_id == null ||
    (syncNationalTeam && row.national_team_id == null)
  );
}

async function resolveSeasonId(
  db: Db,
  leagueId: number,
  seasonYear: number,
): Promise<number> {
  const { data, error } = await db
    .from("seasons")
    .select("id")
    .eq("league_id", leagueId)
    .eq("year", seasonYear)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error(
      `Season ${seasonYear} not found — run POST /api/admin/sync/bootstrap first`,
    );
  }
  return data.id;
}

async function fetchWcSquadPlayerMap(
  db: Db,
  seasonId: number,
): Promise<Map<number, number>> {
  const { data, error } = await db
    .from("player_season_squads")
    .select("player_id, team_id")
    .eq("season_id", seasonId);

  if (error) throw error;

  const map = new Map<number, number>();
  for (const row of data ?? []) {
    map.set(row.player_id, row.team_id);
  }
  return map;
}

/** Players in our DB missing any Dembélé-style profile field or current club. */
export async function findPlayersNeedingProfileEnrich(
  db: Db,
  options: Pick<
    PlayerEnrichOptions,
    "squadSeasonYear" | "leagueId" | "syncNationalTeam" | "nationalTeamIds"
  > = {},
): Promise<PlayerCandidate[]> {
  const syncNationalTeam = options.syncNationalTeam !== false;
  const nationalTeamFilter =
    options.nationalTeamIds?.length ?
      new Set(options.nationalTeamIds)
    : null;

  let squadNationalTeamByPlayer: Map<number, number> | null = null;

  if (options.squadSeasonYear != null) {
    const leagueId =
      options.leagueId ?? Number(process.env.API_FOOTBALL_LEAGUE_ID ?? 1);
    const seasonId = await resolveSeasonId(db, leagueId, options.squadSeasonYear);
    squadNationalTeamByPlayer = await fetchWcSquadPlayerMap(db, seasonId);
  }

  const { data, error } = await db
    .from("players")
    .select(
      "id, firstname, lastname, nationality, birth_date, club_team_id, national_team_id",
    )
    .order("id");

  if (error) throw error;

  return (data ?? [])
    .map((row) => ({
      ...row,
      national_team_id:
        squadNationalTeamByPlayer?.get(row.id) ?? row.national_team_id,
    }))
    .filter((row) => {
      if (squadNationalTeamByPlayer && !squadNationalTeamByPlayer.has(row.id)) {
        return false;
      }
      if (
        nationalTeamFilter &&
        (row.national_team_id == null ||
          !nationalTeamFilter.has(row.national_team_id))
      ) {
        return false;
      }
      return isProfileIncomplete(row, syncNationalTeam);
    })
    .map((row) => ({
      id: row.id,
      national_team_id: row.national_team_id,
    }));
}

async function fetchPlayersByIds(db: Db, ids: number[]) {
  if (ids.length === 0) {
    return new Map<number, Database["public"]["Tables"]["players"]["Row"]>();
  }
  const { data, error } = await db.from("players").select("*").in("id", ids);
  if (error) throw error;
  return new Map((data ?? []).map((row) => [row.id, row]));
}

async function upsertTeams(
  db: Db,
  rows: Database["public"]["Tables"]["teams"]["Insert"][],
): Promise<number> {
  if (rows.length === 0) return 0;
  const unique = dedupeById(rows);
  const { error } = await db.from("teams").upsert(unique, { onConflict: "id" });
  if (error) throw error;
  return unique.length;
}

async function ensureNationalTeamRow(
  db: Db,
  teamId: number,
): Promise<boolean> {
  const { data, error } = await db
    .from("teams")
    .select("id, name, code, country, logo_url")
    .eq("id", teamId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return false;

  const { error: upsertError } = await db.from("teams").upsert(
    {
      id: data.id,
      name: data.name,
      code: data.code,
      country: data.country,
      logo_url: data.logo_url,
      is_national: true,
    },
    { onConflict: "id" },
  );
  if (upsertError) throw upsertError;
  return true;
}

async function upsertEnrichedPlayer(
  db: Db,
  row: PlayerInsert,
  nationalTeamId: number | null,
): Promise<void> {
  const existing = (await fetchPlayersByIds(db, [row.id])).get(row.id) ?? null;
  const merged = mergePlayerProfile(existing, row, nationalTeamId);
  const { error } = await db.from("players").upsert(merged, { onConflict: "id" });
  if (error) throw error;
}

/**
 * Fill profile gaps for players already in Postgres — current club, names, nationality, DOB.
 * One API call per player: GET /players?id&season.
 */
export async function enrichPlayerProfiles(
  db: Db,
  api: ApiFootballClient,
  options: PlayerEnrichOptions = {},
): Promise<PlayerEnrichStats> {
  const profileSeasonYear =
    options.profileSeasonYear ??
    Number(process.env.API_FOOTBALL_CLUBS_SEASON ?? process.env.API_FOOTBALL_SEASON ?? 2025);
  const offset = options.offset ?? 0;
  const squadSeasonYear = options.squadSeasonYear ?? null;

  const syncNationalTeam = options.syncNationalTeam !== false;

  const candidates = await findPlayersNeedingProfileEnrich(db, {
    squadSeasonYear: options.squadSeasonYear,
    leagueId: options.leagueId,
    syncNationalTeam,
    nationalTeamIds: options.nationalTeamIds,
  });

  const remaining = candidates.length - offset;
  const limit = options.limit ?? remaining;
  const batch = candidates.slice(offset, offset + limit);

  const stats: PlayerEnrichStats = {
    profileSeasonYear,
    squadSeasonYear,
    candidates: candidates.length,
    offset,
    enriched: 0,
    failed: 0,
    clubsUpserted: 0,
    nationalTeamsEnsured: 0,
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

      const nationalTeamId = candidate.national_team_id;
      const { player, clubTeam } = mapPlayerProfile(item, { nationalTeamId });

      if (clubTeam) {
        stats.clubsUpserted += await upsertTeams(db, [clubTeam]);
      }

      if (syncNationalTeam && nationalTeamId != null) {
        if (await ensureNationalTeamRow(db, nationalTeamId)) {
          stats.nationalTeamsEnsured += 1;
        }
      }

      await upsertEnrichedPlayer(db, player, nationalTeamId);
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

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { ApiFootballClient } from "@/lib/api-football/client";
import {
  mapAppearances,
  mapEvents,
  mapFixtureRow,
  mapLineups,
  mapPlayerProfile,
  mapPlayersFromSquad,
  mapTeamFromFixtureSide,
  mapTeamFromLeague,
} from "./mappers";
import { TERMINAL_STATUSES } from "./constants";
import {
  isPlaceholderPlayerName,
  mergePlayerProfile,
  mergePlayerStub,
  type PlayerInsert,
} from "./player-merge";

type Db = SupabaseClient<Database>;

export type BootstrapOptions = {
  leagueId?: number;
  seasonYear?: number;
  /** Sync lineups / appearances / events for every terminal fixture (slow). */
  syncFixtureDetails?: boolean;
};

export type SyncStats = {
  rounds: number;
  fixtures: number;
  teams: number;
  players: number;
  squads: number;
  fixtureDetailsSynced?: number;
};

export type FixtureDetailStats = {
  fixtureId: number;
  lineups: number;
  appearances: number;
  events: number;
  skippedEmptyLineups: boolean;
};

export type PlayerProfileStats = {
  playerId: number;
  name: string;
  updated: boolean;
};

export type RepairPlayersOptions = {
  seasonYear?: number;
  /** Cap API calls per request (rate limit). Default 30. */
  limit?: number;
};

export type RepairPlayersStats = {
  candidates: number;
  repaired: number;
  failed: number;
  failures: Array<{ playerId: number; error: string }>;
};

export type PendingFixtureDetailsOptions = {
  leagueId?: number;
  seasonYear?: number;
  /** Max fixtures to sync this run (optional). Each fixture = 3 API calls. */
  limit?: number;
};

export type PendingFixtureDetailsStats = {
  pending: number;
  skipped: number;
  synced: number;
  failed: number;
  skippedFixtureIds: number[];
  syncedFixtureIds: number[];
  failures: Array<{ fixtureId: number; error: string }>;
};

function dedupeById<T extends { id: number }>(rows: T[]): T[] {
  const map = new Map<number, T>();
  for (const row of rows) {
    map.set(row.id, row);
  }
  return [...map.values()];
}

export class CatalogSync {
  constructor(
    private readonly db: Db,
    private readonly api: ApiFootballClient = new ApiFootballClient(),
  ) {}

  get rateLimitInfo() {
    return this.api.rateLimit;
  }

  async ensureSeason(leagueId: number, seasonYear: number): Promise<number> {
    const { data: existing, error: selectError } = await this.db
      .from("seasons")
      .select("id")
      .eq("league_id", leagueId)
      .eq("year", seasonYear)
      .maybeSingle();

    if (selectError) throw selectError;
    if (existing) return existing.id;

    const { data: inserted, error: insertError } = await this.db
      .from("seasons")
      .insert({
        league_id: leagueId,
        year: seasonYear,
        is_current: true,
      })
      .select("id")
      .single();

    if (insertError) throw insertError;
    return inserted.id;
  }

  private async upsertTeams(
    rows: Database["public"]["Tables"]["teams"]["Insert"][],
  ): Promise<number> {
    if (rows.length === 0) return 0;
    const unique = dedupeById(rows);
    const { error } = await this.db.from("teams").upsert(unique, {
      onConflict: "id",
    });
    if (error) throw error;
    return unique.length;
  }

  private async fetchPlayersByIds(ids: number[]) {
    if (ids.length === 0) {
      return new Map<
        number,
        Database["public"]["Tables"]["players"]["Row"]
      >();
    }
    const { data, error } = await this.db
      .from("players")
      .select("*")
      .in("id", ids);
    if (error) throw error;
    return new Map((data ?? []).map((row) => [row.id, row]));
  }

  private async fetchSquadNationalTeamId(
    playerId: number,
  ): Promise<number | null> {
    const { data, error } = await this.db
      .from("player_season_squads")
      .select("team_id")
      .eq("player_id", playerId)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data?.team_id ?? null;
  }

  private async upsertPlayers(
    rows: PlayerInsert[],
    options?: { mergeWithExisting?: boolean },
  ): Promise<void> {
    if (rows.length === 0) return;
    const unique = dedupeById(rows);
    const merge = options?.mergeWithExisting !== false;

    let toWrite = unique;
    if (merge) {
      const existing = await this.fetchPlayersByIds(unique.map((r) => r.id));
      toWrite = unique.map((incoming) =>
        mergePlayerStub(existing.get(incoming.id) ?? null, incoming),
      );
    }

    const { error } = await this.db.from("players").upsert(toWrite, {
      onConflict: "id",
      ignoreDuplicates: false,
    });
    if (error) throw error;
  }

  private async upsertPlayerProfile(row: PlayerInsert): Promise<void> {
    const existing = (await this.fetchPlayersByIds([row.id])).get(row.id) ?? null;
    const squadTeamId = await this.fetchSquadNationalTeamId(row.id);
    const merged = mergePlayerProfile(existing, row, squadTeamId);
    const { error } = await this.db.from("players").upsert(merged, {
      onConflict: "id",
    });
    if (error) throw error;
  }

  /**
   * Full profile from GET /players?id&season — firstname, lastname, nationality, birth_date.
   * Preserves national_team_id when already set or linked via player_season_squads.
   */
  async syncPlayerProfile(
    playerId: number,
    seasonYear?: number,
  ): Promise<PlayerProfileStats> {
    const season =
      seasonYear ?? Number(process.env.API_FOOTBALL_SEASON ?? 2022);
    const res = await this.api.getPlayerProfile(playerId, season);
    const item = res.response[0];
    if (!item?.player) {
      throw new Error(`No profile returned for player ${playerId} season ${season}`);
    }

    const row = mapPlayerProfile(item);
    await this.upsertPlayerProfile(row);

    return {
      playerId,
      name: row.name,
      updated: true,
    };
  }

  async findPlayersNeedingRepair(): Promise<number[]> {
    const { data: players, error: playersError } = await this.db
      .from("players")
      .select("id, name, national_team_id");
    if (playersError) throw playersError;

    const { data: appearances, error: appError } = await this.db
      .from("fixture_appearances")
      .select("player_id");
    if (appError) throw appError;

    const appearanceIds = new Set((appearances ?? []).map((a) => a.player_id));
    const ids = new Set<number>();

    for (const p of players ?? []) {
      if (isPlaceholderPlayerName(p.name)) {
        ids.add(p.id);
        continue;
      }
      if (p.national_team_id == null && appearanceIds.has(p.id)) {
        ids.add(p.id);
      }
    }

    return [...ids].sort((a, b) => a - b);
  }

  async repairPlayers(
    options: RepairPlayersOptions = {},
  ): Promise<RepairPlayersStats> {
    const limit = options.limit ?? 30;
    const candidates = await this.findPlayersNeedingRepair();
    const batch = candidates.slice(0, limit);

    const stats: RepairPlayersStats = {
      candidates: candidates.length,
      repaired: 0,
      failed: 0,
      failures: [],
    };

    for (const playerId of batch) {
      try {
        await this.syncPlayerProfile(playerId, options.seasonYear);
        stats.repaired += 1;
      } catch (err) {
        stats.failed += 1;
        stats.failures.push({
          playerId,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return stats;
  }

  /**
   * Job 0 — Bootstrap season catalog (WC 2022 in dev).
   * Order: rounds → fixtures (upsert teams inline) → teams → squads.
   */
  async bootstrapSeason(options: BootstrapOptions = {}): Promise<SyncStats> {
    const leagueId = options.leagueId ?? Number(process.env.API_FOOTBALL_LEAGUE_ID ?? 1);
    const seasonYear =
      options.seasonYear ?? Number(process.env.API_FOOTBALL_SEASON ?? 2022);
    const seasonId = await this.ensureSeason(leagueId, seasonYear);
    const stats: SyncStats = {
      rounds: 0,
      fixtures: 0,
      teams: 0,
      players: 0,
      squads: 0,
    };

    const roundsRes = await this.api.getFixtureRounds(leagueId, seasonYear);
    const roundNames = roundsRes.response;

    const roundIdByName = new Map<string, number>();
    for (let i = 0; i < roundNames.length; i++) {
      const name = roundNames[i];
      const { data, error } = await this.db
        .from("rounds")
        .upsert(
          { season_id: seasonId, name, sort_order: i },
          { onConflict: "season_id,name" },
        )
        .select("id, name")
        .single();
      if (error) throw error;
      roundIdByName.set(name, data.id);
      stats.rounds += 1;
    }

    const teamRows: Database["public"]["Tables"]["teams"]["Insert"][] = [];
    const fixtureRows: Database["public"]["Tables"]["fixtures"]["Insert"][] = [];

    for (const roundName of roundNames) {
      const fixturesRes = await this.api.getFixturesByRound(
        leagueId,
        seasonYear,
        roundName,
      );

      const items = fixturesRes.response;
      if (items.length === 0) {
        continue;
      }

      const roundId = roundIdByName.get(roundName) ?? null;

      for (const item of items) {
        teamRows.push(
          mapTeamFromFixtureSide(item.teams.home, { isNational: true }),
          mapTeamFromFixtureSide(item.teams.away, { isNational: true }),
        );
        fixtureRows.push(
          mapFixtureRow(item, seasonId, roundId, roundName),
        );
      }
    }

    stats.teams += await this.upsertTeams(teamRows);

    if (fixtureRows.length > 0) {
      const uniqueFixtures = dedupeById(fixtureRows);
      const { error } = await this.db.from("fixtures").upsert(uniqueFixtures, {
        onConflict: "id",
      });
      if (error) throw error;
      stats.fixtures = uniqueFixtures.length;
    }

    const teamsRes = await this.api.getTeams(leagueId, seasonYear);
    const leagueTeams = teamsRes.response.map(mapTeamFromLeague);
    stats.teams += await this.upsertTeams(leagueTeams);

    for (const team of leagueTeams) {
      const squadRes = await this.api.getSquad(team.id);
      const squad = squadRes.response[0];
      if (!squad?.players?.length) {
        continue;
      }

      const players = mapPlayersFromSquad(squad);
      await this.upsertPlayers(players);
      stats.players += players.length;

      const links = players.map((p) => ({
        season_id: seasonId,
        team_id: team.id,
        player_id: p.id,
      }));

      const { error } = await this.db
        .from("player_season_squads")
        .upsert(links, { onConflict: "season_id,team_id,player_id" });
      if (error) throw error;
      stats.squads += 1;
    }

    if (options.syncFixtureDetails) {
      const { data: terminalFixtures, error } = await this.db
        .from("fixtures")
        .select("id, status_short")
        .eq("season_id", seasonId)
        .in("status_short", [...TERMINAL_STATUSES]);

      if (error) throw error;

      let detailCount = 0;
      for (const fx of terminalFixtures ?? []) {
        await this.syncFixtureDetail(fx.id);
        detailCount += 1;
      }
      stats.fixtureDetailsSynced = detailCount;
    }

    return stats;
  }

  /**
   * Sync lineups, appearances, and events only for terminal fixtures
   * where `lineups_synced_at` is still null (skips already-synced matches).
   */
  async syncPendingFixtureDetails(
    options: PendingFixtureDetailsOptions = {},
  ): Promise<PendingFixtureDetailsStats> {
    const leagueId =
      options.leagueId ?? Number(process.env.API_FOOTBALL_LEAGUE_ID ?? 1);
    const seasonYear =
      options.seasonYear ?? Number(process.env.API_FOOTBALL_SEASON ?? 2022);

    const { data: season, error: seasonError } = await this.db
      .from("seasons")
      .select("id")
      .eq("league_id", leagueId)
      .eq("year", seasonYear)
      .maybeSingle();

    if (seasonError) throw seasonError;
    if (!season) {
      throw new Error(
        `Season ${seasonYear} not found — run POST /api/admin/sync/bootstrap first`,
      );
    }

    const { data: fixtures, error: fixturesError } = await this.db
      .from("fixtures")
      .select("id, lineups_synced_at")
      .eq("season_id", season.id)
      .in("status_short", [...TERMINAL_STATUSES])
      .order("kickoff_at", { ascending: true });

    if (fixturesError) throw fixturesError;

    const skippedFixtureIds: number[] = [];
    const pendingIds: number[] = [];

    for (const fx of fixtures ?? []) {
      if (fx.lineups_synced_at) {
        skippedFixtureIds.push(fx.id);
      } else {
        pendingIds.push(fx.id);
      }
    }

    const batch =
      options.limit != null ? pendingIds.slice(0, options.limit) : pendingIds;

    const stats: PendingFixtureDetailsStats = {
      pending: pendingIds.length,
      skipped: skippedFixtureIds.length,
      synced: 0,
      failed: 0,
      skippedFixtureIds,
      syncedFixtureIds: [],
      failures: [],
    };

    for (const fixtureId of batch) {
      try {
        await this.syncFixtureDetail(fixtureId);
        stats.syncedFixtureIds.push(fixtureId);
        stats.synced += 1;
      } catch (err) {
        stats.failed += 1;
        stats.failures.push({
          fixtureId,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return stats;
  }

  /**
   * Sync lineups, appearances, and events for one fixture.
   * Empty lineup response (200 + []) does not delete existing rows.
   */
  async syncFixtureDetail(fixtureId: number): Promise<FixtureDetailStats> {
    const now = new Date().toISOString();
    const result: FixtureDetailStats = {
      fixtureId,
      lineups: 0,
      appearances: 0,
      events: 0,
      skippedEmptyLineups: false,
    };

    const lineupsRes = await this.api.getLineups(fixtureId);
    const playersRes = await this.api.getFixturePlayers(fixtureId);
    const eventsRes = await this.api.getFixtureEvents(fixtureId);

    const lineups = lineupsRes.response;
    if (lineups.length > 0) {
      const { lineups: lineupRows, playerStubs } = mapLineups(fixtureId, lineups);
      await this.upsertPlayers(playerStubs);
      await this.db.from("fixture_lineups").delete().eq("fixture_id", fixtureId);
      const { error } = await this.db.from("fixture_lineups").insert(lineupRows);
      if (error) throw error;
      result.lineups = lineupRows.length;

      await this.db
        .from("fixtures")
        .update({ lineups_synced_at: now })
        .eq("id", fixtureId);
    } else {
      result.skippedEmptyLineups = true;
    }

    const playerBlocks = playersRes.response;
    if (playerBlocks.length > 0) {
      const { appearances, playerStubs } = mapAppearances(
        fixtureId,
        playerBlocks,
      );
      await this.upsertPlayers(playerStubs);
      await this.db
        .from("fixture_appearances")
        .delete()
        .eq("fixture_id", fixtureId);
      const { error } = await this.db
        .from("fixture_appearances")
        .insert(appearances);
      if (error) throw error;
      result.appearances = appearances.length;

      await this.db
        .from("fixtures")
        .update({ appearances_synced_at: now })
        .eq("id", fixtureId);
    }

    const events = eventsRes.response;
    if (events.length > 0) {
      const eventRows = mapEvents(fixtureId, events);
      const playerIds = new Set<number>();
      for (const e of eventRows) {
        if (e.player_id) playerIds.add(e.player_id);
        if (e.assist_player_id) playerIds.add(e.assist_player_id);
      }
      if (playerIds.size > 0) {
        const stubs: PlayerInsert[] = [...playerIds].map((id) => {
          const fromEvent = events.find((ev) => ev.player.id === id);
          const eventName = fromEvent?.player.name?.trim();
          return {
            id,
            name: eventName || `Player ${id}`,
          };
        });
        await this.upsertPlayers(stubs);
      }

      await this.db.from("fixture_events").delete().eq("fixture_id", fixtureId);
      const { error } = await this.db.from("fixture_events").insert(eventRows);
      if (error) throw error;
      result.events = eventRows.length;
    }

    const { data: fixture } = await this.db
      .from("fixtures")
      .select("status_short")
      .eq("id", fixtureId)
      .single();

    if (fixture && TERMINAL_STATUSES.has(fixture.status_short)) {
      await this.db
        .from("fixtures")
        .update({ ratings_unlocked_at: now })
        .eq("id", fixtureId)
        .is("ratings_unlocked_at", null);
    }

    return result;
  }

  async getCatalogStatus(seasonYear?: number) {
    const year =
      seasonYear ?? Number(process.env.API_FOOTBALL_SEASON ?? 2022);
    const leagueId = Number(process.env.API_FOOTBALL_LEAGUE_ID ?? 1);

    const { data: season } = await this.db
      .from("seasons")
      .select("id")
      .eq("league_id", leagueId)
      .eq("year", year)
      .maybeSingle();

    if (!season) {
      return { seasonYear: year, bootstrapped: false, apiQuota: this.api.lastQuota };
    }

    const seasonId = season.id;

    const countFor = async (
      table: "rounds" | "fixtures" | "player_season_squads",
    ) => {
      const { count, error } = await this.db
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq("season_id", seasonId);
      if (error) throw error;
      return count ?? 0;
    };

    const { count: teamCount, error: teamError } = await this.db
      .from("teams")
      .select("*", { count: "exact", head: true })
      .eq("is_national", true);
    if (teamError) throw teamError;

    const { count: playerCount, error: playerError } = await this.db
      .from("players")
      .select("*", { count: "exact", head: true });
    if (playerError) throw playerError;

    const { count: lineupCount, error: lineupError } = await this.db
      .from("fixture_lineups")
      .select("*", { count: "exact", head: true });
    if (lineupError) throw lineupError;

    const { count: appearanceCount, error: appearanceError } = await this.db
      .from("fixture_appearances")
      .select("*", { count: "exact", head: true });
    if (appearanceError) throw appearanceError;

    const { count: eventCount, error: eventError } = await this.db
      .from("fixture_events")
      .select("*", { count: "exact", head: true });
    if (eventError) throw eventError;

    return {
      seasonYear: year,
      seasonId,
      bootstrapped: true,
      counts: {
        rounds: await countFor("rounds"),
        fixtures: await countFor("fixtures"),
        teams: teamCount ?? 0,
        players: playerCount ?? 0,
        squads: await countFor("player_season_squads"),
        fixture_lineups: lineupCount ?? 0,
        fixture_appearances: appearanceCount ?? 0,
        fixture_events: eventCount ?? 0,
      },
      apiQuota: this.api.lastQuota,
    };
  }
}

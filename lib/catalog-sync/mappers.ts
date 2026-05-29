import type { Database } from "@/lib/database.types";
import type {
  ApiFixtureEventItem,
  ApiFixtureItem,
  ApiFixturePlayersItem,
  ApiLeagueTeamItem,
  ApiLineupItem,
  ApiLineupPlayer,
  ApiPlayerProfileItem,
  ApiSquadItem,
  ApiTeamRef,
} from "@/lib/api-football/types";
import { TERMINAL_STATUSES } from "./constants";

type TeamInsert = Database["public"]["Tables"]["teams"]["Insert"];
type PlayerInsert = Database["public"]["Tables"]["players"]["Insert"];
type FixtureInsert = Database["public"]["Tables"]["fixtures"]["Insert"];
type LineupInsert = Database["public"]["Tables"]["fixture_lineups"]["Insert"];
type AppearanceInsert =
  Database["public"]["Tables"]["fixture_appearances"]["Insert"];
type EventInsert = Database["public"]["Tables"]["fixture_events"]["Insert"];

export function normalizePosition(raw?: string | null): string | null {
  if (!raw) return null;
  const p = raw.toLowerCase();
  if (p.includes("goal")) return "GK";
  if (p.includes("def")) return "DEF";
  if (p.includes("mid")) return "MID";
  if (p.includes("att") || p.includes("for") || p.includes("strik")) {
    return "FWD";
  }
  const short = raw.toUpperCase();
  if (["GK", "DEF", "MID", "FWD"].includes(short)) return short;
  if (short === "G") return "GK";
  if (short === "D") return "DEF";
  if (short === "M") return "MID";
  if (short === "F" || short === "A") return "FWD";
  return null;
}

export function mapTeamFromFixtureSide(
  side: ApiTeamRef,
  options?: { isNational?: boolean },
): TeamInsert {
  return {
    id: side.id,
    name: side.name,
    logo_url: side.logo ?? null,
    is_national: options?.isNational ?? false,
  };
}

export function mapTeamFromLeague(item: ApiLeagueTeamItem): TeamInsert {
  return {
    id: item.team.id,
    name: item.team.name,
    code: item.team.code ?? null,
    country: item.team.country ?? null,
    logo_url: item.team.logo ?? null,
    is_national: true,
  };
}

export function mapPlayerProfile(item: ApiPlayerProfileItem): PlayerInsert {
  const p = item.player;
  const birthRaw = p.birth?.date;
  const birth_date =
    birthRaw && birthRaw.length >= 10 ? birthRaw.slice(0, 10) : null;
  const position = item.statistics?.[0]?.games?.position;

  return {
    id: p.id,
    name: p.name,
    firstname: p.firstname ?? null,
    lastname: p.lastname ?? null,
    age: p.age ?? null,
    birth_date,
    nationality: p.nationality ?? null,
    photo_url: p.photo ?? null,
    primary_position: normalizePosition(position),
  };
}

export function mapPlayersFromSquad(
  squad: ApiSquadItem,
): PlayerInsert[] {
  return squad.players.map((p) => ({
    id: p.id,
    name: p.name,
    age: p.age ?? null,
    photo_url: p.photo ?? null,
    primary_position: normalizePosition(p.position),
    national_team_id: squad.team.id,
  }));
}

export function mapFixtureRow(
  item: ApiFixtureItem,
  seasonId: number,
  roundId: number | null,
  roundName: string,
): FixtureInsert {
  const statusShort = item.fixture.status.short;
  const homeWinner = item.teams.home.winner === true;
  const awayWinner = item.teams.away.winner === true;
  const winnerTeamId = homeWinner
    ? item.teams.home.id
    : awayWinner
      ? item.teams.away.id
      : null;

  return {
    id: item.fixture.id,
    season_id: seasonId,
    round_id: roundId,
    round_name: roundName,
    home_team_id: item.teams.home.id,
    away_team_id: item.teams.away.id,
    venue: item.fixture.venue?.name ?? null,
    kickoff_at: item.fixture.date,
    status_short: statusShort,
    status_long: item.fixture.status.long,
    home_goals_ft: item.score.fulltime?.home ?? item.goals.home,
    away_goals_ft: item.score.fulltime?.away ?? item.goals.away,
    home_goals_et: item.score.extratime?.home ?? null,
    away_goals_et: item.score.extratime?.away ?? null,
    home_goals_pen: item.score.penalty?.home ?? null,
    away_goals_pen: item.score.penalty?.away ?? null,
    winner_team_id: winnerTeamId,
    ratings_unlocked_at: TERMINAL_STATUSES.has(statusShort)
      ? new Date().toISOString()
      : null,
  };
}

function mapLineupPlayer(
  fixtureId: number,
  teamId: number,
  entry: ApiLineupPlayer,
  isStarter: boolean,
): LineupInsert {
  return {
    fixture_id: fixtureId,
    team_id: teamId,
    player_id: entry.player.id,
    is_starter: isStarter,
    shirt_number: entry.player.number ?? null,
    formation_position: entry.player.pos ?? null,
    grid: entry.player.grid ?? null,
  };
}

export function mapLineups(
  fixtureId: number,
  lineups: ApiLineupItem[],
): { lineups: LineupInsert[]; playerStubs: PlayerInsert[] } {
  const lineupsOut: LineupInsert[] = [];
  const playerStubs: PlayerInsert[] = [];

  for (const teamLineup of lineups) {
    const teamId = teamLineup.team.id;
    for (const entry of teamLineup.startXI) {
      lineupsOut.push(
        mapLineupPlayer(fixtureId, teamId, entry, true),
      );
      playerStubs.push({
        id: entry.player.id,
        name: entry.player.name,
      });
    }
    for (const entry of teamLineup.substitutes) {
      lineupsOut.push(
        mapLineupPlayer(fixtureId, teamId, entry, false),
      );
      playerStubs.push({
        id: entry.player.id,
        name: entry.player.name,
      });
    }
  }

  return { lineups: lineupsOut, playerStubs };
}

export function mapAppearances(
  fixtureId: number,
  teams: ApiFixturePlayersItem[],
): { appearances: AppearanceInsert[]; playerStubs: PlayerInsert[] } {
  const appearances: AppearanceInsert[] = [];
  const playerStubs: PlayerInsert[] = [];

  for (const teamBlock of teams) {
    for (const row of teamBlock.players) {
      const stats = row.statistics[0]?.games;
      const minutes = stats?.minutes ?? 0;
      appearances.push({
        fixture_id: fixtureId,
        team_id: teamBlock.team.id,
        player_id: row.player.id,
        minutes_played: minutes,
        is_starter: stats?.substitute === false,
        position: normalizePosition(stats?.position) ?? stats?.position ?? null,
      });
      playerStubs.push({
        id: row.player.id,
        name: row.player.name,
        photo_url: row.player.photo ?? null,
        primary_position: normalizePosition(stats?.position),
      });
    }
  }

  return { appearances, playerStubs };
}

export function mapEvents(
  fixtureId: number,
  events: ApiFixtureEventItem[],
): EventInsert[] {
  return events.map((e) => ({
    fixture_id: fixtureId,
    team_id: e.team.id,
    player_id: e.player.id ?? null,
    assist_player_id: e.assist?.id ?? null,
    minute: e.time.elapsed,
    extra_minute: e.time.extra ?? null,
    type: e.type,
    detail: e.detail,
  }));
}

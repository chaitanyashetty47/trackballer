/** API-Football v3 response shapes (subset used by CatalogSync). */

export type ApiFootballResponse<T> = {
  get: string;
  parameters: Record<string, string | number>;
  errors: string[] | Record<string, string>;
  results: number;
  paging?: { current: number; total: number };
  response: T;
};

export type ApiTeamRef = {
  id: number;
  name: string;
  logo?: string | null;
  winner?: boolean | null;
};

export type ApiFixtureItem = {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string };
    venue?: { name?: string | null } | null;
  };
  league: {
    id: number;
    name: string;
    season: number;
    round?: string | null;
  };
  teams: {
    home: ApiTeamRef;
    away: ApiTeamRef;
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime?: { home: number | null; away: number | null };
    fulltime?: { home: number | null; away: number | null };
    extratime?: { home: number | null; away: number | null };
    penalty?: { home: number | null; away: number | null };
  };
};

export type ApiLeagueTeamItem = {
  team: {
    id: number;
    name: string;
    code?: string | null;
    country?: string | null;
    logo?: string | null;
  };
};

export type ApiSquadItem = {
  team: { id: number; name: string };
  players: Array<{
    id: number;
    name: string;
    age?: number | null;
    number?: number | null;
    position?: string | null;
    photo?: string | null;
  }>;
};

export type ApiLineupPlayer = {
  player: {
    id: number;
    name: string;
    number?: number | null;
    pos?: string | null;
    grid?: string | null;
  };
};

export type ApiLineupItem = {
  team: { id: number; name: string };
  formation?: string | null;
  coach?: {
    id?: number | null;
    name?: string | null;
    photo?: string | null;
  } | null;
  startXI: ApiLineupPlayer[];
  substitutes: ApiLineupPlayer[];
};

export type ApiFixturePlayersItem = {
  team: { id: number; name: string };
  players: Array<{
    player: { id: number; name: string; photo?: string | null };
    statistics: Array<{
      games: {
        minutes?: number | null;
        position?: string | null;
        substitute?: boolean | null;
      };
    }>;
  }>;
};

export type ApiPlayerProfileItem = {
  player: {
    id: number;
    name: string;
    firstname?: string | null;
    lastname?: string | null;
    age?: number | null;
    birth?: {
      date?: string | null;
      place?: string | null;
      country?: string | null;
    } | null;
    nationality?: string | null;
    photo?: string | null;
  };
  statistics?: Array<{
    games?: { position?: string | null };
  }>;
};

export type ApiFixtureEventItem = {
  time: { elapsed: number; extra?: number | null };
  team: { id: number; name: string };
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string | null;
};

export type ApiQuotaHeaders = {
  remainingDay?: string;
  remainingMinute?: string;
};

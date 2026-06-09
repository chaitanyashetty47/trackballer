import type { Database } from "@/lib/database.types";
import type { ApiPlayerProfileItem } from "@/lib/api-football/types";
import { normalizePosition } from "./mappers";

type TeamInsert = Database["public"]["Tables"]["teams"]["Insert"];
type PlayerInsert = Database["public"]["Tables"]["players"]["Insert"];

type StatBlock = NonNullable<ApiPlayerProfileItem["statistics"]>[number];

/** Prefer a domestic club stat block over the national team row. */
export function pickClubStatBlock(
  statistics: StatBlock[] | undefined,
  nationalTeamId: number | null | undefined,
): StatBlock | null {
  if (!statistics?.length) return null;

  if (nationalTeamId != null) {
    const club = statistics.find((s) => s.team?.id != null && s.team.id !== nationalTeamId);
    if (club) return club;
  }

  return statistics.find((s) => s.team?.id != null) ?? null;
}

export function mapClubTeamFromStat(stat: StatBlock): TeamInsert | null {
  const team = stat.team;
  if (!team?.id || !team.name) return null;

  return {
    id: team.id,
    name: team.name,
    logo_url: team.logo ?? null,
    is_national: false,
  };
}

export function mapPlayerProfile(
  item: ApiPlayerProfileItem,
  options?: { nationalTeamId?: number | null },
): { player: PlayerInsert; clubTeam: TeamInsert | null } {
  const p = item.player;
  const birthRaw = p.birth?.date;
  const birth_date =
    birthRaw && birthRaw.length >= 10 ? birthRaw.slice(0, 10) : null;
  const clubStat = pickClubStatBlock(item.statistics, options?.nationalTeamId);
  const position = clubStat?.games?.position ?? item.statistics?.[0]?.games?.position;

  const clubTeam =
    clubStat && clubStat.team?.id !== options?.nationalTeamId
      ? mapClubTeamFromStat(clubStat)
      : null;

  return {
    player: {
      id: p.id,
      name: p.name,
      firstname: p.firstname ?? null,
      lastname: p.lastname ?? null,
      age: p.age ?? null,
      birth_date,
      nationality: p.nationality ?? null,
      photo_url: p.photo ?? null,
      primary_position: normalizePosition(position),
      club_team_id: clubTeam?.id ?? null,
    },
    clubTeam,
  };
}

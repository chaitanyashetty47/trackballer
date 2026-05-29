import type { Database } from "@/lib/database.types";

export type PlayerInsert = Database["public"]["Tables"]["players"]["Insert"];
export type PlayerRow = Database["public"]["Tables"]["players"]["Row"];

const PLACEHOLDER_NAME = /^Player \d+$/;

export function isPlaceholderPlayerName(name: string | null | undefined): boolean {
  if (!name?.trim()) return true;
  return PLACEHOLDER_NAME.test(name.trim());
}

function pickName(
  incoming: string | undefined,
  existing: string | null | undefined,
  playerId: number,
): string {
  const inName = incoming?.trim();
  if (inName && !isPlaceholderPlayerName(inName)) return inName;
  if (existing?.trim() && !isPlaceholderPlayerName(existing)) return existing.trim();
  if (inName) return inName;
  return existing?.trim() || `Player ${playerId}`;
}

/** Merge a partial stub with an existing row — never downgrade a real name to a placeholder. */
export function mergePlayerStub(
  existing: PlayerRow | null,
  incoming: PlayerInsert,
): PlayerInsert {
  const id = incoming.id;

  const merged: PlayerInsert = {
    id,
    name: pickName(incoming.name, existing?.name, id),
  };

  if (incoming.firstname !== undefined) merged.firstname = incoming.firstname;
  else if (existing?.firstname) merged.firstname = existing.firstname;

  if (incoming.lastname !== undefined) merged.lastname = incoming.lastname;
  else if (existing?.lastname) merged.lastname = existing.lastname;

  if (incoming.age !== undefined && incoming.age !== null) merged.age = incoming.age;
  else if (existing?.age != null) merged.age = existing.age;

  if (incoming.birth_date !== undefined) merged.birth_date = incoming.birth_date;
  else if (existing?.birth_date) merged.birth_date = existing.birth_date;

  if (incoming.nationality !== undefined) merged.nationality = incoming.nationality;
  else if (existing?.nationality) merged.nationality = existing.nationality;

  if (incoming.photo_url !== undefined) merged.photo_url = incoming.photo_url;
  else if (existing?.photo_url) merged.photo_url = existing.photo_url;

  if (incoming.primary_position !== undefined) {
    merged.primary_position = incoming.primary_position;
  } else if (existing?.primary_position) {
    merged.primary_position = existing.primary_position;
  }

  if (incoming.national_team_id !== undefined && incoming.national_team_id !== null) {
    merged.national_team_id = incoming.national_team_id;
  } else if (existing?.national_team_id != null) {
    merged.national_team_id = existing.national_team_id;
  }

  if (incoming.club_team_id !== undefined) merged.club_team_id = incoming.club_team_id;
  else if (existing?.club_team_id) merged.club_team_id = existing.club_team_id;

  return merged;
}

/** Full profile from /players — preserve squad national_team_id when already set. */
export function mergePlayerProfile(
  existing: PlayerRow | null,
  profile: PlayerInsert,
  squadNationalTeamId: number | null,
): PlayerInsert {
  const merged = mergePlayerStub(existing, profile);

  if (existing?.national_team_id != null) {
    merged.national_team_id = existing.national_team_id;
  } else if (squadNationalTeamId != null) {
    merged.national_team_id = squadNationalTeamId;
  }

  return merged;
}

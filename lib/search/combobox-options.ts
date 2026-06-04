import type { TeamOption } from "@/lib/onboarding/types"

import type { BrowseClubOption } from "./types"

export function teamsToComboboxOptions(teams: BrowseClubOption[]): TeamOption[] {
  return teams.map((team) => ({
    id: String(team.id),
    label: team.name,
    logo_url: team.logo_url,
    code: team.code,
  }))
}

/** @deprecated Use teamsToComboboxOptions */
export const clubsToComboboxOptions = teamsToComboboxOptions
export const nationalTeamsToComboboxOptions = teamsToComboboxOptions

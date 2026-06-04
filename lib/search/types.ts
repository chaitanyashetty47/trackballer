export type PlayerListItem = {
  id: number
  displayName: string
  photoUrl: string | null
  nationality: string | null
  position: string | null
  age: number | null
  tier: string
  displayScore: number
  isProvisional: boolean
  clubName: string | null
}

export type BrowseFilters = {
  q: string | null
  nationalTeamId: number | null
  position: string | null
  clubId: number | null
  leagueSlug: string | null
  ageMin: number | null
  ageMax: number | null
  minRating: number | null
  page: number
}

export type BrowseClubOption = {
  id: number
  name: string
  logo_url: string | null
  code: string | null
}

export type BrowseNationalTeamOption = BrowseClubOption

export type BrowseFilterOptions = {
  nationalTeams: BrowseNationalTeamOption[]
  positions: string[]
  clubs: BrowseClubOption[]
  leagueLabel: string
  seasonId: number | null
}

export type BrowsePlayersResult = {
  players: PlayerListItem[]
  total: number | null
  page: number
  pageSize: number
}

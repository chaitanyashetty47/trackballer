export type CompetitionStripItem = {
  id: number
  name: string
  slug: string
  shortLabel: string
  href: string
  isFeatured: boolean
  logoUrl: string | null
}

export type CompetitionStrip = {
  featured: CompetitionStripItem
  others: CompetitionStripItem[]
}

export type TrendingPlayerCard = {
  id: number
  /** Catalog name from `players.name` — not firstname + lastname. */
  name: string
  photoUrl: string | null
  tier: string
  displayScore: number
  isProvisional: boolean
}

export type TrendingCommentCard = {
  id: number
  body: string
  score: number
  upvoteCount: number
  createdAt: string
  authorName: string
  authorClubLogoUrl: string | null
  playerId: number
  playerName: string
}

export type YourTeamTodayItem = {
  fixtureId: number
  teamName: string
  teamLogoUrl: string | null
  kickoffAt: string
  roundName: string | null
  opponentName: string
  opponentLogoUrl: string | null
  isHome: boolean
}

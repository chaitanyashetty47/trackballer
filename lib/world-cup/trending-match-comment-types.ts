type TrendingMatchCommentTeam = {
  id: number
  name: string
  logo_url: string | null
  code: string | null
}

export type TrendingMatchCommentCard = {
  id: number
  body: string
  score: number
  upvoteCount: number
  createdAt: string
  authorUserId: string
  authorUsername: string | null
  authorDisplayName: string
  authorClub: { id: number; name: string; logo_url: string | null } | null
  authorNationalTeam: { id: number; name: string; logo_url: string | null } | null
  fixtureId: number
  homeTeam: TrendingMatchCommentTeam
  awayTeam: TrendingMatchCommentTeam
}

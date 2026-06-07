import type { TeamOption } from "@/lib/onboarding/types"
import type { AvatarSource } from "@/lib/profile/display-avatar"

export type ProfileTeam = {
  id: number
  name: string
  logoUrl: string | null
  code: string | null
}

export type ProfileView = {
  id: string
  username: string | null
  displayName: string
  avatarUrl: string | null
  googleAvatarUrl: string | null
  xAvatarUrl: string | null
  avatarSource: AvatarSource | null
  countryCode: string | null
  memberSince: string
  favouriteClub: ProfileTeam | null
  favouriteNationalTeam: ProfileTeam | null
  twitterHandle: string | null
  twitterVerifiedAt: string | null
  instagramHandle: string | null
}

export type ProfileStats = {
  ratingsGiven: number
  commentsCount: number
  upvotesReceived: number
}

export type RecentRatingItem = {
  kind: "match" | "career"
  playerId: number
  playerName: string
  value: number
  ratedAt: string
}

export type RecentCommentItem = {
  id: number
  body: string
  score: number
  createdAt: string
  playerId: number | null
  fixtureId: number | null
  playerName: string | null
}

export type ProfilePageData = {
  profile: ProfileView
  stats: ProfileStats
  recentRatings: RecentRatingItem[]
  recentComments: RecentCommentItem[]
  isOwner: boolean
  teamOptions: {
    clubs: TeamOption[]
    nationalTeams: TeamOption[]
  }
}

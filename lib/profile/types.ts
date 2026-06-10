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
  photoUrl: string | null
  value: number
  ratedAt: string
  /** Set for match ratings — the team the rated player faced. */
  oppositionTeam: ProfileTeam | null
}

type RecentCommentTeam = {
  id: number
  name: string
  logoUrl: string | null
  code: string | null
}

export type RecentPlayerCommentItem = {
  targetType: "player"
  id: number
  body: string
  upvoteCount: number
  createdAt: string
  playerId: number
  playerName: string
  playerPhotoUrl: string | null
}

export type RecentMatchCommentItem = {
  targetType: "match"
  id: number
  body: string
  upvoteCount: number
  createdAt: string
  fixtureId: number
  homeTeam: RecentCommentTeam
  awayTeam: RecentCommentTeam
}

export type RecentCommentItem = RecentPlayerCommentItem | RecentMatchCommentItem

export type ProfilePageData = {
  profile: ProfileView
  stats: ProfileStats
  recentRatings: RecentRatingItem[]
  recentComments: RecentCommentItem[]
  isOwner: boolean
  viewerUserId: string | null
  teamOptions: {
    clubs: TeamOption[]
    nationalTeams: TeamOption[]
  }
}

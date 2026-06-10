/** Shared profile fields for comment author rows — keep queries and server actions in sync. */
export const COMMENT_PROFILE_SELECT = `
  id,
  username,
  display_name,
  avatar_url,
  favourite_club:teams!profiles_favourite_club_id_fkey(id, name, logo_url),
  favourite_national_team:teams!profiles_favourite_national_team_id_fkey(id, name, logo_url)
`

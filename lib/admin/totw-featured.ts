/** Postgres error when migration `20260604120000_team_of_the_week_featured` is not applied yet. */
export function isMissingFeaturedColumn(message: string | undefined): boolean {
  if (!message) return false
  return message.includes("featured_at") && message.includes("does not exist")
}

export const FEATURED_MIGRATION_HINT =
  "Run `npx supabase db push` in trackballer/ to add the featured_at column (migration 20260604120000)."

import { createClient } from "@/utils/client"

/** Issue a new access token so custom_access_token_hook picks up latest profile flags. */
export async function refreshAuthSession(): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.refreshSession()
  return !error && Boolean(data.session)
}

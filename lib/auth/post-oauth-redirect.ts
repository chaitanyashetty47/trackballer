import type { SupabaseClient } from "@supabase/supabase-js"

import { getServerAuth } from "@/lib/auth/server-session"
import type { Database } from "@/lib/database.types"

/** Where to send the user after OAuth code exchange (onboarding vs home). */
export async function getPostOAuthRedirectPath(
  supabase: SupabaseClient<Database>,
): Promise<string> {
  const auth = await getServerAuth(supabase)

  if (!auth) return "/login?error=auth"

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at, username, country_code")
    .eq("id", auth.userId)
    .maybeSingle()

  const onboardingDone =
    profile?.onboarding_completed_at &&
    profile.username &&
    profile.country_code

  return onboardingDone ? "/" : "/onboarding"
}

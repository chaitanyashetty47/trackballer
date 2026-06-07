import type { SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/database.types"

/** Where to send the user after OAuth code exchange (onboarding vs home). */
export async function getPostOAuthRedirectPath(
  supabase: SupabaseClient<Database>,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return "/login?error=auth"

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed_at, username, country_code")
    .eq("id", user.id)
    .maybeSingle()

  const onboardingDone =
    profile?.onboarding_completed_at &&
    profile.username &&
    profile.country_code

  return onboardingDone ? "/" : "/onboarding"
}

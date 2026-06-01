import { createClient } from "@/lib/supabase/server"
import {
  onboardingOptionsSchema,
  teamOptionSchema,
  type OnboardingOptions,
  type TeamOption,
} from "@/lib/onboarding/types"

function mapTeamRow(row: {
  id: number
  name: string
  logo_url: string | null
  code: string | null
}): TeamOption {
  return teamOptionSchema.parse({
    id: String(row.id),
    label: row.name,
    logo_url: row.logo_url,
    code: row.code,
  })
}

export async function getOnboardingOptions(): Promise<OnboardingOptions> {
  const supabase = await createClient()

  const [clubsRes, nationsRes] = await Promise.all([
    supabase
      .from("teams")
      .select("id, name, logo_url, code")
      .eq("is_national", false)
      .order("name"),
    supabase
      .from("teams")
      .select("id, name, logo_url, code")
      .eq("is_national", true)
      .order("name"),
  ])

  if (clubsRes.error) throw clubsRes.error
  if (nationsRes.error) throw nationsRes.error

  return onboardingOptionsSchema.parse({
    clubs: (clubsRes.data ?? []).map(mapTeamRow),
    nationalTeams: (nationsRes.data ?? []).map(mapTeamRow),
  })
}

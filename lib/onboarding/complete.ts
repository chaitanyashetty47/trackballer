"use server"

import { redirect } from "next/navigation"

import { completeOnboardingSchema } from "@/lib/onboarding/types"
import { createClient } from "@/lib/supabase/server"

export type CompleteOnboardingResult =
  | { ok: true }
  | { ok: false; error: string }

export async function completeOnboarding(
  input: unknown,
): Promise<CompleteOnboardingResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false, error: "You must be signed in." }
  }

  const parsed = completeOnboardingSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid onboarding data"
    return { ok: false, error: message }
  }

  const { dateOfBirth, location, favouriteClubId, favouriteNationalTeamId } =
    parsed.data

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      date_of_birth: dateOfBirth,
      location,
      favourite_club_id: favouriteClubId,
      favourite_national_team_id: favouriteNationalTeamId,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (updateError) {
    return { ok: false, error: "Could not save your profile. Try again." }
  }

  redirect("/")
}

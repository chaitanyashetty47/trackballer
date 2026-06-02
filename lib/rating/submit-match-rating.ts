"use server"

import { submitMatchRatingSchema } from "@/lib/rating/types"
import { createClient } from "@/lib/supabase/server"

export type SubmitMatchRatingResult =
  | { ok: true }
  | { ok: false; error: string }

export async function submitMatchRating(
  input: unknown,
): Promise<SubmitMatchRatingResult> {
  const parsed = submitMatchRatingSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid rating"
    return { ok: false, error: message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "Sign in to rate players." }
  }

  const { fixtureId, playerId, value } = parsed.data

  const { error } = await supabase.from("match_ratings").upsert(
    {
      user_id: user.id,
      fixture_id: fixtureId,
      player_id: playerId,
      value,
    },
    { onConflict: "user_id,fixture_id,player_id" },
  )

  if (error) {
    return { ok: false, error: "Could not save rating. Try again." }
  }

  return { ok: true }
}

"use server"

import { revalidatePath } from "next/cache"

import { submitCareerRatingSchema } from "@/lib/rating/types"
import { createClient } from "@/lib/supabase/server"

export type SubmitCareerRatingResult =
  | { ok: true }
  | { ok: false; error: string }

export async function submitCareerRating(
  input: unknown,
): Promise<SubmitCareerRatingResult> {
  const parsed = submitCareerRatingSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid rating"
    return { ok: false, error: message }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "Sign in to rate careers." }
  }

  const { playerId, value } = parsed.data

  const { error } = await supabase.from("career_ratings").upsert(
    {
      user_id: user.id,
      player_id: playerId,
      value,
    },
    { onConflict: "user_id,player_id" },
  )

  if (error) {
    return { ok: false, error: "Could not save career rating. Try again." }
  }

  revalidatePath(`/player/${playerId}`)
  return { ok: true }
}

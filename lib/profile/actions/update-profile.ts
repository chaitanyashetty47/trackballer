"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { socialHandlesSchema } from "@/lib/profile/validate-social-handles"
import { createClient } from "@/lib/supabase/server"

const updateProfileSchema = z
  .object({
    displayName: z.string().trim().min(1, "Display name is required.").max(80),
    location: z
      .string()
      .nullable()
      .optional()
      .transform((v) => {
        const t = v?.trim() ?? ""
        return t.length > 0 ? t : null
      }),
    avatarUrl: z.string().max(2000).optional().default(""),
    favouriteClubId: z.number().int().positive().nullable(),
    favouriteNationalTeamId: z.number().int().positive().nullable(),
    plasticFanConfirmed: z.boolean().optional(),
  })
  .merge(socialHandlesSchema)

export type UpdateProfileResult = { ok: true } | { ok: false; error: string }

export async function updateProfile(input: unknown): Promise<UpdateProfileResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "Sign in to edit your profile." }
  }

  const parsed = updateProfileSchema.safeParse(input)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid profile data."
    return { ok: false, error: message }
  }

  const data = parsed.data

  const photoRaw = data.avatarUrl.trim()
  let avatarUrl: string | null = null
  if (photoRaw) {
    try {
      const url = new URL(photoRaw)
      if (url.protocol !== "https:") {
        return { ok: false, error: "Avatar URL must use https." }
      }
      avatarUrl = photoRaw
    } catch {
      return { ok: false, error: "Avatar URL must be a valid https link or empty." }
    }
  }

  const { data: existing, error: fetchError } = await supabase
    .from("profiles")
    .select("favourite_club_id, onboarding_completed_at")
    .eq("id", user.id)
    .single()

  if (fetchError || !existing) {
    return { ok: false, error: "Could not load your profile." }
  }

  const clubChanged =
    existing.favourite_club_id != null &&
    data.favouriteClubId !== existing.favourite_club_id

  if (
    clubChanged &&
    existing.onboarding_completed_at &&
    !data.plasticFanConfirmed
  ) {
    return {
      ok: false,
      error: "Confirm your new club loyalty before saving.",
    }
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      display_name: data.displayName,
      location: data.location,
      avatar_url: avatarUrl,
      favourite_club_id: data.favouriteClubId,
      favourite_national_team_id: data.favouriteNationalTeamId,
      twitter_handle: data.twitterHandle,
      instagram_handle: data.instagramHandle,
      tiktok_handle: data.tiktokHandle,
      reddit_handle: data.redditHandle,
    })
    .eq("id", user.id)

  if (updateError) {
    return { ok: false, error: "Could not save profile. Try again." }
  }

  revalidatePath(`/profile/${user.id}`)
  revalidatePath("/")
  return { ok: true }
}

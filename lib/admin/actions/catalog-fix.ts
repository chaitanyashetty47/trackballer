"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { assertAdminAction } from "@/lib/admin/assert-admin-action"
import { validatePlayerNameUpdate } from "@/lib/admin/validate-player-name"
import { createAdminClient } from "@/lib/supabase/admin"

const optionalNameField = z
  .string()
  .trim()
  .max(80)
  .transform((s) => (s.length > 0 ? s : null))

const fixSchema = z.object({
  playerId: z.number().int().positive(),
  name: z.string().trim().min(1).max(120),
  firstname: optionalNameField,
  lastname: optionalNameField,
  photoUrl: z.string().max(2000),
  fmBaseRating: z
    .union([z.null(), z.number().min(1).max(99.99)])
    .optional()
    .transform((v) => v ?? null),
})

export type CatalogFixResult = { ok: true } | { ok: false; error: string }

export type PlayerCatalogEdit = {
  id: number
  name: string
  firstname: string | null
  lastname: string | null
  photoUrl: string | null
  fmBaseRating: number | null
}

export type GetPlayerCatalogEditResult =
  | { ok: true; data: PlayerCatalogEdit }
  | { ok: false; error: string }

export async function getPlayerCatalogEdit(
  playerId: number,
): Promise<GetPlayerCatalogEditResult> {
  const gate = await assertAdminAction()
  if (!gate.ok) return gate

  if (!Number.isInteger(playerId) || playerId <= 0) {
    return { ok: false, error: "Invalid player." }
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from("players")
    .select("id, name, firstname, lastname, photo_url, fm_base_rating")
    .eq("id", playerId)
    .single()

  if (error || !data) {
    return { ok: false, error: "Player not found." }
  }

  return {
    ok: true,
    data: {
      id: data.id,
      name: data.name,
      firstname: data.firstname,
      lastname: data.lastname,
      photoUrl: data.photo_url,
      fmBaseRating: data.fm_base_rating,
    },
  }
}

export async function fixPlayerCatalog(input: unknown): Promise<CatalogFixResult> {
  const gate = await assertAdminAction()
  if (!gate.ok) return gate

  const parsed = fixSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Invalid player data." }
  }

  const admin = createAdminClient()
  const { data: player, error: fetchError } = await admin
    .from("players")
    .select("name, fm_base_rating")
    .eq("id", parsed.data.playerId)
    .single()

  if (fetchError || !player) {
    return { ok: false, error: "Player not found." }
  }

  const nameError = validatePlayerNameUpdate(player.name, parsed.data.name)
  if (nameError) {
    return { ok: false, error: nameError }
  }

  const photoRaw = parsed.data.photoUrl.trim()
  let photoUrl: string | null = null
  if (photoRaw) {
    try {
      new URL(photoRaw)
      photoUrl = photoRaw
    } catch {
      return { ok: false, error: "Photo URL must be a valid https link or empty." }
    }
  }

  const fmChanged =
    (player.fm_base_rating ?? null) !== (parsed.data.fmBaseRating ?? null)

  const { error: updateError } = await admin
    .from("players")
    .update({
      name: parsed.data.name.trim(),
      firstname: parsed.data.firstname,
      lastname: parsed.data.lastname,
      photo_url: photoUrl,
      fm_base_rating: parsed.data.fmBaseRating,
    })
    .eq("id", parsed.data.playerId)

  if (updateError) {
    return { ok: false, error: "Could not save player." }
  }

  if (fmChanged) {
    const { error: rpcError } = await admin.rpc("recompute_player_career_aggregate", {
      p_player_id: parsed.data.playerId,
    })
    if (rpcError) {
      console.error("recompute_player_career_aggregate failed:", rpcError.message)
    }
  }

  revalidatePath(`/player/${parsed.data.playerId}`)
  revalidatePath("/players")
  return { ok: true }
}

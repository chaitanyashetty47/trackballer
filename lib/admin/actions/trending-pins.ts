"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { assertAdminAction } from "@/lib/admin/assert-admin-action"
import { createClient } from "@/lib/supabase/server"

const savePinsSchema = z.object({
  playerIds: z.array(z.number().int().positive()).max(20),
})

export type SaveTrendingPinsResult = { ok: true } | { ok: false; error: string }

export async function saveTrendingPins(
  input: unknown,
): Promise<SaveTrendingPinsResult> {
  const gate = await assertAdminAction()
  if (!gate.ok) return gate

  const parsed = savePinsSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Invalid pin list." }
  }

  const uniqueIds = [...new Set(parsed.data.playerIds)]
  if (uniqueIds.length !== parsed.data.playerIds.length) {
    return { ok: false, error: "Each player can only be pinned once." }
  }

  const supabase = await createClient()
  const { data: existing, error: listError } = await supabase
    .from("featured_trending_players")
    .select("id, player_id")

  if (listError) {
    return { ok: false, error: "Could not load pins." }
  }

  const keepIds = new Set(uniqueIds)
  const toDelete = (existing ?? []).filter((row) => !keepIds.has(row.player_id))

  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("featured_trending_players")
      .delete()
      .in(
        "id",
        toDelete.map((r) => r.id),
      )

    if (deleteError) {
      return { ok: false, error: "Could not remove old pins." }
    }
  }

  for (let i = 0; i < uniqueIds.length; i++) {
    const playerId = uniqueIds[i]!
    const sortOrder = i
    const row = (existing ?? []).find((r) => r.player_id === playerId)

    if (row) {
      const { error } = await supabase
        .from("featured_trending_players")
        .update({ sort_order: sortOrder })
        .eq("id", row.id)

      if (error) {
        return { ok: false, error: "Could not update pin order." }
      }
    } else {
      const { error } = await supabase.from("featured_trending_players").insert({
        player_id: playerId,
        sort_order: sortOrder,
        pinned_by: gate.admin.userId,
      })

      if (error) {
        return { ok: false, error: "Could not add pin." }
      }
    }
  }

  revalidatePath("/")
  return { ok: true }
}

export async function removeTrendingPin(pinId: number): Promise<SaveTrendingPinsResult> {
  const gate = await assertAdminAction()
  if (!gate.ok) return gate

  const supabase = await createClient()
  const { error } = await supabase
    .from("featured_trending_players")
    .delete()
    .eq("id", pinId)

  if (error) {
    return { ok: false, error: "Could not remove pin." }
  }

  revalidatePath("/")
  return { ok: true }
}

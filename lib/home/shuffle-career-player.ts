"use server"

import {
  mapShuffleCareerPlayerRow,
  type ShuffleCareerPlayerRow,
  type ShufflePlayerCard,
} from "@/lib/home/shuffle-career-player-map"
import { createClient } from "@/lib/supabase/server"

export type FetchShuffleCareerPlayerResult =
  | { ok: true; player: ShufflePlayerCard | null }
  | { ok: false; error: string }

export async function fetchShuffleCareerPlayer(): Promise<FetchShuffleCareerPlayerResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "Sign in required" }
  }

  const { data, error } = await supabase.rpc("get_shuffle_career_player")

  if (error) {
    console.error("get_shuffle_career_player failed:", error.message)
    return { ok: false, error: "Could not load a player. Try again." }
  }

  const row = (data as ShuffleCareerPlayerRow[] | null)?.[0]
  if (!row) {
    return { ok: true, player: null }
  }

  return { ok: true, player: mapShuffleCareerPlayerRow(row) }
}

import { formatPlayerDisplayName } from "@/lib/player/display-name"
import { createClient } from "@/lib/supabase/server"

export type TrendingPinRow = {
  id: number
  playerId: number
  sortOrder: number
  displayName: string
  photoUrl: string | null
}

export async function listTrendingPins(): Promise<TrendingPinRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("featured_trending_players")
    .select(
      `
      id,
      sort_order,
      player_id,
      player:players!featured_trending_players_player_id_fkey(id, name, firstname, lastname, photo_url)
    `,
    )
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("listTrendingPins failed:", error.message)
    return []
  }

  return (data ?? [])
    .map((row) => {
      const player = row.player as {
        id: number
        name: string
        firstname: string | null
        lastname: string | null
        photo_url: string | null
      } | null
      if (!player) return null
      return {
        id: row.id,
        playerId: row.player_id,
        sortOrder: row.sort_order,
        displayName: formatPlayerDisplayName(
          player.firstname,
          player.lastname,
          player.name,
        ),
        photoUrl: player.photo_url,
      }
    })
    .filter((row): row is TrendingPinRow => row != null)
}

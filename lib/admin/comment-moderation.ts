import { createClient } from "@/lib/supabase/server"

export type AdminCommentRow = {
  id: number
  body: string
  isDeleted: boolean
  createdAt: string
  targetType: "player" | "match"
  targetId: number | null
  authorId: string
  authorName: string | null
  score: number
}

export async function listRecentCommentsForAdmin(
  limit = 40,
): Promise<AdminCommentRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      id,
      body,
      is_deleted,
      created_at,
      target_type,
      player_id,
      fixture_id,
      score,
      user_id,
      profile:profiles!comments_user_id_fkey(display_name)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("listRecentCommentsForAdmin failed:", error.message)
    return []
  }

  return (data ?? []).map((row) => {
    const profile = row.profile as { display_name: string | null } | null
    const targetType = row.target_type as "player" | "match"
    const targetId =
      targetType === "player" ? row.player_id : row.fixture_id

    return {
      id: row.id,
      body: row.body,
      isDeleted: row.is_deleted,
      createdAt: row.created_at,
      targetType,
      targetId,
      authorId: row.user_id,
      authorName: profile?.display_name ?? null,
      score: row.score,
    }
  })
}

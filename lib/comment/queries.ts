import { createClient } from "@/lib/supabase/server"
import {
  attachRepliesToComments,
  buildUserVotesMap,
  collectCommentIds,
  normalizeCommentRow,
} from "./normalize"
import { pruneDeletedComments } from "./comment-tree"
import type { CommentWithProfile } from "./types"

const PROFILE_SELECT = `
  id,
  display_name,
  avatar_url,
  favourite_club:teams!profiles_favourite_club_id_fkey(id, name, logo_url)
`

const COMMENT_WITH_PROFILE = `
  *,
  profile:profiles!comments_user_id_fkey(${PROFILE_SELECT})
`

export async function getComments(
  targetType: "player" | "match",
  targetId: number,
  userId: string | null,
): Promise<{ comments: CommentWithProfile[]; userVotes: Record<number, 1 | -1> }> {
  const supabase = await createClient()
  const targetColumn = targetType === "player" ? "player_id" : "fixture_id"

  // PostgREST cannot nest comments → comments in one select; fetch parents and replies separately.
  const { data: parentRows, error: parentsError } = await supabase
    .from("comments")
    .select(COMMENT_WITH_PROFILE)
    .eq("target_type", targetType)
    .eq(targetColumn, targetId)
    .is("parent_id", null)
    .order("score", { ascending: false })
    .limit(50)

  if (parentsError) {
    console.error("getComments failed:", parentsError.message)
    return { comments: [], userVotes: {} }
  }

  const parents = (parentRows ?? []).map((row) => normalizeCommentRow(row))
  if (parents.length === 0) {
    return { comments: [], userVotes: {} }
  }

  const parentIds = parents.map((c) => c.id)
  const { data: replyRows, error: repliesError } = await supabase
    .from("comments")
    .select(COMMENT_WITH_PROFILE)
    .in("parent_id", parentIds)
    .order("created_at", { ascending: true })

  if (repliesError) {
    console.error("getComments replies failed:", repliesError.message)
    return { comments: parents, userVotes: {} }
  }

  const comments = pruneDeletedComments(attachRepliesToComments(parents, replyRows ?? []))
  const allCommentIds = collectCommentIds(comments)

  if (!userId || allCommentIds.length === 0) {
    return { comments, userVotes: {} }
  }

  const { data: votes, error: votesError } = await supabase
    .from("comment_votes")
    .select("comment_id, value")
    .eq("user_id", userId)
    .in("comment_id", allCommentIds)

  if (votesError) {
    console.error("getComments votes failed:", votesError.message)
    return { comments, userVotes: {} }
  }

  return {
    comments,
    userVotes: buildUserVotesMap(votes ?? []),
  }
}

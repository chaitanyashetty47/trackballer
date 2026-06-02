import type { CommentWithProfile } from "./types"

type RawCommentRow = {
  id: number
  body: string
  score: number
  upvote_count: number
  downvote_count: number
  created_at: string
  is_deleted: boolean
  parent_id: number | null
  user_id: string
  player_id: number | null
  fixture_id: number | null
  target_type: string
  profile?: CommentWithProfile["profile"] | null
}

export function normalizeCommentRow(row: RawCommentRow): CommentWithProfile {
  return {
    id: row.id,
    body: row.body,
    score: row.score,
    upvote_count: row.upvote_count,
    downvote_count: row.downvote_count,
    created_at: row.created_at,
    is_deleted: row.is_deleted,
    parent_id: row.parent_id,
    user_id: row.user_id,
    player_id: row.player_id,
    fixture_id: row.fixture_id,
    target_type: row.target_type,
    profile: row.profile ?? null,
    replies: [],
  }
}

/** Attach reply rows to their parent comments, sorted oldest-first. */
export function attachRepliesToComments(
  parents: CommentWithProfile[],
  replyRows: RawCommentRow[],
): CommentWithProfile[] {
  const repliesByParent = new Map<number, CommentWithProfile[]>()

  for (const row of replyRows) {
    if (row.parent_id == null) continue
    const normalized = normalizeCommentRow(row)
    const bucket = repliesByParent.get(row.parent_id) ?? []
    bucket.push(normalized)
    repliesByParent.set(row.parent_id, bucket)
  }

  return parents.map((parent) => ({
    ...parent,
    replies: (repliesByParent.get(parent.id) ?? []).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    ),
  }))
}

export function collectCommentIds(comments: CommentWithProfile[]): number[] {
  const ids: number[] = []
  for (const comment of comments) {
    ids.push(comment.id)
    for (const reply of comment.replies) {
      ids.push(reply.id)
    }
  }
  return ids
}

export function buildUserVotesMap(
  voteRows: { comment_id: number; value: number }[],
): Record<number, 1 | -1> {
  const map: Record<number, 1 | -1> = {}
  for (const row of voteRows) {
    map[row.comment_id] = row.value === 1 ? 1 : -1
  }
  return map
}

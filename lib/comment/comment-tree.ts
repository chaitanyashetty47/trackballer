import type { CommentDisplay } from "./types"
import type { VoteTransition } from "./optimistic-vote"

function patchComment(
  comment: CommentDisplay,
  commentId: number,
  patch: (node: CommentDisplay) => CommentDisplay,
): CommentDisplay {
  if (comment.id === commentId) {
    return patch(comment)
  }

  if (comment.replies.length === 0) {
    return comment
  }

  return {
    ...comment,
    replies: comment.replies.map((reply) => patchComment(reply, commentId, patch)),
  }
}

export function updateVoteInTree(
  comments: CommentDisplay[],
  commentId: number,
  transition: VoteTransition,
): CommentDisplay[] {
  return comments.map((comment) =>
    patchComment(comment, commentId, (node) => ({
      ...node,
      score: node.score + transition.scoreDelta,
      upvote_count: Math.max(0, node.upvote_count + transition.upvoteDelta),
      downvote_count: Math.max(0, node.downvote_count + transition.downvoteDelta),
    })),
  )
}

export function softDeleteInTree(
  comments: CommentDisplay[],
  commentId: number,
): CommentDisplay[] {
  return comments.map((comment) =>
    patchComment(comment, commentId, (node) => ({
      ...node,
      is_deleted: true,
      body: node.body,
    })),
  )
}

/**
 * Remove a comment from the list, or leave a [deleted] stub when replies remain
 * (keeps thread structure per product spec).
 */
export function deleteCommentInTree(
  comments: CommentDisplay[],
  commentId: number,
): CommentDisplay[] {
  const next = comments.map((comment) => {
    if (comment.id === commentId) {
      const visibleReplies = comment.replies.filter((reply) => !reply.is_deleted)
      if (visibleReplies.length === 0) {
        return null
      }
      return { ...comment, is_deleted: true, replies: visibleReplies }
    }

    const replyIdx = comment.replies.findIndex((reply) => reply.id === commentId)
    if (replyIdx < 0) {
      return comment
    }

    const replies = comment.replies.filter((reply) => reply.id !== commentId)
    return { ...comment, replies }
  })

  return next.filter((comment): comment is CommentDisplay => comment != null)
}

/** Hide deleted comments unless they still anchor visible replies. */
export function pruneDeletedComments(comments: CommentDisplay[]): CommentDisplay[] {
  return comments
    .map((comment) => ({
      ...comment,
      replies: comment.replies.filter((reply) => !reply.is_deleted),
    }))
    .filter((comment) => !comment.is_deleted || comment.replies.length > 0)
}

export function removeCommentById(
  comments: CommentDisplay[],
  commentId: number,
): CommentDisplay[] {
  return comments
    .filter((comment) => comment.id !== commentId)
    .map((comment) => ({
      ...comment,
      replies: comment.replies.filter((reply) => reply.id !== commentId),
    }))
}

export function commentExistsInTree(
  comments: CommentDisplay[],
  commentId: number,
): boolean {
  for (const comment of comments) {
    if (comment.id === commentId) return true
    if (comment.replies.some((reply) => reply.id === commentId)) return true
  }
  return false
}

export function collectPendingComments(comments: CommentDisplay[]): CommentDisplay[] {
  const pending: CommentDisplay[] = []
  for (const comment of comments) {
    if (comment.isPending || comment.id < 0) pending.push(comment)
    for (const reply of comment.replies) {
      if (reply.isPending || reply.id < 0) pending.push(reply)
    }
  }
  return pending
}

function commentsMatchPending(pending: CommentDisplay, saved: CommentDisplay): boolean {
  return (
    !saved.isPending &&
    pending.user_id === saved.user_id &&
    pending.body === saved.body &&
    pending.parent_id === saved.parent_id
  )
}

function findMatchingSavedComment(
  comments: CommentDisplay[],
  pending: CommentDisplay,
): CommentDisplay | null {
  for (const comment of comments) {
    if (commentsMatchPending(pending, comment)) return comment
    for (const reply of comment.replies) {
      if (commentsMatchPending(pending, reply)) return reply
    }
  }
  return null
}

/** Keep in-flight pending rows when server props refresh mid-post. */
export function mergeServerWithPendingComments(
  serverComments: CommentDisplay[],
  localComments: CommentDisplay[],
): CommentDisplay[] {
  const pending = collectPendingComments(localComments)
  let merged = serverComments

  for (const row of pending) {
    if (findMatchingSavedComment(merged, row)) continue
    if (!commentExistsInTree(merged, row.id)) {
      merged = addCommentToTree(merged, row)
    }
  }

  return merged
}

/** Swap a temp row for the saved comment without duplicating after revalidation. */
export function settlePendingComment(
  comments: CommentDisplay[],
  tempId: number,
  real: CommentDisplay,
): CommentDisplay[] {
  const withoutTemp = removeCommentById(comments, tempId)
  if (commentExistsInTree(withoutTemp, real.id)) {
    return withoutTemp
  }
  if (findMatchingSavedComment(withoutTemp, { ...real, isPending: true, id: tempId })) {
    return withoutTemp
  }
  return addCommentToTree(withoutTemp, real)
}

export function replaceCommentInTree(
  comments: CommentDisplay[],
  tempId: number,
  real: CommentDisplay,
): CommentDisplay[] {
  return settlePendingComment(comments, tempId, real)
}

export function addCommentToTree(
  comments: CommentDisplay[],
  comment: CommentDisplay,
): CommentDisplay[] {
  if (comment.parent_id == null) {
    return [comment, ...comments]
  }

  return comments.map((parent) => {
    if (parent.id !== comment.parent_id) {
      return parent
    }
    return {
      ...parent,
      replies: [...parent.replies, comment].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    }
  })
}

export function sortComments(
  comments: CommentDisplay[],
  sort: "top" | "new",
): CommentDisplay[] {
  const sorted = [...comments]
  if (sort === "top") {
    return sorted.sort((a, b) => b.score - a.score)
  }
  return sorted.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}

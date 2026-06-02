export type UserVote = 1 | -1 | null

export type VoteTransition = {
  nextVote: UserVote
  scoreDelta: number
  upvoteDelta: number
  downvoteDelta: number
}

/** Mirrors server toggle: same vote removes, opposite vote flips, none adds. */
export function computeVoteTransition(
  currentVote: UserVote,
  clicked: 1 | -1,
): VoteTransition {
  if (currentVote === clicked) {
    return {
      nextVote: null,
      scoreDelta: clicked === 1 ? -1 : 1,
      upvoteDelta: clicked === 1 ? -1 : 0,
      downvoteDelta: clicked === -1 ? -1 : 0,
    }
  }

  if (currentVote === null) {
    return {
      nextVote: clicked,
      scoreDelta: clicked,
      upvoteDelta: clicked === 1 ? 1 : 0,
      downvoteDelta: clicked === -1 ? 1 : 0,
    }
  }

  return {
    nextVote: clicked,
    scoreDelta: clicked === 1 ? 2 : -2,
    upvoteDelta: clicked === 1 ? 1 : -1,
    downvoteDelta: clicked === -1 ? 1 : -1,
  }
}

export function applyUserVoteToMap(
  map: Record<number, 1 | -1>,
  commentId: number,
  nextVote: UserVote,
): Record<number, 1 | -1> {
  const next = { ...map }
  if (nextVote === null) {
    delete next[commentId]
  } else {
    next[commentId] = nextVote
  }
  return next
}

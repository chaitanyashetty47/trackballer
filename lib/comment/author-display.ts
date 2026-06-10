type CommentAuthorDisplayInput = {
  currentUserId: string | null
  authorUserId: string
  username?: string | null
  displayName?: string | null
}

export type CommentAuthorDisplay = {
  label: string
  href: string | null
}

/** Own comments read as "You" and link to the signed-in profile hub. */
export function getCommentAuthorDisplay({
  currentUserId,
  authorUserId,
  username,
  displayName,
}: CommentAuthorDisplayInput): CommentAuthorDisplay {
  if (currentUserId && currentUserId === authorUserId) {
    return { label: "You", href: "/profile" }
  }

  const handle = username ?? displayName ?? "user"
  return {
    label: `@${handle}`,
    href: username ? `/u/${username}` : null,
  }
}

import Link from "next/link"

import { CommentAuthorAvatar } from "@/components/comment/comment-author-avatar"
import { getCommentAuthorDisplay } from "@/lib/comment/author-display"
import { cn } from "@/lib/utils"

type CommentAuthorLinkProps = {
  currentUserId: string | null
  authorUserId: string
  username?: string | null
  displayName?: string | null
  avatarUrl?: string | null
  className?: string
}

export function CommentAuthorLink({
  currentUserId,
  authorUserId,
  username,
  displayName,
  avatarUrl,
  className,
}: CommentAuthorLinkProps) {
  const { label, href } = getCommentAuthorDisplay({
    currentUserId,
    authorUserId,
    username,
    displayName,
  })
  const avatarName = displayName ?? username ?? "Fan"

  const labelClass = cn("font-medium text-foreground", href && "hover:underline")

  if (href) {
    return (
      <Link
        href={href}
        className={cn("inline-flex items-center gap-1.5", className)}
      >
        <CommentAuthorAvatar avatarUrl={avatarUrl} name={avatarName} />
        <span className={labelClass}>{label}</span>
      </Link>
    )
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <CommentAuthorAvatar avatarUrl={avatarUrl} name={avatarName} />
      <span className={labelClass}>{label}</span>
    </span>
  )
}

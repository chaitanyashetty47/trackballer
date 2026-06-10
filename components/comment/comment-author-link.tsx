import Link from "next/link"

import { getCommentAuthorDisplay } from "@/lib/comment/author-display"
import { cn } from "@/lib/utils"

type CommentAuthorLinkProps = {
  currentUserId: string | null
  authorUserId: string
  username?: string | null
  displayName?: string | null
  className?: string
}

export function CommentAuthorLink({
  currentUserId,
  authorUserId,
  username,
  displayName,
  className,
}: CommentAuthorLinkProps) {
  const { label, href } = getCommentAuthorDisplay({
    currentUserId,
    authorUserId,
    username,
    displayName,
  })

  if (href) {
    return (
      <Link
        href={href}
        className={cn("font-medium text-foreground hover:underline", className)}
      >
        {label}
      </Link>
    )
  }

  return (
    <span className={cn("font-medium text-foreground", className)}>{label}</span>
  )
}

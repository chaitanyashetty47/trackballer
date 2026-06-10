import { cn } from "@/lib/utils"

type CommentAuthorAvatarProps = {
  avatarUrl?: string | null
  name: string
  className?: string
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase()
}

export function CommentAuthorAvatar({
  avatarUrl,
  name,
  className,
}: CommentAuthorAvatarProps) {
  if (avatarUrl) {
    return (
      // OAuth avatar hosts vary — plain img like top nav
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        className={cn(
          "size-5 shrink-0 rounded-full border border-border bg-muted object-cover",
          className,
        )}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-[9px] font-semibold text-muted-foreground",
        className,
      )}
    >
      {initialsFromName(name)}
    </span>
  )
}

import Image from "next/image"

import type { Team } from "@/lib/comment/types"
import { cn } from "@/lib/utils"

type CommentFavouriteCrestsProps = {
  club: Team | null | undefined
  nationalTeam: Team | null | undefined
  size?: "sm" | "md"
  className?: string
}

const sizeClass = {
  sm: "size-3.5",
  md: "size-4",
} as const

const pixelSize = {
  sm: 14,
  md: 16,
} as const

export function CommentFavouriteCrests({
  club,
  nationalTeam,
  size = "md",
  className,
}: CommentFavouriteCrestsProps) {
  const crests = [club, nationalTeam].filter(
    (team): team is Team => Boolean(team?.logo_url),
  )

  if (crests.length === 0) return null

  const dim = pixelSize[size]

  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1", className)}>
      {crests.map((team) => (
        <Image
          key={team.id}
          src={team.logo_url!}
          alt={team.name}
          width={dim}
          height={dim}
          className={cn(sizeClass[size], "object-contain")}
          unoptimized
        />
      ))}
    </span>
  )
}

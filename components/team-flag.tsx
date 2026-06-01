import Image from "next/image"

import type { TeamSummary } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"

type TeamFlagProps = {
  team: Pick<TeamSummary, "name" | "logo_url" | "code">
  size?: "sm" | "md"
  className?: string
}

const sizePx = { sm: 20, md: 24 } as const

const sizeClass = { sm: "size-5 text-[8px]", md: "size-6 text-[9px]" } as const

export function TeamFlag({ team, size = "md", className }: TeamFlagProps) {
  const px = sizePx[size]
  const fallback = team.code?.slice(0, 3).toUpperCase() ?? team.name.slice(0, 2).toUpperCase()

  if (team.logo_url) {
    return (
      <Image
        src={team.logo_url}
        alt=""
        width={px}
        height={px}
        className={cn(
          "shrink-0 rounded-full bg-transparent object-cover",
          sizeClass[size],
          className,
        )}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted font-mono font-semibold uppercase text-muted-foreground",
        sizeClass[size],
        className,
      )}
    >
      {fallback}
    </span>
  )
}

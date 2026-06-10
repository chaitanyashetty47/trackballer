import type { ReactNode } from "react"

import { matchRowGridClass } from "@/components/match-row"
import { cn } from "@/lib/utils"

type MatchRowListProps = {
  children: ReactNode
  className?: string
}

/** Shared column tracks so flags and names line up across every row. */
export function MatchRowList({ children, className }: MatchRowListProps) {
  return <div className={cn(matchRowGridClass, className)}>{children}</div>
}

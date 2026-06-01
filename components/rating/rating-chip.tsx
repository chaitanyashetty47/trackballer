import { formatMatchAggregate } from "@/lib/rating/engine"
import { cn } from "@/lib/utils"

type RatingChipProps = {
  value: number | null | undefined
  size?: "sm" | "md"
  className?: string
}

const sizeClass = {
  sm: "min-w-[2rem] px-1.5 py-0.5 text-[11px]",
  md: "min-w-[2.25rem] px-2 py-1 text-xs",
} as const

/** Neutral match-pitch chip — community average, not tier colour. */
export function RatingChip({ value, size = "sm", className }: RatingChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-border bg-card font-mono font-semibold tabular-nums text-foreground",
        sizeClass[size],
        className,
      )}
    >
      {formatMatchAggregate(value)}
    </span>
  )
}

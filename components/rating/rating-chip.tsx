import { formatMatchAggregate } from "@/lib/rating/engine"
import { matchRatingTierChipClass } from "@/lib/rating/match-rating-tier"
import { cn } from "@/lib/utils"

type RatingChipProps = {
  value: number | null | undefined
  size?: "sm" | "md"
  /** Neutral card style, or FotMob-style colour by score band. */
  variant?: "neutral" | "performance"
  className?: string
}

const sizeClass = {
  sm: "min-w-[2rem] px-1.5 py-0.5 text-[11px]",
  md: "min-w-[2.25rem] px-2 py-1 text-xs",
} as const

export function RatingChip({
  value,
  size = "sm",
  variant = "performance",
  className,
}: RatingChipProps) {
  const colorClass =
    variant === "performance"
      ? matchRatingTierChipClass(value)
      : "border-border bg-card text-foreground"

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border font-mono font-semibold tabular-nums shadow-sm",
        sizeClass[size],
        colorClass,
        className,
      )}
    >
      {formatMatchAggregate(value)}
    </span>
  )
}

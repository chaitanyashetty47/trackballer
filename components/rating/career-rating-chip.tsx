import { careerRingCssVar, formatCareerScore } from "@/lib/rating/career-tier"
import { cn } from "@/lib/utils"

type CareerRatingChipProps = {
  score: number
  tier: string | null
  size?: "sm" | "md"
  className?: string
}

const sizeClass = {
  sm: "min-w-[2rem] px-1.5 py-0.5 text-[11px]",
  md: "min-w-[2.25rem] px-2 py-1 text-xs",
} as const

export function CareerRatingChip({
  score,
  tier,
  size = "sm",
  className,
}: CareerRatingChipProps) {
  const ringVar = careerRingCssVar(tier, score)

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border font-mono font-semibold tabular-nums text-white shadow-sm",
        sizeClass[size],
        className,
      )}
      style={{
        backgroundColor: `var(${ringVar})`,
        borderColor: `color-mix(in oklch, var(${ringVar}) 75%, black)`,
      }}
    >
      {formatCareerScore(score)}
    </span>
  )
}

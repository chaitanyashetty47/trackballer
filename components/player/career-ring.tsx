import { PlayerAvatar } from "@/components/player-avatar"
import { careerRingCssVar, formatCareerScore } from "@/lib/rating/career-tier"
import { cn } from "@/lib/utils"

type CareerRingProps = {
  name: string
  photoUrl: string | null
  tier: string
  displayScore: number
  className?: string
  /** Compact size for horizontal profile header. */
  compact?: boolean
}

export function CareerRing({
  name,
  photoUrl,
  tier,
  displayScore,
  className,
  compact = false,
}: CareerRingProps) {
  const ringVar = careerRingCssVar(tier, displayScore)
  const scoreLabel = formatCareerScore(displayScore)

  return (
    <div className={cn("inline-flex flex-col items-center", className)}>
      <div
        className={cn(
          "relative isolate flex items-center justify-center",
          compact ? "size-[4.5rem]" : "size-[7.5rem]",
        )}
        style={{ ["--career-ring-color" as string]: `var(${ringVar})` }}
      >
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full border-[var(--career-ring-color)]",
            compact ? "border-[3px]" : "border-[5px]",
          )}
        />
        <PlayerAvatar
          name={name}
          photoUrl={photoUrl}
          size={compact ? "lg" : "xl"}
          className={cn(
            "relative rounded-full object-cover",
            compact
              ? "size-[calc(100%-6px)] border-0 shadow-none"
              : "border-2 border-background shadow-sm",
          )}
        />
        <span
          className={cn(
            "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-sm font-mono font-bold leading-none tabular-nums text-white shadow-sm",
            compact
              ? "min-w-[1.35rem] px-1 py-0.5 text-[10px]"
              : "min-w-[1.75rem] px-1.5 py-0.5 text-xs",
          )}
          style={{ backgroundColor: `var(${ringVar})` }}
          aria-label={`Career rating ${scoreLabel}`}
        >
          {scoreLabel}
        </span>
      </div>
    </div>
  )
}

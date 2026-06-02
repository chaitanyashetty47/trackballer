import { PlayerAvatar } from "@/components/player-avatar"
import { careerTierCssVar } from "@/lib/rating/career-tier"
import { cn } from "@/lib/utils"

type CareerRingProps = {
  name: string
  photoUrl: string | null
  tier: string
  className?: string
  /** Compact size for horizontal profile header. */
  compact?: boolean
}

export function CareerRing({ name, photoUrl, tier, className, compact = false }: CareerRingProps) {
  const ringVar = careerTierCssVar(tier)

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        compact ? "size-[4.5rem]" : "size-[7.5rem]",
        className,
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
          "relative z-10 rounded-full object-cover",
          compact
            ? "size-[calc(100%-6px)] border-0 shadow-none"
            : "border-2 border-background shadow-sm",
        )}
      />
    </div>
  )
}

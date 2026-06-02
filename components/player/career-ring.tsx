import { PlayerAvatar } from "@/components/player-avatar"
import { careerTierCssVar } from "@/lib/rating/career-tier"
import { cn } from "@/lib/utils"

type CareerRingProps = {
  name: string
  photoUrl: string | null
  tier: string
  className?: string
}

export function CareerRing({ name, photoUrl, tier, className }: CareerRingProps) {
  const ringVar = careerTierCssVar(tier)

  return (
    <div
      className={cn("relative flex size-[7.5rem] items-center justify-center", className)}
      style={{ ["--career-ring-color" as string]: `var(${ringVar})` }}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border-[5px] border-[var(--career-ring-color)]"
      />
      <PlayerAvatar
        name={name}
        photoUrl={photoUrl}
        size="xl"
        className="relative z-10 rounded-full border-2 border-background shadow-sm"
      />
    </div>
  )
}

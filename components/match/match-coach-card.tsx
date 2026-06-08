import { PlayerAvatar } from "@/components/player-avatar"
import type { MatchCoach } from "@/lib/match/types"
import { cn } from "@/lib/utils"

type MatchCoachCardProps = {
  coach: MatchCoach | null | undefined
  className?: string
}

export function MatchCoachCard({ coach, className }: MatchCoachCardProps) {
  if (!coach) return null

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3",
        className,
      )}
    >
      <PlayerAvatar name={coach.name} photoUrl={coach.photoUrl} size="md" className="rounded-full" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{coach.name}</p>
        <p className="text-xs font-medium text-primary">Coach</p>
      </div>
    </div>
  )
}

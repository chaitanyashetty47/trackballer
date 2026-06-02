import { PlayerAvatar } from "@/components/player-avatar"
import type { PitchSide } from "@/lib/match/lineup-position"
import type { MatchCoach } from "@/lib/match/types"

function coachForSide(coaches: MatchCoach[], side: PitchSide) {
  return coaches.find((c) => c.side === side)
}

type MatchCoachRowProps = {
  coaches: MatchCoach[]
}

/** Home: avatar + name. Away: name + avatar (mirrored). */
export function MatchCoachRow({ coaches }: MatchCoachRowProps) {
  const home = coachForSide(coaches, "home")
  const away = coachForSide(coaches, "away")
  if (!home && !away) return null

  return (
    <div className="md:grid md:grid-cols-2 md:divide-x md:divide-border">
      <div className="border-b border-border px-3 py-3 md:border-b-0">
        {home ? (
          <div className="flex min-w-0 items-center gap-2.5">
            <PlayerAvatar
              name={home.name}
              photoUrl={home.photoUrl}
              size="sm"
            />
            <span className="truncate text-sm font-semibold">{home.name}</span>
          </div>
        ) : null}
      </div>
      <div className="px-3 py-3">
        {away ? (
          <div className="flex min-w-0 items-center justify-end gap-2.5">
            <span className="truncate text-right text-sm font-semibold">
              {away.name}
            </span>
            <PlayerAvatar
              name={away.name}
              photoUrl={away.photoUrl}
              size="sm"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

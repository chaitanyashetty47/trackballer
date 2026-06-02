import type { ReactNode } from "react"

import { CareerRing } from "@/components/player/career-ring"
import { PlayerCareerRatingCta } from "@/components/player/player-career-rating-cta"
import { PlayerTierCard } from "@/components/player/player-tier-card"
import { TeamFlag } from "@/components/team-flag"
import { positionDisplayLabel } from "@/lib/match/position-label"
import type { PlayerProfile } from "@/lib/player/types"

type PlayerProfileHeroProps = {
  profile: PlayerProfile
  canRateCareer: boolean
}

function MetaSegment({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-1.5">{children}</span>
}

export function PlayerProfileHero({ profile, canRateCareer }: PlayerProfileHeroProps) {
  const positionLabel = positionDisplayLabel(profile.primaryPosition)
  const segments: ReactNode[] = []

  if (profile.age != null) {
    segments.push(
      <MetaSegment key="age">
        <span className="font-mono tabular-nums">{profile.age}</span>
      </MetaSegment>,
    )
  }
  if (positionLabel) {
    segments.push(<MetaSegment key="pos">{positionLabel}</MetaSegment>)
  }
  if (profile.clubTeam) {
    segments.push(
      <MetaSegment key="club">
        <TeamFlag team={profile.clubTeam} size="sm" />
        <span>{profile.clubTeam.name}</span>
      </MetaSegment>,
    )
  }
  if (profile.nationalTeam) {
    segments.push(
      <MetaSegment key="nt">
        <TeamFlag team={profile.nationalTeam} size="sm" />
        <span>{profile.nationalTeam.name}</span>
      </MetaSegment>,
    )
  } else if (profile.nationality) {
    segments.push(<MetaSegment key="nat">{profile.nationality}</MetaSegment>)
  }

  return (
    <section className="mb-6">
      <div className="mb-4 flex flex-col items-center gap-3 text-center">
        <CareerRing
          name={profile.name}
          photoUrl={profile.photoUrl}
          tier={profile.career.tier}
        />
        <h1 className="h-display max-w-full truncate px-2">{profile.name}</h1>
        <PlayerCareerRatingCta
          playerId={profile.id}
          playerName={profile.name}
          canRate={canRateCareer}
          initialValue={profile.userCareerRating}
        />
        {segments.length > 0 && (
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {segments.map((segment, index) => (
              <span key={index} className="inline-flex items-center gap-2">
                {index > 0 ? <span aria-hidden>·</span> : null}
                {segment}
              </span>
            ))}
          </p>
        )}
      </div>

      <PlayerTierCard career={profile.career} />
    </section>
  )
}

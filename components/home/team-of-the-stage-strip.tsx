import Link from "next/link"

import { FormationPitch } from "@/components/formation/formation-pitch"
import type { TeamOfTheStageView } from "@/lib/home/team-of-the-stage"

type TeamOfTheStageStripProps = {
  team: TeamOfTheStageView | null
  showWorldCupLink?: boolean
}

export function TeamOfTheStageStrip({
  team,
  showWorldCupLink = true,
}: TeamOfTheStageStripProps) {
  if (!team) return null

  const displayAssignments = Object.fromEntries(
    Object.entries(team.assignments).map(([slot, player]) => [
      slot,
      {
        playerId: player.playerId,
        displayName: player.displayName,
        photoUrl: player.photoUrl,
      },
    ]),
  )

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="h3">Team of the Stage</h2>
          <p className="text-xs text-muted-foreground">
            {team.title} · {team.formation}
          </p>
        </div>
        {showWorldCupLink ? (
          <Link
            href="/world-cup#totw"
            className="text-xs font-medium text-primary hover:underline"
          >
            World Cup hub
          </Link>
        ) : null}
      </div>

      <FormationPitch formation={team.formation} assignments={displayAssignments} mode="display" />
    </section>
  )
}

import { HomeWcMatches } from "@/components/home/home-wc-matches"
import { WorldCupStandingsPanel } from "@/components/world-cup/world-cup-standings-panel"
import type { FixtureWithTeams } from "@/lib/catalog/types"
import type { StandingsPayload } from "@/lib/catalog/standings-types"

type HomeWcSidebarProps = {
  recentFixtures: FixtureWithTeams[]
  upcomingFixtures: FixtureWithTeams[]
  standings: StandingsPayload | null
}

/** Home right column — recent results, next kickoffs, then standings. */
export function HomeWcSidebar({
  recentFixtures,
  upcomingFixtures,
  standings,
}: HomeWcSidebarProps) {
  return (
    <aside className="space-y-8 lg:sticky lg:top-20">
      <HomeWcMatches
        recentFixtures={recentFixtures}
        upcomingFixtures={upcomingFixtures}
      />
      <WorldCupStandingsPanel data={standings} />
    </aside>
  )
}

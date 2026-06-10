import { CareerShuffleStrip } from "@/components/home/career-shuffle-strip"
import { CompetitionStrip } from "@/components/home/competition-strip"
import { HomeWcMatches } from "@/components/home/home-wc-matches"
import { HomeWcSidebar } from "@/components/home/home-wc-sidebar"
import { TeamOfTheStageStrip } from "@/components/home/team-of-the-stage-strip"
import { TrendingComments } from "@/components/home/trending-comments"
import { TrendingPlayers } from "@/components/home/trending-players"
import { YourTeamToday } from "@/components/home/your-team-today"
import { getCatalogLeagueId, getCatalogSeasonYear } from "@/lib/catalog/config"
import {
  getRecentLiveAndResults,
  getUpcomingFixtures,
  getWorldCupSeason,
} from "@/lib/catalog/fixtures"
import { getStandingsPayload } from "@/lib/catalog/standings-fetch"
import { getCompetitionStrip } from "@/lib/home/leagues"
import { getTrendingComments } from "@/lib/home/trending-comments"
import { getPublishedTeamOfTheStage } from "@/lib/home/team-of-the-stage"
import { getTrendingPlayers } from "@/lib/home/trending-players"
import { getYourTeamToday } from "@/lib/home/your-team-today"
import { getServerAuth } from "@/lib/auth/server-session"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()
  const auth = await getServerAuth(supabase)

  const [strip, season, trendingPlayers, trendingComments, yourTeamToday, totw] =
    await Promise.all([
      getCompetitionStrip(),
      getWorldCupSeason(),
      getTrendingPlayers(),
      getTrendingComments(),
      getYourTeamToday(auth?.userId ?? null),
      getPublishedTeamOfTheStage(),
    ])

  const [recentMatches, upcomingMatches, standings] = season
    ? await Promise.all([
        getRecentLiveAndResults(season.id, { limit: 3 }),
        getUpcomingFixtures(season.id, { limit: 3 }),
        getStandingsPayload(getCatalogLeagueId(), getCatalogSeasonYear()),
      ])
    : [[], [], null]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <CompetitionStrip strip={strip} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <YourTeamToday items={yourTeamToday} />
          <TrendingPlayers players={trendingPlayers} />

          <div className="lg:hidden">
            <HomeWcMatches
              recentFixtures={recentMatches}
              upcomingFixtures={upcomingMatches}
            />
          </div>

          <TrendingComments
            comments={trendingComments}
            currentUserId={auth?.userId ?? null}
          />
          <CareerShuffleStrip isLoggedIn={!!auth} />
          <TeamOfTheStageStrip team={totw} />
        </div>

        <div className="hidden lg:col-span-4 lg:block">
          <HomeWcSidebar
            recentFixtures={recentMatches}
            upcomingFixtures={upcomingMatches}
            standings={standings}
          />
        </div>
      </div>
    </div>
  )
}

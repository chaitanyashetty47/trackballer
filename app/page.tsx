import { CareerShuffleStrip } from "@/components/home/career-shuffle-strip"
import { CompetitionStrip } from "@/components/home/competition-strip"
import { LatestMatches } from "@/components/home/latest-matches"
import { TeamOfTheStageStrip } from "@/components/home/team-of-the-stage-strip"
import { TrendingComments } from "@/components/home/trending-comments"
import { TrendingPlayers } from "@/components/home/trending-players"
import { YourTeamToday } from "@/components/home/your-team-today"
import { getLatestResults, getWorldCupSeason } from "@/lib/catalog/fixtures"
import { getCompetitionStrip } from "@/lib/home/leagues"
import { getTrendingComments } from "@/lib/home/trending-comments"
import { getPublishedTeamOfTheStage } from "@/lib/home/team-of-the-stage"
import { getTrendingPlayers } from "@/lib/home/trending-players"
import { getYourTeamToday } from "@/lib/home/your-team-today"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [strip, season, trendingPlayers, trendingComments, yourTeamToday, totw] =
    await Promise.all([
      getCompetitionStrip(),
      getWorldCupSeason(),
      getTrendingPlayers(),
      getTrendingComments(),
      getYourTeamToday(user?.id ?? null),
      getPublishedTeamOfTheStage(),
    ])

  const latestMatches = season
    ? await getLatestResults(season.id, { limit: 8 })
    : []

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <CompetitionStrip strip={strip} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <YourTeamToday items={yourTeamToday} />
          <TrendingPlayers players={trendingPlayers} />

          <div className="lg:hidden">
            <LatestMatches fixtures={latestMatches} />
          </div>

          <TrendingComments comments={trendingComments} />
          <CareerShuffleStrip isLoggedIn={!!user} />
          <TeamOfTheStageStrip team={totw} />
        </div>

        <aside className="hidden lg:col-span-4 lg:block">
          <LatestMatches fixtures={latestMatches} />
        </aside>
      </div>
    </div>
  )
}

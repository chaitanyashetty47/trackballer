import Link from "next/link"
import { notFound } from "next/navigation"

import { CommentThread } from "@/components/comment/comment-thread"
import { PlayerProfileHero } from "@/components/player/player-profile-hero"
import { PlayerRecentMatches } from "@/components/player/player-recent-matches"
import { getComments } from "@/lib/comment/queries"
import { getPlayerProfile } from "@/lib/player/detail"
import { getServerAuth } from "@/lib/auth/server-session"
import { createClient } from "@/lib/supabase/server"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function PlayerPage({ params }: PageProps) {
  const { id } = await params
  const playerId = Number(id)

  if (!Number.isFinite(playerId) || playerId <= 0) {
    notFound()
  }

  const supabase = await createClient()
  const auth = await getServerAuth(supabase)
  const profile = await getPlayerProfile(playerId, auth?.userId ?? null)
  if (!profile) {
    notFound()
  }

  const { comments, userVotes } = await getComments("player", playerId, auth?.userId ?? null)

  return (
    <div className="w-full py-8">
      <p className="eyebrow mb-3 px-4 lg:ml-[5%] lg:px-0">Player</p>

      <div className="px-4 lg:ml-[5%] lg:w-[55%] lg:px-0">
        <PlayerProfileHero profile={profile} canRateCareer={Boolean(auth)} />
      </div>

      <div className="mt-6 px-4 lg:ml-[5%] lg:w-[55%] lg:px-0">
        <PlayerRecentMatches profile={profile} />
      </div>

      <div className="mt-6 px-4 lg:ml-[5%] lg:w-[55%] lg:px-0">
        <CommentThread
          initialComments={comments}
          initialUserVotes={userVotes}
          targetType="player"
          targetId={playerId}
          isLoggedIn={Boolean(auth)}
          currentUserId={auth?.userId ?? null}
        />
      </div>

      <p className="body-sm mt-6 px-4 text-left lg:ml-[5%] lg:px-0">
        <Link href="/world-cup" className="text-primary underline-offset-4 hover:underline">
          Back to World Cup
        </Link>
      </p>
    </div>
  )
}

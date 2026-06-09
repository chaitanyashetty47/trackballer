import { notFound } from "next/navigation"

import { MatchView } from "@/components/match/match-view"
import { getMatchDetail } from "@/lib/match/detail"
import { getComments } from "@/lib/comment/queries"
import { getServerAuth } from "@/lib/auth/server-session"
import { createClient } from "@/lib/supabase/server"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function MatchPage({ params }: PageProps) {
  const { id } = await params
  const fixtureId = Number(id)

  if (!Number.isFinite(fixtureId) || fixtureId <= 0) {
    notFound()
  }

  const detail = await getMatchDetail(fixtureId)
  if (!detail) {
    notFound()
  }

  const supabase = await createClient()
  const auth = await getServerAuth(supabase)

  const { comments, userVotes } = await getComments("match", fixtureId, auth?.userId ?? null)

  return (
    <MatchView
      detail={detail}
      isLoggedIn={auth != null}
      comments={comments}
      userVotes={userVotes}
      currentUserId={auth?.userId ?? null}
    />
  )
}

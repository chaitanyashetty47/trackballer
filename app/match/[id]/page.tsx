import { notFound } from "next/navigation"

import { MatchView } from "@/components/match/match-view"
import { getMatchDetail } from "@/lib/match/detail"
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
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <MatchView detail={detail} isLoggedIn={user != null} />
}

import Link from "next/link"
import { notFound } from "next/navigation"

import { PlayerProfileHero } from "@/components/player/player-profile-hero"
import { getPlayerProfile } from "@/lib/player/detail"
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
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const profile = await getPlayerProfile(playerId, user?.id ?? null)
  if (!profile) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <p className="eyebrow mb-2">Player</p>

      <PlayerProfileHero profile={profile} canRateCareer={Boolean(user)} />

      <p className="body-sm text-center">
        <Link href="/world-cup" className="text-primary underline-offset-4 hover:underline">
          Back to World Cup
        </Link>
      </p>
    </div>
  )
}

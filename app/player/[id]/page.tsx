import Link from "next/link"
import { notFound } from "next/navigation"

import { PlayerProfileHero } from "@/components/player/player-profile-hero"
import { getPlayerProfile } from "@/lib/player/detail"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function PlayerPage({ params }: PageProps) {
  const { id } = await params
  const playerId = Number(id)

  if (!Number.isFinite(playerId) || playerId <= 0) {
    notFound()
  }

  const profile = await getPlayerProfile(playerId)
  if (!profile) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <p className="eyebrow mb-2">Player</p>

      <PlayerProfileHero profile={profile} />

      <p className="body-sm text-center">
        <Link href="/world-cup" className="text-primary underline-offset-4 hover:underline">
          Back to World Cup
        </Link>
      </p>
    </div>
  )
}

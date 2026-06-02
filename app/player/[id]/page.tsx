import Link from "next/link"
import { notFound } from "next/navigation"

import { PlayerAvatar } from "@/components/player-avatar"
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
  const { data: player } = await supabase
    .from("players")
    .select("id, name, photo_url, primary_position, age")
    .eq("id", playerId)
    .maybeSingle()

  if (!player) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <p className="eyebrow mb-2">Player</p>

      <div className="mb-6 flex flex-col items-center text-center">
        <PlayerAvatar
          name={player.name}
          photoUrl={player.photo_url}
          size="lg"
          className="mb-3 rounded-full"
        />
        <h1 className="h-display">{player.name}</h1>
        {player.primary_position && (
          <p className="mt-1 text-sm text-muted-foreground">{player.primary_position}</p>
        )}
        {player.age != null && (
          <p className="text-sm text-muted-foreground">Age {player.age}</p>
        )}
      </div>

      <p className="body-sm mb-6 text-center text-muted-foreground">
        Full career profile, match history, and career ratings are coming in a later build slice.
      </p>

      <p className="body-sm text-center">
        <Link href="/world-cup" className="text-primary underline-offset-4 hover:underline">
          Back to World Cup
        </Link>
      </p>
    </div>
  )
}

import { notFound, redirect } from "next/navigation"

import { LeagueComingSoon } from "@/components/league/league-coming-soon"
import { getLeagueBySlug } from "@/lib/league/detail"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function LeaguePage({ params }: PageProps) {
  const { slug } = await params
  const league = await getLeagueBySlug(slug)

  if (!league) {
    notFound()
  }

  if (league.slug === "world-cup") {
    redirect("/world-cup")
  }

  if (!league.isActive) {
    return <LeagueComingSoon league={league} />
  }

  redirect("/world-cup")
}

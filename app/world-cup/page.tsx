import Link from "next/link"

import { MatchRow } from "@/components/match-row"
import {
  getLatestResults,
  getUpcomingFixtures,
  getWorldCupCatalogContext,
} from "@/lib/catalog/fixtures"

type PageProps = {
  searchParams: Promise<{ round?: string }>
}

export default async function WorldCupPage({ searchParams }: PageProps) {
  const { round: roundFilter } = await searchParams
  const { season, rounds, fixtureCount } = await getWorldCupCatalogContext()

  const roundName =
    roundFilter && roundFilter.length > 0 ? decodeURIComponent(roundFilter) : undefined

  const [upcoming, results] = season
    ? await Promise.all([
        getUpcomingFixtures(season.id, { roundName, limit: 8 }),
        getLatestResults(season.id, { roundName, limit: 8 }),
      ])
    : [[], []]

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="eyebrow mb-2">FIFA World Cup</p>
      <h1 className="h-display mb-2">World Cup 2026</h1>
      <p className="body-sm mb-6 text-muted-foreground">
        {season
          ? `Season ${season.year} catalog${roundName ? ` · ${roundName}` : ""}`
          : "Season not found in database."}
      </p>

      <section className="mb-6 rounded-lg border border-border bg-card p-4">
        <h2 className="h3 mb-2">Tournament data</h2>
        <p className="body-sm text-muted-foreground">
          {fixtureCount === null
            ? "Could not load fixtures."
            : `${fixtureCount} fixtures · ${rounds.length} rounds · ${upcoming.length} upcoming · ${results.length} results shown`}
        </p>
        {rounds.length > 0 && (
          <ul className="caption mt-2 list-inside list-disc">
            {rounds.slice(0, 4).map((r) => (
              <li key={r.id}>{r.name}</li>
            ))}
            {rounds.length > 4 && <li>…and {rounds.length - 4} more</li>}
          </ul>
        )}
      </section>

      {results.length > 0 && (
        <section className="mb-6">
          <h2 className="h3 mb-2">Latest results</h2>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            {results.map((f) => (
              <MatchRow key={f.id} fixture={f} showContext />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-6">
          <h2 className="h3 mb-2">Upcoming</h2>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            {upcoming.map((f) => (
              <MatchRow key={f.id} fixture={f} showContext />
            ))}
          </div>
        </section>
      )}

      <p className="body-sm">
        <Link href="/" className="text-primary underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  )
}

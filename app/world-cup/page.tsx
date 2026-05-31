import Link from "next/link"

import { getFixtureCount } from "@/lib/supabase/catalog-read"

export default async function WorldCupPage() {
  const fixtureCount = await getFixtureCount()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="eyebrow mb-2">FIFA World Cup</p>
      <h1 className="h-display mb-2">World Cup 2026</h1>
      <p className="body-sm mb-8 text-muted-foreground">
        Group stage, results, and standings from your synced catalog.
      </p>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="h3 mb-1">Catalog status</h2>
        <p className="body-sm text-muted-foreground">
          {fixtureCount === null
            ? "Could not load fixtures. Check Supabase env vars in .env."
            : `${fixtureCount} fixtures in database (dev season).`}
        </p>
        <p className="caption mt-3">
          Upcoming fixtures, results, and round filters land in the next issues.
        </p>
      </section>

      <p className="body-sm mt-6">
        <Link href="/" className="text-primary underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  )
}

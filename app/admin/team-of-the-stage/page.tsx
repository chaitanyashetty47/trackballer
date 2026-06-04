import { AdminShell } from "@/components/admin/admin-shell"
import { TotwEditor } from "@/components/admin/totw-editor"
import {
  getAdminTeamsByRound,
  getFeaturedTotwId,
} from "@/lib/admin/totw-queries"
import { getRounds, getWorldCupSeason } from "@/lib/catalog/fixtures"

export default async function AdminTeamOfTheStagePage() {
  const season = await getWorldCupSeason()
  const rounds = season ? await getRounds(season.id) : []
  const [publishedDrafts, featuredTotwId] = season
    ? await Promise.all([
        getAdminTeamsByRound(season.id),
        getFeaturedTotwId(season.id),
      ])
    : [[], null]

  if (!season) {
    return (
      <AdminShell>
        <p className="text-sm text-muted-foreground">
          World Cup season not found. Run catalog bootstrap first.
        </p>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <TotwEditor
        seasonId={season.id}
        seasonLabel={`World Cup ${season.year}`}
        rounds={rounds.map((r) => ({ id: r.id, name: r.name }))}
        publishedDrafts={publishedDrafts}
        featuredTotwId={featuredTotwId}
      />
    </AdminShell>
  )
}

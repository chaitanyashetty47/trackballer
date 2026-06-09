import { AdminShell } from "@/components/admin/admin-shell"
import { CatalogFixForm } from "@/components/admin/catalog-fix-form"
import { browsePositions, getBrowseFilterOptions } from "@/lib/search/filter-options"

export default async function AdminDataPage() {
  const { clubs } = await getBrowseFilterOptions()

  return (
    <AdminShell>
      <p className="body-sm mb-6 text-muted-foreground">
        Correct player names, club, position, overall rating, and photo URLs when API sync
        got them wrong. Changes write through the server secret key, not your browser
        session.
      </p>
      <CatalogFixForm clubOptions={clubs} positions={[...browsePositions]} />
    </AdminShell>
  )
}

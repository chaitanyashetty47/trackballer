import { AdminShell } from "@/components/admin/admin-shell"
import { CatalogFixForm } from "@/components/admin/catalog-fix-form"

export default function AdminDataPage() {
  return (
    <AdminShell>
      <p className="body-sm mb-6 text-muted-foreground">
        Correct player names, overall rating, and photo URLs when API sync got them wrong.
        Changes write through the server secret key, not your browser session.
      </p>
      <CatalogFixForm />
    </AdminShell>
  )
}

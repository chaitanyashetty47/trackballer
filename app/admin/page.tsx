import { AdminHub } from "@/components/admin/admin-hub"
import { AdminShell } from "@/components/admin/admin-shell"

export default function AdminPage() {
  return (
    <AdminShell>
      <p className="body-sm mb-6 text-muted-foreground">
        Editorial tools for home and World Cup. Catalog sync stays under API routes with
        SYNC_ADMIN_SECRET.
      </p>
      <AdminHub />
    </AdminShell>
  )
}

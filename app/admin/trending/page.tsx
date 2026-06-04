import { AdminShell } from "@/components/admin/admin-shell"
import { TrendingPinEditor } from "@/components/admin/trending-pin-editor"
import { listTrendingPins } from "@/lib/admin/trending-pins"

export default async function AdminTrendingPage() {
  const pins = await listTrendingPins()

  return (
    <AdminShell>
      <p className="body-sm mb-6 text-muted-foreground">
        Pinned players appear first on the home page. When empty, home falls back to
        recent comment activity.
      </p>
      <TrendingPinEditor initialPins={pins} />
    </AdminShell>
  )
}

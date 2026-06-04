import { AdminShell } from "@/components/admin/admin-shell"
import { CommentModList } from "@/components/admin/comment-mod-list"
import { listRecentCommentsForAdmin } from "@/lib/admin/comment-moderation"

export default async function AdminCommentsPage() {
  const comments = await listRecentCommentsForAdmin()

  return (
    <AdminShell>
      <p className="body-sm mb-6 text-muted-foreground">
        Recent comments across player and match pages. Deleting is soft-delete. Ban
        blocks new comments.
      </p>
      <CommentModList comments={comments} />
    </AdminShell>
  )
}

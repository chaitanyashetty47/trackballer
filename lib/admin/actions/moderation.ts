"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { assertAdminAction } from "@/lib/admin/assert-admin-action"
import { deleteComment } from "@/lib/comment/submit-comment"
import { createAdminClient } from "@/lib/supabase/admin"

const banSchema = z.object({
  userId: z.string().uuid(),
})

export type ModerationResult = { ok: true } | { ok: false; error: string }

export async function adminDeleteComment(commentId: number): Promise<ModerationResult> {
  const gate = await assertAdminAction()
  if (!gate.ok) return gate

  const result = await deleteComment({ comment_id: commentId })
  if (!result.ok) return result

  revalidatePath("/admin/comments")
  return { ok: true }
}

export async function adminBanUser(input: unknown): Promise<ModerationResult> {
  const gate = await assertAdminAction()
  if (!gate.ok) return gate

  const parsed = banSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Invalid user." }
  }

  if (parsed.data.userId === gate.admin.userId) {
    return { ok: false, error: "You cannot ban your own account." }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from("profiles")
    .update({ is_banned: true })
    .eq("id", parsed.data.userId)

  if (error) {
    return { ok: false, error: "Could not ban user." }
  }

  revalidatePath("/admin/comments")
  return { ok: true }
}

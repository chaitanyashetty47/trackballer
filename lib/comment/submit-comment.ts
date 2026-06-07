"use server"

import { revalidatePath } from "next/cache"
import { normalizeCommentRow } from "@/lib/comment/normalize"
import { createClient } from "@/lib/supabase/server"
import {
  submitCommentSchema,
  deleteCommentSchema,
  type CommentWithProfile,
  type SubmitCommentInput,
  type DeleteCommentInput,
} from "./types"

const PROFILE_SELECT = `
  id,
  username,
  display_name,
  avatar_url,
  favourite_club:teams!profiles_favourite_club_id_fkey(id, name, logo_url)
`

export type SubmitCommentResult =
  | { ok: true; comment: CommentWithProfile }
  | { ok: false; error: string }

export async function submitComment(input: unknown): Promise<SubmitCommentResult> {
  const parsed = submitCommentSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const { body, target_type, player_id, fixture_id, parent_id } = parsed.data

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "Sign in to comment." }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_banned")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || profile.is_banned) {
    return { ok: false, error: "You cannot comment at this time." }
  }

  const commentData: any = {
    user_id: user.id,
    body,
    target_type,
    parent_id: parent_id || null,
  }

  if (target_type === "player" && player_id) {
    commentData.player_id = player_id
    commentData.fixture_id = null
  } else if (target_type === "match" && fixture_id) {
    commentData.fixture_id = fixture_id
    commentData.player_id = null
  } else {
    return { ok: false, error: "Invalid target." }
  }

  const { error, data } = await supabase
    .from("comments")
    .insert(commentData)
    .select(
      `
      *,
      profile:profiles!comments_user_id_fkey(${PROFILE_SELECT})
    `,
    )
    .single()

  if (error || !data) {
    return { ok: false, error: "Could not save comment. Try again." }
  }

  if (target_type === "player" && player_id) {
    revalidatePath(`/player/${player_id}`)
  } else if (target_type === "match" && fixture_id) {
    revalidatePath(`/match/${fixture_id}`)
  }

  return { ok: true, comment: normalizeCommentRow(data) }
}

export type DeleteCommentResult = { ok: true } | { ok: false; error: string }

export async function deleteComment(input: unknown): Promise<DeleteCommentResult> {
  const parsed = deleteCommentSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Invalid input" }
  }

  const { comment_id } = parsed.data

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "Sign in to delete comments." }
  }

  const { data: comment, error: fetchError } = await supabase
    .from("comments")
    .select("user_id, target_type, player_id, fixture_id")
    .eq("id", comment_id)
    .single()

  if (fetchError || !comment) {
    return { ok: false, error: "Comment not found." }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  const isAdmin = profile?.is_admin ?? false
  const isOwner = comment.user_id === user.id

  if (!isOwner && !isAdmin) {
    return { ok: false, error: "You cannot delete this comment." }
  }

  const { error } = await supabase
    .from("comments")
    .update({ is_deleted: true })
    .eq("id", comment_id)

  if (error) {
    return { ok: false, error: "Could not delete comment. Try again." }
  }

  const targetType = comment.target_type as "player" | "match"
  const targetId = targetType === "player" ? comment.player_id : comment.fixture_id

  if (targetId) {
    revalidatePath(`/${targetType}/${targetId}`)
  }

  return { ok: true }
}

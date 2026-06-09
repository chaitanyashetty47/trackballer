"use server"

import { requireServerAuth } from "@/lib/auth/server-session"
import { createClient } from "@/lib/supabase/server"
import { submitVoteSchema, type SubmitVoteInput } from "./types"

export type SubmitVoteResult = { ok: true } | { ok: false; error: string }

export async function submitVote(input: unknown): Promise<SubmitVoteResult> {
  const parsed = submitVoteSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Invalid input" }
  }

  const { comment_id, value } = parsed.data

  const supabase = await createClient()
  const gate = await requireServerAuth(supabase)

  if (!gate.ok) {
    return { ok: false, error: "Sign in to vote." }
  }

  const { userId } = gate.auth

  const { data: existingVote } = await supabase
    .from("comment_votes")
    .select("value")
    .eq("user_id", userId)
    .eq("comment_id", comment_id)
    .single()

  if (existingVote) {
    if (existingVote.value === value) {
      const { error } = await supabase
        .from("comment_votes")
        .delete()
        .eq("user_id", userId)
        .eq("comment_id", comment_id)

      if (error) return { ok: false, error: "Could not remove vote." }
    } else {
      const { error } = await supabase
        .from("comment_votes")
        .update({ value })
        .eq("user_id", userId)
        .eq("comment_id", comment_id)

      if (error) return { ok: false, error: "Could not update vote." }
    }
  } else {
    const { error } = await supabase.from("comment_votes").insert({
      user_id: userId,
      comment_id,
      value,
    })

    if (error) return { ok: false, error: "Could not save vote." }
  }

  return { ok: true }
}

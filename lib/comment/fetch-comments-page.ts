"use server"

import { z } from "zod"

import {
  enrichParentsWithReplyPreviews,
  fetchParentCommentsPage,
  fetchThreadCommentsPage,
  fetchVotesForComments,
} from "@/lib/comment/queries"
import {
  INITIAL_REPLY_PREVIEW,
  type ParentCursor,
  type ReplyCursor,
} from "@/lib/comment/pagination"
import { pruneDeletedComments } from "@/lib/comment/comment-tree"
import { getServerAuth } from "@/lib/auth/server-session"
import { createClient } from "@/lib/supabase/server"
import type { CommentWithProfile } from "@/lib/comment/types"

const targetSchema = z.object({
  target_type: z.enum(["player", "match"]),
  target_id: z.number().int().positive(),
})

const parentCursorSchema = z.discriminatedUnion("sort", [
  z.object({
    sort: z.literal("top"),
    score: z.number().int(),
    id: z.number().int().positive(),
  }),
  z.object({
    sort: z.literal("new"),
    created_at: z.string(),
    id: z.number().int().positive(),
  }),
])

const fetchParentPageSchema = targetSchema.extend({
  sort: z.enum(["top", "new"]),
  cursor: parentCursorSchema.nullable().optional(),
})

const threadCursorSchema = z.object({
  created_at: z.string(),
  id: z.number().int().positive(),
})

const fetchThreadPageSchema = z.object({
  thread_root_id: z.number().int().positive(),
  cursor: threadCursorSchema.nullable().optional(),
})

export type FetchParentCommentsPageResult =
  | {
      ok: true
      comments: CommentWithProfile[]
      userVotes: Record<number, 1 | -1>
      nextCursor: ParentCursor | null
      hasMore: boolean
      replyPagination: Record<
        number,
        { hasMore: boolean; nextCursor: ReplyCursor | null }
      >
    }
  | { ok: false; error: string }

export async function fetchParentCommentsPageAction(
  input: unknown,
): Promise<FetchParentCommentsPageResult> {
  const parsed = fetchParentPageSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Invalid request." }
  }

  const { target_type, target_id, sort, cursor } = parsed.data
  const supabase = await createClient()
  const auth = await getServerAuth(supabase)

  const parentPage = await fetchParentCommentsPage(
    supabase,
    { targetType: target_type, targetId: target_id },
    sort,
    cursor ?? null,
  )

  if (parentPage.parents.length === 0) {
    return {
      ok: true,
      comments: [],
      userVotes: {},
      nextCursor: null,
      hasMore: false,
      replyPagination: {},
    }
  }

  const { parents, replyPagination } = await enrichParentsWithReplyPreviews(
    supabase,
    parentPage.parents,
    INITIAL_REPLY_PREVIEW,
  )

  const comments = pruneDeletedComments(parents)
  const userVotes = await fetchVotesForComments(
    supabase,
    auth?.userId ?? null,
    comments,
  )

  return {
    ok: true,
    comments,
    userVotes,
    nextCursor: parentPage.nextCursor,
    hasMore: parentPage.hasMore,
    replyPagination,
  }
}

export type FetchThreadCommentsPageResult =
  | {
      ok: true
      replies: CommentWithProfile[]
      userVotes: Record<number, 1 | -1>
      nextCursor: ReplyCursor | null
      hasMore: boolean
    }
  | { ok: false; error: string }

export async function fetchThreadCommentsPageAction(
  input: unknown,
): Promise<FetchThreadCommentsPageResult> {
  const parsed = fetchThreadPageSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Invalid request." }
  }

  const { thread_root_id, cursor } = parsed.data
  const supabase = await createClient()
  const auth = await getServerAuth(supabase)

  const page = await fetchThreadCommentsPage(supabase, thread_root_id, cursor ?? null)

  const userVotes = await fetchVotesForComments(
    supabase,
    auth?.userId ?? null,
    page.replies,
  )

  return {
    ok: true,
    replies: page.replies,
    userVotes,
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
  }
}

/** @deprecated Use fetchThreadCommentsPageAction */
export const fetchReplyCommentsPageAction = fetchThreadCommentsPageAction

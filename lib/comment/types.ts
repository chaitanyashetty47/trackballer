import { z } from "zod"

export type Team = {
  id: number
  name: string
  logo_url: string | null
}

export type CommentProfile = {
  id: string
  username: string | null
  display_name: string
  avatar_url: string | null
  favourite_club: Team | null
  favourite_national_team: Team | null
}

export type CommentWithProfile = {
  id: number
  body: string
  score: number
  upvote_count: number
  downvote_count: number
  created_at: string
  is_deleted: boolean
  parent_id: number | null
  user_id: string
  player_id: number | null
  fixture_id: number | null
  target_type: string
  profile: CommentProfile | null
  replies: CommentWithProfile[]
}

/** Client-only flag while a new comment is saving (shown faded). */
export type CommentDisplay = CommentWithProfile & {
  isPending?: boolean
  replies: CommentDisplay[]
}

export const submitCommentSchema = z.object({
  body: z.string().min(1, "Comment is required").max(280, "Max 280 characters"),
  target_type: z.enum(["player", "match"]),
  player_id: z.number().int().optional(),
  fixture_id: z.number().int().optional(),
  parent_id: z.number().int().optional(),
})

export type SubmitCommentInput = z.infer<typeof submitCommentSchema>

export const submitVoteSchema = z.object({
  comment_id: z.number().int(),
  value: z.enum(["1", "-1"]).transform((v) => (v === "1" ? 1 : -1)),
})

export type SubmitVoteInput = z.infer<typeof submitVoteSchema>

export const deleteCommentSchema = z.object({
  comment_id: z.number().int(),
})

export type DeleteCommentInput = z.infer<typeof deleteCommentSchema>

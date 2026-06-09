import { z } from "zod"

import { isValidCareerRatingValue, isValidRatingValue } from "@/lib/rating/engine"

export const submitMatchRatingSchema = z.object({
  fixtureId: z.number().int().positive(),
  playerId: z.number().int().positive(),
  value: z
    .number()
    .refine(isValidRatingValue, "Rating must be between 1 and 10 in 0.5 steps"),
})

export type SubmitMatchRatingInput = z.infer<typeof submitMatchRatingSchema>

export const submitCareerRatingSchema = z.object({
  playerId: z.number().int().positive(),
  value: z
    .number()
    .refine(
      isValidCareerRatingValue,
      "Rating must be a whole number between 1 and 100",
    ),
})

export type SubmitCareerRatingInput = z.infer<typeof submitCareerRatingSchema>

import { z } from "zod"

import { is18OrOlder } from "@/lib/onboarding/age"

export const onboardingStepSchema = z.union([z.literal(1), z.literal(2)])
export type OnboardingStep = z.infer<typeof onboardingStepSchema>

export const onboardingDraftSchema = z.object({
  step: onboardingStepSchema,
  dateOfBirth: z.string().nullable(),
  location: z.string().nullable(),
  favouriteClubId: z.number().int().nullable(),
  favouriteNationalTeamId: z.number().int().nullable(),
})

export type OnboardingDraft = z.infer<typeof onboardingDraftSchema>

export function createEmptyDraft(): OnboardingDraft {
  return {
    step: 1,
    dateOfBirth: null,
    location: null,
    favouriteClubId: null,
    favouriteNationalTeamId: null,
  }
}

const optionalLocation = z
  .string()
  .nullable()
  .transform((value) => (value?.trim() ? value.trim() : null))

export const completeOnboardingSchema = z.object({
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(is18OrOlder, "You must be 18 or older"),
  location: optionalLocation,
  favouriteClubId: z.number().int().nullable(),
  favouriteNationalTeamId: z.number().int().nullable(),
})

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>

export const teamOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  logo_url: z.string().nullable(),
  code: z.string().nullable(),
})

export type TeamOption = z.infer<typeof teamOptionSchema>

export const onboardingOptionsSchema = z.object({
  clubs: z.array(teamOptionSchema),
  nationalTeams: z.array(teamOptionSchema),
})

export type OnboardingOptions = z.infer<typeof onboardingOptionsSchema>

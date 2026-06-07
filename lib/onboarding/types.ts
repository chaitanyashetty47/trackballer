import { z } from "zod"

import { is18OrOlder } from "@/lib/onboarding/age"
import { countryCodeSchema } from "@/lib/profile/validate-username"
import { usernameSchema } from "@/lib/profile/validate-username"

export const onboardingStepSchema = z.union([z.literal(1), z.literal(2)])
export type OnboardingStep = z.infer<typeof onboardingStepSchema>

export const onboardingDraftSchema = z.object({
  step: onboardingStepSchema,
  username: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  countryCode: z.string().nullable(),
  favouriteClubId: z.number().int().nullable(),
  favouriteNationalTeamId: z.number().int().nullable(),
})

export type OnboardingDraft = z.infer<typeof onboardingDraftSchema>

export function createEmptyDraft(): OnboardingDraft {
  return {
    step: 1,
    username: null,
    dateOfBirth: null,
    countryCode: null,
    favouriteClubId: null,
    favouriteNationalTeamId: null,
  }
}

export const completeOnboardingSchema = z.object({
  username: usernameSchema,
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(is18OrOlder, "You must be 18 or older"),
  countryCode: countryCodeSchema,
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

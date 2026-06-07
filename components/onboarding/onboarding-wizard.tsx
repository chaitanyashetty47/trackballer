"use client"

import { useRouter } from "nextjs-toploader/app"
import { useCallback, useEffect, useState, useTransition } from "react"

import { StepAbout } from "@/components/onboarding/steps/step-about"
import { StepFavourites } from "@/components/onboarding/steps/step-favourites"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { refreshAuthSession } from "@/lib/auth/refresh-session"
import { is18OrOlder } from "@/lib/onboarding/age"
import { completeOnboarding } from "@/lib/onboarding/complete"
import { clearDraft, loadDraft, saveDraft } from "@/lib/onboarding/draft-storage"
import type { OnboardingDraft, OnboardingOptions } from "@/lib/onboarding/types"
import { validateUsernameFormat } from "@/lib/profile/validate-username"

const TOTAL_STEPS = 2

type OnboardingWizardProps = {
  options: OnboardingOptions
}

export function OnboardingWizard({ options }: OnboardingWizardProps) {
  const router = useRouter()
  const [draft, setDraft] = useState<OnboardingDraft>(() => loadDraft())
  const [dobError, setDobError] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [countryError, setCountryError] = useState<string | null>(null)
  const [finishError, setFinishError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    saveDraft(draft)
  }, [draft])

  const updateDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
  }, [])

  const progressValue = (draft.step / TOTAL_STEPS) * 100

  function validateStep1(): boolean {
    let valid = true

    if (!draft.username) {
      setUsernameError("Username is required.")
      valid = false
    } else {
      const formatError = validateUsernameFormat(draft.username)
      if (formatError) {
        setUsernameError(formatError)
        valid = false
      } else {
        setUsernameError(null)
      }
    }

    if (!draft.dateOfBirth) {
      setDobError("Date of birth is required.")
      valid = false
    } else if (!is18OrOlder(draft.dateOfBirth)) {
      setDobError("You must be 18 or older.")
      valid = false
    } else {
      setDobError(null)
    }

    if (!draft.countryCode) {
      setCountryError("Country of origin is required.")
      valid = false
    } else {
      setCountryError(null)
    }

    return valid
  }

  function handleContinue() {
    setFinishError(null)
    if (draft.step === 1) {
      if (!validateStep1()) return
      updateDraft({ step: 2 })
      return
    }
  }

  function handleBack() {
    setFinishError(null)
    if (draft.step > 1) {
      updateDraft({ step: 1 })
    }
  }

  function handleFinish() {
    setFinishError(null)
    if (!validateStep1()) {
      updateDraft({ step: 1 })
      return
    }

    clearDraft()

    startTransition(async () => {
      const result = await completeOnboarding({
        username: draft.username,
        dateOfBirth: draft.dateOfBirth,
        countryCode: draft.countryCode,
        favouriteClubId: draft.favouriteClubId,
        favouriteNationalTeamId: draft.favouriteNationalTeamId,
      })

      if (!result.ok) {
        setFinishError(result.error)
        saveDraft(draft)
        return
      }

      await refreshAuthSession()
      router.push("/")
      router.refresh()
    })
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6">
        <p className="eyebrow mb-2">Onboarding</p>
        <div className="mb-2 flex items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Set up your profile
          </h1>
          <span className="text-sm text-muted-foreground">
            Step {draft.step} of {TOTAL_STEPS}
          </span>
        </div>
        <Progress value={progressValue} />
      </div>

      {draft.step === 1 && (
        <StepAbout
          draft={draft}
          onChange={updateDraft}
          dobError={dobError}
          usernameError={usernameError}
          countryError={countryError}
        />
      )}
      {draft.step === 2 && (
        <StepFavourites
          draft={draft}
          options={options}
          onChange={updateDraft}
        />
      )}

      {finishError && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {finishError}
        </p>
      )}

      <div className="mt-8 flex gap-3">
        {draft.step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isPending}
            className="flex-1"
          >
            Back
          </Button>
        )}
        {draft.step < TOTAL_STEPS ? (
          <Button type="button" onClick={handleContinue} className="flex-1">
            Continue
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleFinish}
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? "Saving…" : "Finish — go to home"}
          </Button>
        )}
      </div>
    </div>
  )
}

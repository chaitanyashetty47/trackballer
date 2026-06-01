"use client"

import { DobDatePicker } from "@/components/onboarding/dob-date-picker"
import { Input } from "@/components/ui/input"
import type { OnboardingDraft } from "@/lib/onboarding/types"

type StepAboutProps = {
  draft: OnboardingDraft
  onChange: (patch: Partial<OnboardingDraft>) => void
  dobError: string | null
}

export function StepAbout({ draft, onChange, dobError }: StepAboutProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="h3 mb-1">About you</h2>
        <p className="body-sm text-muted-foreground">
          We need your date of birth to confirm you are 18 or older.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="date-of-birth" className="text-sm font-medium">
          Date of birth <span className="text-destructive">*</span>
        </label>
        <DobDatePicker
          id="date-of-birth"
          value={draft.dateOfBirth}
          onChange={(dateOfBirth) => onChange({ dateOfBirth })}
          error={dobError}
        />
        {dobError && (
          <p className="text-sm text-destructive" role="alert">
            {dobError}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="location" className="text-sm font-medium">
          Location <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input
          id="location"
          type="text"
          placeholder="City, country"
          value={draft.location ?? ""}
          onChange={(e) =>
            onChange({ location: e.target.value.trim() || null })
          }
          autoComplete="address-level2"
        />
      </div>
    </div>
  )
}

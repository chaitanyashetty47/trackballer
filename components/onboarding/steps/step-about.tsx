"use client"

import { useEffect, useState } from "react"

import { DobDatePicker } from "@/components/onboarding/dob-date-picker"
import { CountryDropdown } from "@/components/onboarding/country-dropdown"
import { Input } from "@/components/ui/input"
import type { OnboardingDraft } from "@/lib/onboarding/types"
import { normalizeUsername } from "@/lib/profile/validate-username"

type StepAboutProps = {
  draft: OnboardingDraft
  onChange: (patch: Partial<OnboardingDraft>) => void
  dobError: string | null
  usernameError: string | null
  countryError: string | null
}

export function StepAbout({
  draft,
  onChange,
  dobError,
  usernameError,
  countryError,
}: StepAboutProps) {
  const [usernameInput, setUsernameInput] = useState(draft.username ?? "")
  const [availability, setAvailability] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle")
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(
    null,
  )

  useEffect(() => {
    const normalized = normalizeUsername(usernameInput)

    if (!normalized) {
      setAvailability("idle")
      setAvailabilityMessage(null)
      return
    }

    const timer = window.setTimeout(async () => {
      setAvailability("checking")
      try {
        const res = await fetch(
          `/api/profile/username-available?username=${encodeURIComponent(normalized)}`,
        )
        const data = (await res.json()) as {
          available?: boolean
          error?: string
        }

        if (data.available) {
          setAvailability("available")
          setAvailabilityMessage("Username is available.")
          return
        }

        setAvailability(data.error ? "invalid" : "taken")
        setAvailabilityMessage(data.error ?? "That username is taken.")
      } catch {
        setAvailability("idle")
        setAvailabilityMessage(null)
      }
    }, 400)

    return () => window.clearTimeout(timer)
  }, [usernameInput])

  return (
    <div className="space-y-5">
      <div>
        <h2 className="h3 mb-1">About you</h2>
        <p className="body-sm text-muted-foreground">
          Pick your handle, confirm your age, and tell us where you are from.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="username" className="text-sm font-medium">
          Username <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            @
          </span>
          <Input
            id="username"
            type="text"
            className="pl-7"
            placeholder="chaitanya_47"
            value={usernameInput}
            onChange={(e) => {
              const value = e.target.value
              setUsernameInput(value)
              const normalized = normalizeUsername(value)
              onChange({ username: normalized || null })
            }}
            autoComplete="username"
            spellCheck={false}
          />
        </div>
        {usernameError ? (
          <p className="text-sm text-destructive" role="alert">
            {usernameError}
          </p>
        ) : availabilityMessage ? (
          <p
            className={`text-sm ${
              availability === "available"
                ? "text-emerald-600 dark:text-emerald-400"
                : availability === "checking"
                  ? "text-muted-foreground"
                  : "text-destructive"
            }`}
            role="status"
          >
            {availability === "checking" ? "Checking availability…" : availabilityMessage}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            3–20 characters. Lowercase letters, numbers, and underscores.
          </p>
        )}
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
        <label htmlFor="country-of-origin" className="text-sm font-medium">
          Country of origin <span className="text-destructive">*</span>
        </label>
        <CountryDropdown
          id="country-of-origin"
          valueAlpha2={draft.countryCode}
          onChange={(country) =>
            onChange({ countryCode: country.alpha2.toUpperCase() })
          }
          placeholder="Select your country"
        />
        {countryError ? (
          <p className="text-sm text-destructive" role="alert">
            {countryError}
          </p>
        ) : null}
      </div>
    </div>
  )
}

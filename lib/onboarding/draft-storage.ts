import {
  createEmptyDraft,
  onboardingDraftSchema,
  type OnboardingDraft,
} from "@/lib/onboarding/types"

const STORAGE_KEY = "penaltyboxd:onboarding-draft"

export function loadDraft(): OnboardingDraft {
  if (typeof window === "undefined") return createEmptyDraft()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyDraft()

    const parsed: unknown = JSON.parse(raw)
    const result = onboardingDraftSchema.safeParse(parsed)
    return result.success ? result.data : createEmptyDraft()
  } catch {
    return createEmptyDraft()
  }
}

export function saveDraft(draft: OnboardingDraft): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

export function clearDraft(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(STORAGE_KEY)
}

import { z } from "zod"

const USERNAME_PATTERN = /^[a-z][a-z0-9_]*$/

const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "help",
  "login",
  "mod",
  "moderator",
  "null",
  "official",
  "onboarding",
  "penaltyboxd",
  "profile",
  "search",
  "support",
  "system",
  "trackballer",
  "undefined",
  "worldcup",
  "www",
])

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase()
}

export function validateUsernameFormat(username: string): string | null {
  const normalized = normalizeUsername(username)

  if (normalized.length < 3 || normalized.length > 20) {
    return "Username must be 3–20 characters."
  }

  if (!USERNAME_PATTERN.test(normalized)) {
    return "Use lowercase letters, numbers, and underscores. Must start with a letter."
  }

  if (normalized.endsWith("_") || normalized.includes("__")) {
    return "Username cannot end with _ or contain consecutive underscores."
  }

  if (/^\d+$/.test(normalized)) {
    return "Username cannot be all numbers."
  }

  if (RESERVED_USERNAMES.has(normalized)) {
    return "That username is reserved."
  }

  return null
}

export const usernameSchema = z
  .string()
  .min(1, "Username is required.")
  .transform(normalizeUsername)
  .superRefine((value, ctx) => {
    const error = validateUsernameFormat(value)
    if (error) {
      ctx.addIssue({ code: "custom", message: error })
    }
  })

export const countryCodeSchema = z
  .string()
  .length(2, "Choose your country.")
  .regex(/^[A-Z]{2}$/, "Invalid country code.")

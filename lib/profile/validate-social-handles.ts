import { z } from "zod"

export type SocialPlatform = "twitter" | "instagram" | "tiktok" | "reddit"

const HANDLE_RULES: Record<
  SocialPlatform,
  { pattern: RegExp; maxLen: number; label: string }
> = {
  twitter: { pattern: /^[A-Za-z0-9_]{1,15}$/, maxLen: 15, label: "X (Twitter)" },
  instagram: {
    pattern: /^[A-Za-z0-9._]{1,30}$/,
    maxLen: 30,
    label: "Instagram",
  },
  tiktok: {
    pattern: /^[A-Za-z0-9._]{2,24}$/,
    maxLen: 24,
    label: "TikTok",
  },
  reddit: { pattern: /^[A-Za-z0-9_-]{3,20}$/, maxLen: 20, label: "Reddit" },
}

const URL_HOSTS: Record<SocialPlatform, string[]> = {
  twitter: ["twitter.com", "www.twitter.com", "x.com", "www.x.com"],
  instagram: ["instagram.com", "www.instagram.com"],
  tiktok: ["tiktok.com", "www.tiktok.com"],
  reddit: ["reddit.com", "www.reddit.com"],
}

function stripAt(handle: string): string {
  return handle.replace(/^@+/, "").trim()
}

/** Accept @handle or profile URL; return normalized handle or null if empty. */
export function normalizeSocialHandle(
  platform: SocialPlatform,
  raw: string | null | undefined,
): { ok: true; handle: string | null } | { ok: false; error: string } {
  const trimmed = raw?.trim() ?? ""
  if (!trimmed) return { ok: true, handle: null }

  const rules = HANDLE_RULES[platform]
  let candidate = stripAt(trimmed)

  if (/^https?:\/\//i.test(trimmed)) {
    let url: URL
    try {
      url = new URL(trimmed)
    } catch {
      return { ok: false, error: `Enter a valid ${rules.label} link or handle.` }
    }

    const host = url.hostname.toLowerCase()
    if (!URL_HOSTS[platform].includes(host)) {
      return { ok: false, error: `That link is not a ${rules.label} profile URL.` }
    }

    const parts = url.pathname.split("/").filter(Boolean)
    if (platform === "reddit") {
      const uIdx = parts.findIndex((p) => p === "u" || p === "user")
      candidate = uIdx >= 0 ? (parts[uIdx + 1] ?? "") : (parts[0] ?? "")
    } else if (platform === "tiktok" && parts[0] === "@") {
      candidate = parts[0].slice(1)
    } else if (platform === "tiktok" && parts[0]?.startsWith("@")) {
      candidate = parts[0].slice(1)
    } else {
      candidate = stripAt(parts[parts.length - 1] ?? "")
    }
  }

  candidate = stripAt(candidate)
  if (!candidate) {
    return { ok: false, error: `${rules.label} handle cannot be empty.` }
  }

  if (candidate.length > rules.maxLen || !rules.pattern.test(candidate)) {
    return {
      ok: false,
      error: `Enter a valid ${rules.label} handle (max ${rules.maxLen} characters).`,
    }
  }

  return { ok: true, handle: candidate }
}

function optionalSocialField(platform: SocialPlatform) {
  return z
    .union([z.string(), z.null(), z.undefined()])
    .transform((val, ctx) => {
      const result = normalizeSocialHandle(platform, val ?? null)
      if (!result.ok) {
        ctx.addIssue({ code: "custom", message: result.error })
        return z.NEVER
      }
      return result.handle
    })
}

export const socialHandlesSchema = z.object({
  twitterHandle: optionalSocialField("twitter"),
  instagramHandle: optionalSocialField("instagram"),
  tiktokHandle: optionalSocialField("tiktok"),
  redditHandle: optionalSocialField("reddit"),
})

export type SocialHandlesInput = z.infer<typeof socialHandlesSchema>

export function socialProfileUrl(
  platform: SocialPlatform,
  handle: string,
): string {
  switch (platform) {
    case "twitter":
      return `https://x.com/${handle}`
    case "instagram":
      return `https://instagram.com/${handle}`
    case "tiktok":
      return `https://www.tiktok.com/@${handle}`
    case "reddit":
      return `https://www.reddit.com/user/${handle}`
  }
}

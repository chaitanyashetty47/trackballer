import { normalizeXAvatarUrl } from "@/lib/profile/normalize-x-avatar-url"

export type AvatarSource = "google" | "x"

export type ProfileAvatarFields = {
  avatar_url?: string | null
  google_avatar_url?: string | null
  x_avatar_url?: string | null
  avatar_source?: AvatarSource | null
}

function isHttpsUrl(value: string | null | undefined): value is string {
  return typeof value === "string" && value.startsWith("https://")
}

function xAvatarUrl(value: string | null | undefined): string | null {
  return normalizeXAvatarUrl(value)
}

export function defaultAvatarSource(fields: ProfileAvatarFields): AvatarSource {
  if (isHttpsUrl(fields.google_avatar_url) && !isHttpsUrl(fields.x_avatar_url)) {
    return "google"
  }
  if (isHttpsUrl(fields.x_avatar_url) && !isHttpsUrl(fields.google_avatar_url)) {
    return "x"
  }
  return "google"
}

/** Public profile photo from stored provider URLs and user preference. */
export function resolveDisplayAvatar(fields: ProfileAvatarFields): string | null {
  const source = fields.avatar_source ?? defaultAvatarSource(fields)

  if (source === "x" && isHttpsUrl(fields.x_avatar_url)) {
    return xAvatarUrl(fields.x_avatar_url)
  }
  if (source === "google" && isHttpsUrl(fields.google_avatar_url)) {
    return fields.google_avatar_url
  }

  return (
    fields.google_avatar_url ??
    xAvatarUrl(fields.x_avatar_url) ??
    fields.avatar_url ??
    null
  )
}

export function buildAvatarCacheUpdate(
  fields: ProfileAvatarFields,
): Pick<ProfileAvatarFields, "avatar_url" | "avatar_source"> {
  const avatar_source = fields.avatar_source ?? defaultAvatarSource(fields)
  return {
    avatar_source,
    avatar_url: resolveDisplayAvatar({ ...fields, avatar_source }),
  }
}

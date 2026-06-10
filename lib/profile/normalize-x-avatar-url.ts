/** X OAuth returns 48×48 avatars with `_normal` in the filename; strip for full size. */
export function normalizeXAvatarUrl(url: string | null | undefined): string | null {
  if (typeof url !== "string" || !url.startsWith("https://")) return null
  if (!url.includes("twimg.com")) return url
  return url.replace(/_normal(?=\.(jpe?g|png|webp)(\?|$))/i, "")
}

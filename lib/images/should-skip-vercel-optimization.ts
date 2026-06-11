import type { ImageProps } from "next/image"

/** CDN hosts that already serve sized football assets — skip Vercel transforms. */
const SKIP_OPTIMIZATION_HOSTS = new Set([
  "media.api-sports.io",
  "images.fotmob.com",
])

function hostFromUrl(src: string): string | null {
  try {
    return new URL(src).hostname
  } catch {
    return null
  }
}

/**
 * When true, pass `unoptimized` to next/image to avoid Vercel Image Optimization
 * transforms (local SVGs, API-Football / FotMob CDN photos).
 */
export function shouldSkipVercelImageOptimization(src: ImageProps["src"]): boolean {
  if (typeof src === "string") {
    if (src.startsWith("/")) return true
    if (src.endsWith(".svg")) return true
    const host = hostFromUrl(src)
    return host != null && SKIP_OPTIMIZATION_HOSTS.has(host)
  }

  if (typeof src === "object" && src !== null && "src" in src) {
    const path = String(src.src)
    return path.startsWith("/") || path.endsWith(".svg")
  }

  return false
}

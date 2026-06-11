import Image, { type ImageProps } from "next/image"

import { shouldSkipVercelImageOptimization } from "@/lib/images/should-skip-vercel-optimization"

/**
 * next/image wrapper: skips Vercel optimization for catalog CDN photos and local SVGs.
 */
export function CatalogImage(props: ImageProps) {
  const skip = shouldSkipVercelImageOptimization(props.src)
  return <Image {...props} unoptimized={props.unoptimized ?? skip} />
}

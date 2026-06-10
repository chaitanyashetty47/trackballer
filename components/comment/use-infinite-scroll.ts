"use client"

import { useEffect, useRef } from "react"

type UseInfiniteScrollOptions = {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  rootMargin?: string
}

/** Fire onLoadMore when the sentinel enters the viewport. */
export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = "200px",
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const onLoadMoreRef = useRef(onLoadMore)

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore
  }, [onLoadMore])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasMore) return

    const margin =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "0px"
        : rootMargin

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoading) {
          onLoadMoreRef.current()
        }
      },
      { rootMargin: margin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, isLoading, rootMargin])

  return sentinelRef
}

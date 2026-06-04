"use client"

import type { ReactNode } from "react"

import { useMounted } from "@/hooks/use-mounted"
import { cn } from "@/lib/utils"

type HydrationGateProps = {
  children: ReactNode
  /** Shown on server and until the browser has mounted (same layout, no inputs). */
  fallback: ReactNode
  className?: string
}

export function HydrationGate({ children, fallback, className }: HydrationGateProps) {
  const mounted = useMounted()

  if (!mounted) {
    return <div className={cn(className)} suppressHydrationWarning>{fallback}</div>
  }

  return <>{children}</>
}

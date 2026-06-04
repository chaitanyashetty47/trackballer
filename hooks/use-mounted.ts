"use client"

import { useEffect, useState } from "react"

/** True after the first client paint — avoids hydration mismatches from browser extensions on form fields. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}

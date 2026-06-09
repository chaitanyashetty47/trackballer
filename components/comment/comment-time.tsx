"use client"

import { useEffect, useState } from "react"

import {
  formatCommentDate,
  getCommentTimeSince,
} from "@/lib/comment/format-time"

type CommentTimeProps = {
  dateString: string
  pending?: boolean
}

/**
 * Renders a stable date on the server and first client paint, then switches
 * to relative time after hydration to avoid locale/clock mismatches.
 */
export function CommentTime({ dateString, pending = false }: CommentTimeProps) {
  const [label, setLabel] = useState(() => formatCommentDate(dateString))

  useEffect(() => {
    if (pending) return

    const refresh = () => setLabel(getCommentTimeSince(dateString))
    refresh()
    const id = window.setInterval(refresh, 60_000)
    return () => window.clearInterval(id)
  }, [dateString, pending])

  if (pending) {
    return <span>posting…</span>
  }

  return <span>{label}</span>
}

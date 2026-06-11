"use client"

import { CalendarDays } from "lucide-react"

import { useMounted } from "@/hooks/use-mounted"
import { formatMatchKickoffLocal } from "@/lib/match/score"

type MatchKickoffDateTimeProps = {
  iso: string
}

/** Kickoff in the viewer's local timezone (match hero meta row). */
export function MatchKickoffDateTime({ iso }: MatchKickoffDateTimeProps) {
  const mounted = useMounted()

  return (
    <span className="inline-flex items-center gap-1">
      <CalendarDays className="size-3.5 shrink-0" aria-hidden />
      <time dateTime={iso}>
        {mounted ? formatMatchKickoffLocal(iso) : "–"}
      </time>
    </span>
  )
}

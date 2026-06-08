"use client"

import { useCallback, useEffect, useState } from "react"

import type { MatchLineupPlayer } from "@/lib/match/types"
import { isValidRatingValue } from "@/lib/rating/engine"

type UseRatingPanelArgs = {
  open: boolean
  players: MatchLineupPlayer[]
  activeIndex: number
  onClose: () => void
  onIndexChange: (index: number) => void
}

export function useRatingPanel({
  open,
  players,
  activeIndex,
  onClose,
  onIndexChange,
}: UseRatingPanelArgs) {
  const player = players[activeIndex]
  const [value, setValue] = useState(7.5)

  const syncValueFromPlayer = useCallback((p: MatchLineupPlayer | undefined) => {
    if (p?.userRating != null && isValidRatingValue(p.userRating)) {
      setValue(p.userRating)
    } else {
      setValue(7.5)
    }
  }, [])

  useEffect(() => {
    syncValueFromPlayer(player)
  }, [activeIndex, player, syncValueFromPlayer])

  useEffect(() => {
    if (!open) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose()
        return
      }
      if (e.key === "ArrowLeft" && activeIndex > 0) {
        onIndexChange(activeIndex - 1)
      }
      if (e.key === "ArrowRight" && activeIndex < players.length - 1) {
        onIndexChange(activeIndex + 1)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, activeIndex, players.length, onClose, onIndexChange])

  const canGoPrev = activeIndex > 0
  const canGoNext = activeIndex < players.length - 1

  return {
    player,
    value,
    setValue,
    canGoPrev,
    canGoNext,
  }
}

"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { isValidRatingValue } from "@/lib/rating/engine"
import { cn } from "@/lib/utils"

export type RatingSheetSubject = {
  playerId: number
  name: string
  context: string
  initialValue?: number | null
}

type RatingSheetProps = {
  subject: RatingSheetSubject | null
  onClose: () => void
  onSubmit: (value: number) => void | Promise<void>
  isSubmitting?: boolean
}

export function RatingSheet({
  subject,
  onClose,
  onSubmit,
  isSubmitting = false,
}: RatingSheetProps) {
  const [value, setValue] = useState(7.5)

  useEffect(() => {
    if (subject?.initialValue != null && isValidRatingValue(subject.initialValue)) {
      setValue(subject.initialValue)
    } else {
      setValue(7.5)
    }
  }, [subject])

  if (!subject) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-labelledby="rating-sheet-title"
        className={cn(
          "w-full max-w-md rounded-t-2xl border border-border bg-card p-5 shadow-lg sm:rounded-2xl",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
        <h2 id="rating-sheet-title" className="text-lg font-semibold">
          Rate {subject.name}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{subject.context}</p>

        <p className="mt-6 text-center font-mono text-4xl font-bold tabular-nums">
          {value.toFixed(1)}
        </p>

        <input
          type="range"
          min={1}
          max={10}
          step={0.5}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="mt-4 w-full accent-primary"
          aria-label="Rating value"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>1</span>
          <span>10</span>
        </div>

        <div className="mt-6 flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            disabled={isSubmitting}
            onClick={() => onSubmit(value)}
          >
            {isSubmitting ? "Saving…" : "Submit rating"}
          </Button>
        </div>
      </div>
    </div>
  )
}

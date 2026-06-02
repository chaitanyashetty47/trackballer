"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { isValidRatingValue } from "@/lib/rating/engine"
import { submitCareerRating } from "@/lib/rating/submit-career-rating"

type PlayerCareerRatingCtaProps = {
  playerId: number
  playerName: string
  canRate: boolean
  initialValue: number | null
}

export function PlayerCareerRatingCta({
  playerId,
  playerName,
  canRate,
  initialValue,
}: PlayerCareerRatingCtaProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(
    initialValue != null && isValidRatingValue(initialValue) ? initialValue : 7.5,
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function submit() {
    setError(null)
    startTransition(async () => {
      const result = await submitCareerRating({ playerId, value })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setOpen(false)
      router.refresh()
    })
  }

  if (!canRate) {
    return (
      <Link href="/login" className={buttonVariants({ size: "sm", className: "mt-2" })}>
        Sign in to rate career
      </Link>
    )
  }

  return (
    <>
      <div className="mt-2 flex flex-col items-center gap-1">
        <Button size="sm" onClick={() => setOpen(true)}>
          {initialValue == null ? "Rate career" : "Edit career rating"}
        </Button>
        <p className="text-xs text-muted-foreground">
          {initialValue == null
            ? "You have not rated this career yet."
            : `You rated their career: ${initialValue.toFixed(1)} / 10`}
        </p>
      </div>

      {!open ? null : (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-labelledby="career-rating-title"
            className="w-full max-w-md rounded-t-2xl border border-border bg-card p-5 shadow-lg sm:rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
            <h2 id="career-rating-title" className="text-center text-lg font-semibold">
              Rate {playerName}
            </h2>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Rate overall career from 1 to 10.
            </p>

            <p className="mt-4 text-center font-mono text-4xl font-bold tabular-nums">
              {value.toFixed(1)}
            </p>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={value}
              onChange={(event) => setValue(Number(event.target.value))}
              className="mt-4 w-full accent-primary"
              aria-label="Career rating value"
              aria-valuetext={`${value.toFixed(1)} out of 10`}
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>10</span>
            </div>

            {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="button" onClick={submit} disabled={isPending}>
                {isPending ? "Saving..." : "Submit rating"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

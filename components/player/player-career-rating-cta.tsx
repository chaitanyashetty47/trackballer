"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { createPortal } from "react-dom"

import { Button, buttonVariants } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useMounted } from "@/hooks/use-mounted"
import { isValidRatingValue } from "@/lib/rating/engine"
import { submitCareerRating } from "@/lib/rating/submit-career-rating"
import { cn } from "@/lib/utils"

const CAREER_RATING_MIN = 1
const CAREER_RATING_MAX = 10
const CAREER_RATING_STEP = 0.5

type PlayerCareerRatingCtaProps = {
  playerId: number
  playerName: string
  canRate: boolean
  initialValue: number | null
  /** Header pill (FotMob-style) vs stacked default. */
  layout?: "default" | "header"
  className?: string
}

export function PlayerCareerRatingCta({
  playerId,
  playerName,
  canRate,
  initialValue,
  layout = "default",
  className,
}: PlayerCareerRatingCtaProps) {
  const router = useRouter()
  const mounted = useMounted()
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

  const isHeader = layout === "header"
  const buttonLabel =
    initialValue == null
      ? isHeader
        ? "Rate"
        : "Rate career"
      : isHeader
        ? "Edit"
        : "Edit career rating"

  const personalCopy =
    initialValue == null
      ? "You have not rated this career yet."
      : `You rated their career: ${initialValue.toFixed(1)} / 10`

  const dialog =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
            role="presentation"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-labelledby="career-rating-title"
              className="w-full max-w-md rounded-t-2xl border border-border bg-card p-5 text-foreground shadow-lg sm:rounded-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
              <h2
                id="career-rating-title"
                className="text-center text-lg font-semibold text-foreground"
              >
                Rate {playerName}
              </h2>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                Rate overall career from 1 to 10.
              </p>

              <p className="mt-4 text-center font-mono text-4xl font-bold tabular-nums text-primary">
                {value.toFixed(1)}
              </p>
              <Slider
                min={CAREER_RATING_MIN}
                max={CAREER_RATING_MAX}
                step={CAREER_RATING_STEP}
                value={[value]}
                onValueChange={(next) => {
                  const values = typeof next === "number" ? [next] : [...next]
                  if (values.length >= 1) setValue(values[0])
                }}
                className="mt-4 w-full"
                aria-label="Career rating value"
                aria-valuetext={`${value.toFixed(1)} out of 10`}
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>10</span>
              </div>

              {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={submit} disabled={isPending}>
                  {isPending ? "Saving..." : "Submit rating"}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null

  if (!canRate) {
    return (
      <Link
        href="/login"
        className={cn(
          buttonVariants({
            size: "sm",
            variant: isHeader ? "outline" : "default",
            className: cn(
              isHeader &&
                "shrink-0 border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20",
            ),
          }),
          className,
        )}
      >
        {isHeader ? "Sign in" : "Sign in to rate career"}
      </Link>
    )
  }

  return (
    <>
      <div
        className={cn(
          isHeader ? "flex shrink-0 flex-col items-end gap-1" : "mt-2 flex flex-col items-center gap-1",
          className,
        )}
      >
        <Button
          size="sm"
          variant={isHeader ? "outline" : "default"}
          className={cn(
            isHeader &&
              "border-primary-foreground/40 bg-primary-foreground text-primary hover:bg-primary-foreground/90",
          )}
          onClick={() => setOpen(true)}
        >
          {buttonLabel}
        </Button>
        {!isHeader && (
          <p className="text-xs text-muted-foreground">{personalCopy}</p>
        )}
      </div>

      {dialog}
    </>
  )
}

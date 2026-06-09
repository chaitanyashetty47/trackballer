"use client"

import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import {
  careerColorAtScore,
  careerSliderPercent,
  careerTrackGradient,
} from "@/lib/rating/career-slider-colors"
import {
  CAREER_RATING_MAX,
  CAREER_RATING_MIN,
  careerTierLabel,
  tierForScore,
} from "@/lib/rating/career-tier"
import { cn } from "@/lib/utils"

type CareerRatingSliderProps = {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  className?: string
  "aria-label"?: string
}

export function CareerRatingSlider({
  value,
  onValueChange,
  min = CAREER_RATING_MIN,
  max = CAREER_RATING_MAX,
  className,
  "aria-label": ariaLabel = "Career rating value",
}: CareerRatingSliderProps) {
  const fillPercent = careerSliderPercent(value, min, max)
  const tierLabel = careerTierLabel(tierForScore(value))
  const thumbColor = careerColorAtScore(value)
  // Inner gradient is sized to the full track so it is revealed (not stretched)
  // as the fill grows: fill width = fillPercent%, so inner width = 100/fraction.
  const revealWidth = `${10000 / Math.max(fillPercent, 0.0001)}%`

  return (
    <div className={cn("w-full", className)}>
      <SliderPrimitive.Root
        className="data-horizontal:w-full"
        data-slot="career-rating-slider"
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={(next) => {
          const values = typeof next === "number" ? [next] : [...next]
          if (values.length >= 1) onValueChange(Math.round(values[0]))
        }}
        thumbAlignment="edge"
      >
        <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none">
          <SliderPrimitive.Track
            data-slot="career-slider-track"
            className="relative h-3 w-full grow overflow-hidden rounded-full bg-muted shadow-[inset_0_1px_3px_rgba(0,0,0,0.18),inset_0_-1px_0_rgba(255,255,255,0.4)]"
          >
            <SliderPrimitive.Indicator
              data-slot="career-slider-fill"
              className="relative h-full overflow-hidden rounded-full transition-[width] duration-75 ease-out select-none"
            >
              <div
                aria-hidden
                className="absolute inset-y-0 left-0 h-full"
                style={{ width: revealWidth, background: careerTrackGradient() }}
              />
            </SliderPrimitive.Indicator>
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            data-slot="career-slider-thumb"
            className="relative block size-5 shrink-0 rounded-full border-2 border-white bg-white shadow-md ring-1 ring-black/10 transition-shadow select-none after:absolute after:-inset-3 hover:shadow-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring active:shadow-lg"
            style={{
              boxShadow: `0 2px 8px rgba(0,0,0,0.18), inset 0 0 0 3px ${thumbColor}`,
            }}
            aria-valuetext={`${value} out of 100, ${tierLabel}`}
          />
        </SliderPrimitive.Control>
      </SliderPrimitive.Root>
      <div
        aria-hidden
        className="mt-1 flex justify-between text-xs text-muted-foreground tabular-nums"
      >
        <span>{min}</span>
        <span
          className="font-medium"
          style={{ color: thumbColor, width: `${fillPercent}%`, textAlign: "right" }}
        >
          {tierLabel}
        </span>
        <span>{max}</span>
      </div>
    </div>
  )
}

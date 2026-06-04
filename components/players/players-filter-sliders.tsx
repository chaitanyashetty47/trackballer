"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export const PLAYER_AGE_MIN = 16
export const PLAYER_AGE_MAX = 45
export const PLAYER_RATING_MIN = 1
export const PLAYER_RATING_MAX = 10
export const PLAYER_RATING_STEP = 0.5

export function isFullAgeRange(range: [number, number]): boolean {
  return range[0] <= PLAYER_AGE_MIN && range[1] >= PLAYER_AGE_MAX
}

export function isNoMinRating(value: number): boolean {
  return value <= PLAYER_RATING_MIN
}

export function formatRatingValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function sliderValues(next: number | readonly number[]): number[] {
  if (typeof next === "number") return [next]
  return [...next]
}

type PlayersAgeRangeSliderProps = {
  id: string
  value: [number, number]
  onValueChange: (value: [number, number]) => void
}

export function PlayersAgeRangeSlider({
  id,
  value,
  onValueChange,
}: PlayersAgeRangeSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>Age</Label>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {value[0]}–{value[1]}
        </span>
      </div>
      <Slider
        id={id}
        min={PLAYER_AGE_MIN}
        max={PLAYER_AGE_MAX}
        step={1}
        value={value}
        onValueChange={(next) => {
          const values = sliderValues(next)
          if (values.length >= 2) {
            onValueChange([values[0], values[1]])
          }
        }}
        className="w-full"
        aria-label="Age range"
      />
    </div>
  )
}

type PlayersRatingSliderProps = {
  id: string
  value: number
  onValueChange: (value: number) => void
}

export function PlayersRatingSlider({
  id,
  value,
  onValueChange,
}: PlayersRatingSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>Min rating</Label>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {isNoMinRating(value) ? "Any" : `${formatRatingValue(value)}+`}
        </span>
      </div>
      <Slider
        id={id}
        min={PLAYER_RATING_MIN}
        max={PLAYER_RATING_MAX}
        step={PLAYER_RATING_STEP}
        value={[value]}
        onValueChange={(next) => {
          const values = sliderValues(next)
          if (values.length >= 1) onValueChange(values[0])
        }}
        className="w-full"
        aria-label="Minimum rating"
      />
    </div>
  )
}

import { careerTierCssVar, tierForScore } from "@/lib/rating/career-tier"

/** Full-track tier spectrum for the career slider (1–100 scale). */
export function careerTrackGradient(): string {
  return [
    "linear-gradient(to right,",
    "var(--rating-unwatchable) 0%,",
    "var(--rating-bad) 29%,",
    "var(--rating-below-average) 39%,",
    "var(--rating-average) 49%,",
    "var(--rating-good) 59%,",
    "var(--rating-great) 69%,",
    "var(--rating-world-class) 79%,",
    "var(--rating-elite) 89%,",
    "var(--rating-elite) 100%)",
  ].join(" ")
}

/** CSS var for thumb accent at a given OVR. */
export function careerColorAtScore(score: number): string {
  return `var(${careerTierCssVar(tierForScore(score))})`
}

/** 0–100 percentage for slider fill width. */
export function careerSliderPercent(score: number, min = 1, max = 100): number {
  const clamped = Math.min(max, Math.max(min, score))
  return ((clamped - min) / (max - min)) * 100
}

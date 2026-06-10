import type { FixtureView } from "@/lib/catalog/types"

/** Build a /world-cup link for a given round + view, keeping the URL tidy. */
export function buildWorldCupHref(round: string, view: FixtureView): string {
  const params = new URLSearchParams()
  params.set("round", round)
  // "upcoming" is the default, so leave it out to keep shareable URLs short.
  if (view === "finished") {
    params.set("view", view)
  }
  return `/world-cup?${params.toString()}`
}

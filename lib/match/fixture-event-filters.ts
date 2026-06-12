import { filterVarCancelledCards, type VarCardEventLike } from "@/lib/match/var-card-events"
import { filterVarCancelledGoals, type VarGoalEventLike } from "@/lib/match/var-goal-events"

type FixtureEventLike = VarGoalEventLike & VarCardEventLike

/** Sync + display: strip goals and cards overturned by VAR. */
export function filterDisplayFixtureEvents<T extends FixtureEventLike>(
  events: readonly T[],
): T[] {
  return filterVarCancelledCards(filterVarCancelledGoals(events))
}

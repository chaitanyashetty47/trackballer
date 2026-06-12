/** Shared shape for fixture event rows used in VAR goal filtering. */
export type VarGoalEventLike = {
  type: string
  detail?: string | null
  team_id?: number | null
  teamId?: number | null
  minute: number
  extra_minute?: number | null
  extraMinute?: number | null
}

/** Minute key for matching a Goal row to a VAR cancellation at the same stoppage time. */
export function goalStoppageKey(
  teamId: number | null | undefined,
  minute: number,
  extraMinute: number | null | undefined,
): string | null {
  if (teamId == null) return null
  return `${teamId}:${minute}:${extraMinute ?? 0}`
}

/** API-Football VAR row: type "Var", detail e.g. "Goal cancelled" / "Goal Disallowed". */
export function isVarGoalCancellation(
  type: string,
  detail: string | null | undefined,
): boolean {
  if (type.toLowerCase() !== "var") return false
  if (!detail) return false
  const normalized = detail.toLowerCase()
  return (
    normalized.includes("goal cancelled") ||
    normalized.includes("goal disallowed") ||
    normalized.includes("goal canceled")
  )
}

export function buildVarCancelledGoalKeys(
  events: ReadonlyArray<VarGoalEventLike>,
): Set<string> {
  const keys = new Set<string>()
  for (const event of events) {
    if (!isVarGoalCancellation(event.type, event.detail)) continue
    const teamId = event.team_id ?? event.teamId ?? null
    const key = goalStoppageKey(
      teamId,
      event.minute,
      event.extra_minute ?? event.extraMinute,
    )
    if (key) keys.add(key)
  }
  return keys
}

export function isGoalVoidedByVar(
  goal: Pick<VarGoalEventLike, "team_id" | "teamId" | "minute" | "extra_minute" | "extraMinute">,
  cancelledKeys: Set<string>,
): boolean {
  const teamId = goal.team_id ?? goal.teamId ?? null
  const key = goalStoppageKey(teamId, goal.minute, goal.extra_minute ?? goal.extraMinute)
  return key != null && cancelledKeys.has(key)
}

/** Drop Goal rows VAR overturned; keep Var rows and other event types. */
export function filterVarCancelledGoals<T extends VarGoalEventLike>(
  events: readonly T[],
): T[] {
  const cancelledKeys = buildVarCancelledGoalKeys(events)
  if (cancelledKeys.size === 0) return [...events]

  return events.filter((event) => {
    if (event.type !== "Goal") return true
    return !isGoalVoidedByVar(event, cancelledKeys)
  })
}

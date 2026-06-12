/** Shared shape for fixture event rows used in VAR card filtering. */
export type VarCardEventLike = {
  type: string
  detail?: string | null
  player_id?: number | null
  playerId?: number | null
  team_id?: number | null
  teamId?: number | null
  minute: number
  extra_minute?: number | null
  extraMinute?: number | null
}

/** Match a Card row to a VAR overturn at the same stoppage time. */
export function cardStoppageKey(
  playerId: number | null | undefined,
  teamId: number | null | undefined,
  minute: number,
  extraMinute: number | null | undefined,
): string | null {
  if (playerId != null) {
    return `p:${playerId}:${minute}:${extraMinute ?? 0}`
  }
  if (teamId != null) {
    return `t:${teamId}:${minute}:${extraMinute ?? 0}`
  }
  return null
}

/** API-Football Var row overturning a card, e.g. "Card cancelled". */
export function isVarCardCancellation(
  type: string,
  detail: string | null | undefined,
): boolean {
  if (type.toLowerCase() !== "var") return false
  if (!detail) return false

  const normalized = detail.toLowerCase()
  if (normalized.includes("card upgrade")) return false
  if (normalized.includes("card confirmed")) return false

  return (
    normalized.includes("card cancelled") ||
    normalized.includes("card canceled") ||
    normalized.includes("red card cancelled") ||
    normalized.includes("red card canceled") ||
    normalized.includes("yellow card cancelled") ||
    normalized.includes("yellow card canceled")
  )
}

export function buildVarCancelledCardKeys(
  events: ReadonlyArray<VarCardEventLike>,
): Set<string> {
  const keys = new Set<string>()
  for (const event of events) {
    if (!isVarCardCancellation(event.type, event.detail)) continue
    const key = cardStoppageKey(
      event.player_id ?? event.playerId,
      event.team_id ?? event.teamId,
      event.minute,
      event.extra_minute ?? event.extraMinute,
    )
    if (key) keys.add(key)
  }
  return keys
}

export function isCardVoidedByVar(
  card: Pick<
    VarCardEventLike,
    "player_id" | "playerId" | "team_id" | "teamId" | "minute" | "extra_minute" | "extraMinute"
  >,
  cancelledKeys: Set<string>,
): boolean {
  const key = cardStoppageKey(
    card.player_id ?? card.playerId,
    card.team_id ?? card.teamId,
    card.minute,
    card.extra_minute ?? card.extraMinute,
  )
  return key != null && cancelledKeys.has(key)
}

/** Drop Card rows VAR overturned; keep Var rows and other event types. */
export function filterVarCancelledCards<T extends VarCardEventLike>(
  events: readonly T[],
): T[] {
  const cancelledKeys = buildVarCancelledCardKeys(events)
  if (cancelledKeys.size === 0) return [...events]

  return events.filter((event) => {
    if (event.type !== "Card") return true
    return !isCardVoidedByVar(event, cancelledKeys)
  })
}

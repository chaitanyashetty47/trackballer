const POSITION_LABELS: Record<string, string> = {
  GK: "Goalkeeper",
  DEF: "Defender",
  MID: "Midfielder",
  FWD: "Forward",
}

/** Short display label for normalized GK/DEF/MID/FWD codes. */
export function positionDisplayLabel(position: string | null): string | null {
  if (!position) return null
  const key = position.toUpperCase()
  return POSITION_LABELS[key] ?? position
}

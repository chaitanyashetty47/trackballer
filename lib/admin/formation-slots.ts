export type FormationId = "4-3-3" | "4-4-2" | "3-5-2"

export type PitchSlot = {
  key: string
  label: string
  /** Vertical position on mini pitch (0 = top, 100 = bottom). */
  top: number
  /** Horizontal position (0 = left, 100 = right). */
  left: number
}

export type FormationTemplate = {
  id: FormationId
  label: string
  slots: PitchSlot[]
}

/** Editorial mini-pitch positions — not match LineupPitch coordinates. */
export const FORMATION_TEMPLATES: FormationTemplate[] = [
  {
    id: "4-3-3",
    label: "4-3-3",
    slots: [
      { key: "gk", label: "GK", top: 88, left: 50 },
      { key: "lb", label: "LB", top: 72, left: 12 },
      { key: "cb1", label: "CB", top: 76, left: 35 },
      { key: "cb2", label: "CB", top: 76, left: 65 },
      { key: "rb", label: "RB", top: 72, left: 88 },
      { key: "lm", label: "LM", top: 52, left: 18 },
      { key: "cm", label: "CM", top: 50, left: 50 },
      { key: "rm", label: "RM", top: 52, left: 82 },
      { key: "lw", label: "LW", top: 28, left: 15 },
      { key: "st", label: "ST", top: 22, left: 50 },
      { key: "rw", label: "RW", top: 28, left: 85 },
    ],
  },
  {
    id: "4-4-2",
    label: "4-4-2",
    slots: [
      { key: "gk", label: "GK", top: 88, left: 50 },
      { key: "lb", label: "LB", top: 72, left: 12 },
      { key: "cb1", label: "CB", top: 76, left: 35 },
      { key: "cb2", label: "CB", top: 76, left: 65 },
      { key: "rb", label: "RB", top: 72, left: 88 },
      { key: "lm", label: "LM", top: 50, left: 12 },
      { key: "cm1", label: "CM", top: 52, left: 38 },
      { key: "cm2", label: "CM", top: 52, left: 62 },
      { key: "rm", label: "RM", top: 50, left: 88 },
      { key: "st1", label: "ST", top: 24, left: 38 },
      { key: "st2", label: "ST", top: 24, left: 62 },
    ],
  },
  {
    id: "3-5-2",
    label: "3-5-2",
    slots: [
      { key: "gk", label: "GK", top: 88, left: 50 },
      { key: "cb1", label: "CB", top: 76, left: 25 },
      { key: "cb2", label: "CB", top: 78, left: 50 },
      { key: "cb3", label: "CB", top: 76, left: 75 },
      { key: "lwb", label: "LWB", top: 58, left: 8 },
      { key: "dm", label: "DM", top: 54, left: 50 },
      { key: "cm", label: "CM", top: 48, left: 35 },
      { key: "rwb", label: "RWB", top: 58, left: 92 },
      { key: "am", label: "AM", top: 38, left: 50 },
      { key: "st1", label: "ST", top: 22, left: 38 },
      { key: "st2", label: "ST", top: 22, left: 62 },
    ],
  },
]

export function getFormationTemplate(id: FormationId): FormationTemplate {
  const found = FORMATION_TEMPLATES.find((f) => f.id === id)
  return found ?? FORMATION_TEMPLATES[0]!
}

export function formationSlotKeys(id: FormationId): string[] {
  return getFormationTemplate(id).slots.map((s) => s.key)
}

export function isFormationId(value: string): value is FormationId {
  return FORMATION_TEMPLATES.some((f) => f.id === value)
}

/** Map vertical pitch coords to horizontal (GK on the left). */
export function getSlotPosition(
  slot: PitchSlot,
  orientation: "vertical" | "horizontal",
): { top: number; left: number } {
  if (orientation === "vertical") {
    return { top: slot.top, left: slot.left }
  }
  return { top: slot.left, left: 100 - slot.top }
}

export function countFilledSlots(
  slotKeys: string[],
  assignments: Record<string, unknown | undefined>,
): number {
  return slotKeys.filter((key) => assignments[key] != null).length
}
